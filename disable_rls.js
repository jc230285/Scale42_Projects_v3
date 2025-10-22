// Direct SQL execution to disable RLS
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' },
});

async function disableRLS() {
  try {
    console.log('🔧 Disabling RLS on navigation tables...');

    // Try to disable RLS using direct queries
    const tables = ['s42_categories', 's42_menu_items', 's42_pages'];

    for (const table of tables) {
      console.log(`Disabling RLS on ${table}...`);
      // Service role should be able to do this directly
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
      });

      if (error) {
        console.log(`❌ Failed to disable RLS on ${table}:`, error.message);
      } else {
        console.log(`✅ Disabled RLS on ${table}`);
      }
    }

    // Test data access
    console.log('Testing data access...');
    const { data: categories } = await supabase.from('s42_categories').select('*');
    const { data: menuItems } = await supabase.from('s42_menu_items').select('*');

    console.log(`Found ${categories?.length || 0} categories and ${menuItems?.length || 0} menu items`);

  } catch (error) {
    console.error('Error:', error);
  }
}

disableRLS();