// Check RLS status and policies
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

async function checkRLS() {
  try {
    console.log('🔍 Checking RLS status on navigation tables...');

    // Check if tables exist and have data
    const tables = ['s42_categories', 's42_menu_items', 's42_pages'];

    for (const table of tables) {
      console.log(`\n--- ${table} ---`);

      // Check table exists and get row count
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      console.log(`Row count: ${count}`);

      if (error) {
        console.log(`Error: ${error.message}`);
      } else {
        // Try to get actual data
        const { data: actualData, error: dataError } = await supabase
          .from(table)
          .select('*')
          .limit(5);

        if (dataError) {
          console.log(`Data access error: ${dataError.message}`);
        } else {
          console.log(`Sample data: ${JSON.stringify(actualData, null, 2)}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRLS();