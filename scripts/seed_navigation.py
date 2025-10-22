#!/usr/bin/env python3
import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file in parent directory
env_path = Path(__file__).parent.parent / '.env'
if not env_path.exists():
    print(f"❌ .env file not found at {env_path}")
    sys.exit(1)

load_dotenv(env_path)

# Get database connection details from .env
db_host = os.getenv('SUPABASE_DB_HOST')
db_port = os.getenv('SUPABASE_DB_PORT', '5432')
db_name = os.getenv('SUPABASE_DB_DATABASE', 'postgres')
db_user = os.getenv('SUPABASE_DB_USER')
db_password = os.getenv('SUPABASE_DB_PASSWORD')

if not all([db_host, db_port, db_name, db_user, db_password]):
    print("❌ Missing required environment variables:")
    print(f"   SUPABASE_DB_HOST: {db_host}")
    print(f"   SUPABASE_DB_PORT: {db_port}")
    print(f"   SUPABASE_DB_DATABASE: {db_name}")
    print(f"   SUPABASE_DB_USER: {db_user}")
    print(f"   SUPABASE_DB_PASSWORD: {'***' if db_password else 'None'}")
    sys.exit(1)

def run_sql_file(cursor, filepath):
    """Execute SQL from a file"""
    print(f"\n📄 Running {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        sql = f.read()
    try:
        cursor.execute(sql)
        print(f"✅ {filepath} executed successfully")
        return True
    except Exception as e:
        print(f"❌ Error in {filepath}: {e}")
        return False

def main():
    # Connect to database
    try:
        print(f"🔌 Connecting to database at {db_host}:{db_port}...")
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            sslmode='require',
            connect_timeout=10
        )
        conn.autocommit = False
        cursor = conn.cursor()
        print("✅ Connected successfully")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        print(f"   Host: {db_host}")
        print(f"   Port: {db_port}")
        print(f"   Database: {db_name}")
        print(f"   User: {db_user}")
        sys.exit(1)

    try:
        # Run seed navigation SQL
        base_path = Path(__file__).parent.parent
        seed_file = base_path / 'sql' / '004_seed_navigation.sql'

        if not seed_file.exists():
            print(f"⚠️  Seed file not found: {seed_file}")
            sys.exit(1)

        if not run_sql_file(cursor, str(seed_file)):
            print("\n❌ Rolling back due to error")
            conn.rollback()
            sys.exit(1)

        # Commit changes
        conn.commit()
        print("\n✅ Seed data applied successfully!")

    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()
        print("🔌 Database connection closed")

if __name__ == '__main__':
    main()