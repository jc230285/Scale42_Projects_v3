import os
import psycopg2
from psycopg2 import sql
import urllib.parse

# Get environment variables
supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not service_role_key:
    print("Missing environment variables")
    exit(1)

# Parse the Supabase URL to get connection details
parsed_url = urllib.parse.urlparse(supabase_url)
host = parsed_url.hostname
project_id = parsed_url.path.lstrip('/')

# Construct connection string for Supabase
# Supabase uses a specific connection format
conn_string = f"postgresql://postgres:{service_role_key}@{host}:5432/postgres?sslmode=require"

print(f"Connecting to: {host}")

try:
    conn = psycopg2.connect(conn_string)
    conn.autocommit = True
    cursor = conn.cursor()

    print("Connected successfully!")

    # SQL to disable RLS on navigation tables
    sql_commands = [
        "DROP POLICY IF EXISTS s42_categories_service_role ON public.s42_categories;",
        "DROP POLICY IF EXISTS s42_menu_items_service_all ON public.s42_menu_items;",
        "DROP POLICY IF EXISTS s42_pages_service_all ON public.s42_pages;",
        "ALTER TABLE public.s42_categories DISABLE ROW LEVEL SECURITY;",
        "ALTER TABLE public.s42_menu_items DISABLE ROW LEVEL SECURITY;",
        "ALTER TABLE public.s42_pages DISABLE ROW LEVEL SECURITY;",
    ]

    for command in sql_commands:
        print(f"Executing: {command}")
        cursor.execute(command)

    # Verify the data is accessible
    cursor.execute("SELECT COUNT(*) FROM public.s42_categories;")
    result = cursor.fetchone()
    categories_count = result[0] if result else 0

    cursor.execute("SELECT COUNT(*) FROM public.s42_menu_items;")
    result = cursor.fetchone()
    menu_items_count = result[0] if result else 0

    cursor.execute("SELECT COUNT(*) FROM public.s42_pages;")
    result = cursor.fetchone()
    pages_count = result[0] if result else 0

    print(f"✅ RLS disabled successfully!")
    print(f"Categories: {categories_count}")
    print(f"Menu Items: {menu_items_count}")
    print(f"Pages: {pages_count}")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)