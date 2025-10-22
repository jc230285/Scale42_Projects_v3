#!/usr/bin/env python3
"""
Test database connection
"""
import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
if not env_path.exists():
    print(f"❌ .env file not found at {env_path}")
    sys.exit(1)

load_dotenv(env_path)

# Get database connection details
db_host = os.getenv('SUPABASE_DB_HOST')
db_port = os.getenv('SUPABASE_DB_PORT', '5432')
db_name = os.getenv('SUPABASE_DB_DATABASE')
db_user = os.getenv('SUPABASE_DB_USER')
db_password = os.getenv('SUPABASE_DB_PASSWORD')

print(f"🔌 Testing connection to {db_host}:{db_port}...")
print(f"   Database: {db_name}")
print(f"   User: {db_user}")

try:
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password,
        sslmode='require',
        connect_timeout=10
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # Test query
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    if version:
        print("✅ Connected successfully!")
        print(f"   PostgreSQL version: {version[0][:50]}...")
    else:
        print("❌ Version query returned no results")
        sys.exit(1)

    # Test our tables
    cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 's42_%';")
    table_result = cursor.fetchone()
    if table_result:
        table_count = table_result[0]
        print(f"   Found {table_count} s42_ tables")
    else:
        print("❌ Table count query returned no results")
        sys.exit(1)

    cursor.close()
    conn.close()
    print("✅ Connection test passed!")

except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("   Check your .env file and database credentials")
    sys.exit(1)