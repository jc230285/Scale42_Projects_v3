#!/usr/bin/env python3
"""
Fix the s42_logs table by creating the missing log_level type.
"""
import os
import sys
from pathlib import Path

# Add the scripts directory to the path
script_dir = Path(__file__).parent
sys.path.insert(0, str(script_dir))

# Import after path is set
from test_connection import get_supabase_url, get_supabase_key

def apply_fix():
    """Apply the logs table fix."""
    supabase_url = get_supabase_url()
    service_key = get_supabase_key()
    
    if not supabase_url or not service_key:
        print("❌ Missing Supabase credentials")
        return False
    
    # Read the SQL file
    sql_file = script_dir.parent / "sql" / "fix_logs_table.sql"
    
    if not sql_file.exists():
        print(f"❌ SQL file not found: {sql_file}")
        return False
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print(f"📝 Applying fix from {sql_file.name}...")
    
    # Use psql connection string if available
    import subprocess
    
    # Try to get connection string from environment or construct it
    db_url = os.environ.get('DATABASE_URL')
    
    if db_url:
        print("📡 Using DATABASE_URL from environment")
        try:
            result = subprocess.run(
                ['psql', db_url, '-c', sql_content],
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode == 0:
                print("✅ Fix applied successfully!")
                print(result.stdout)
                return True
            else:
                print(f"❌ Error applying fix: {result.stderr}")
                return False
        except FileNotFoundError:
            print("⚠️  psql not found, trying HTTP API...")
    
    # Fallback to HTTP API (less ideal for DDL)
    import requests
    
    # Split into individual statements
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    
    print(f"📡 Executing {len(statements)} SQL statements via HTTP API...")
    
    headers = {
        'Authorization': f'Bearer {service_key}',
        'apikey': service_key,
        'Content-Type': 'application/json',
    }
    
    success_count = 0
    for i, statement in enumerate(statements, 1):
        if not statement:
            continue
            
        print(f"  [{i}/{len(statements)}] Executing statement...")
        
        # Use the /rest/v1/rpc endpoint for raw SQL
        # Note: This requires a custom function, so we'll try a different approach
        
        # Since Supabase REST API doesn't easily support DDL, let's output instructions
        print("\n⚠️  Cannot execute DDL via HTTP API.")
        print("\n📋 Please execute the following SQL in your Supabase SQL Editor:")
        print("=" * 80)
        print(sql_content)
        print("=" * 80)
        print("\nOr run this command if you have psql installed:")
        print(f"psql <your-database-url> < {sql_file}")
        return False
    
    return False

if __name__ == '__main__':
    print("🔧 Fixing s42_logs table...\n")
    success = apply_fix()
    sys.exit(0 if success else 1)
