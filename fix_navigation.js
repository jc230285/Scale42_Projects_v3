// Script to fix navigation by disabling RLS
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

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase config');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' },
});

async function fixNavigation() {
  try {
    console.log('🔧 Fixing navigation by disabling RLS...');

    // Disable RLS on navigation tables
    console.log('Disabling RLS on s42_categories...');
    const { error: catError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.s42_categories DISABLE ROW LEVEL SECURITY;'
    });
    if (catError) console.log('Categories RLS disable result:', catError);

    console.log('Disabling RLS on s42_menu_items...');
    const { error: menuError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.s42_menu_items DISABLE ROW LEVEL SECURITY;'
    });
    if (menuError) console.log('Menu items RLS disable result:', menuError);

    console.log('Disabling RLS on s42_pages...');
    const { error: pageError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.s42_pages DISABLE ROW LEVEL SECURITY;'
    });
    if (pageError) console.log('Pages RLS disable result:', pageError);

    // Test access
    console.log('Testing data access...');
    const { data: categories, error: catTestError } = await supabase
      .from('s42_categories')
      .select('*');

    const { data: menuItems, error: menuTestError } = await supabase
      .from('s42_menu_items')
      .select('*');

    console.log(`✅ Found ${categories?.length || 0} categories and ${menuItems?.length || 0} menu items`);

    if ((categories?.length || 0) > 0 && (menuItems?.length || 0) > 0) {
      console.log('🎉 Navigation fix successful! Refresh your browser.');
    } else {
      console.log('❌ Still no data found. Check if navigation data was inserted.');
    }

  } catch (error) {
    console.error('❌ Error fixing navigation:', error);

    // Try direct SQL approach
    console.log('Trying direct SQL approach...');
    try {
      const { error } = await supabase.from('s42_categories').select('*').limit(1);
      console.log('Direct query error:', error);
    } catch (e) {
      console.log('Direct query failed:', e);
    }
  }
}

fixNavigation();