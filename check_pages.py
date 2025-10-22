import os
from supabase import create_client

url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    print('Missing env vars')
    exit(1)

supabase = create_client(url, key)
result = supabase.table('s42_pages').select('*').execute()
print('Pages in database:')
for page in result.data:
    print(f'- {page["title"]} (slug: {page["slug"]})')