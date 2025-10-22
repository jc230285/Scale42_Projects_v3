#!/usr/bin/env python3
import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Get database connection details
db_host = os.getenv('SUPABASE_DB_HOST')
db_name = os.getenv('SUPABASE_DB_NAME', 'postgres')
db_user = os.getenv('SUPABASE_DB_USER')
db_password = os.getenv('SUPABASE_DB_PASSWORD')
db_port = os.getenv('SUPABASE_DB_PORT', '5432')

print(f"Connecting to: {db_user}@{db_host}:{db_port}/{db_name}")

try:
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password
    )
    cursor = conn.cursor()
    
    # Check current role
    cursor.execute("SELECT current_user, current_database();")
    user, db = cursor.fetchone()
    print(f"\n✅ Connected as: {user} to database: {db}")
    
    # Check if we can select from s42_users
    try:
        cursor.execute("SELECT count(*) FROM public.s42_users;")
        count = cursor.fetchone()[0]
        print(f"✅ Can read s42_users table (count: {count})")
    except Exception as e:
        print(f"❌ Cannot read s42_users: {e}")
    
    # Check if we can insert into s42_users
    try:
        cursor.execute("""
            INSERT INTO public.s42_users (id, email, display_name)
            VALUES (gen_random_uuid(), 'test@example.com', 'Test User')
            ON CONFLICT (email) DO NOTHING
            RETURNING id;
        """)
        result = cursor.fetchone()
        if result:
            print(f"✅ Can write to s42_users table (inserted id: {result[0]})")
        else:
            print(f"✅ Can write to s42_users table (duplicate email, no insert)")
        conn.rollback()  # Don't actually commit the test insert
    except Exception as e:
        print(f"❌ Cannot write to s42_users: {e}")
        conn.rollback()
    
    # Check table ownership
    cursor.execute("""
        SELECT tableowner 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 's42_users';
    """)
    owner = cursor.fetchone()
    if owner:
        print(f"\n📋 s42_users table owner: {owner[0]}")
    
    # Check RLS status
    cursor.execute("""
        SELECT relrowsecurity 
        FROM pg_class 
        WHERE relname = 's42_users';
    """)
    rls = cursor.fetchone()
    if rls:
        print(f"📋 RLS enabled on s42_users: {rls[0]}")
    
    # Check policies
    cursor.execute("""
        SELECT policyname, permissive, roles, cmd 
        FROM pg_policies 
        WHERE tablename = 's42_users';
    """)
    policies = cursor.fetchall()
    print(f"\n📋 Policies on s42_users ({len(policies)} total):")
    for policy in policies:
        print(f"  - {policy[0]} (permissive={policy[1]}, roles={policy[2]}, cmd={policy[3]})")
    
    cursor.close()
    conn.close()
    print("\n✅ Test complete")

except Exception as e:
    print(f"\n❌ Error: {e}")
