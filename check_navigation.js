// Simple check without dotenv - load env manually
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

console.log('URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('KEY:', serviceRoleKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase config');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' },
});

// Check navigation data
async function checkNavigation() {
  try {
    console.log('Checking navigation data...');

    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('s42_categories')
      .select('*');

    if (catError) {
      console.error('Categories error:', catError);
    } else {
      console.log(`Found ${categories?.length || 0} categories:`, categories?.map(c => c.name));
    }

    // Check menu items
    const { data: menuItems, error: menuError } = await supabase
      .from('s42_menu_items')
      .select('*');

    if (menuError) {
      console.error('Menu items error:', menuError);
    } else {
      console.log(`Found ${menuItems?.length || 0} menu items:`, menuItems?.map(m => m.label));
    }

    // Check pages
    const { data: pages, error: pageError } = await supabase
      .from('s42_pages')
      .select('*');

    if (pageError) {
      console.error('Pages error:', pageError);
    } else {
      console.log(`Found ${pages?.length || 0} pages:`, pages?.map(p => p.title));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Check users and groups
async function checkUsersAndGroups() {
  try {
    console.log('Checking users and groups...');

    // Check users
    const { data: users, error: userError } = await supabase
      .from('s42_users')
      .select('*');

    if (userError) {
      console.error('Users error:', userError);
    } else {
      console.log(`Found ${users?.length || 0} users:`, users?.map(u => `${u.email} (${u.display_name})`));
    }

    // Check groups
    const { data: groups, error: groupError } = await supabase
      .from('s42_groups')
      .select('*');

    if (groupError) {
      console.error('Groups error:', groupError);
    } else {
      console.log(`Found ${groups?.length || 0} groups:`, groups?.map(g => `${g.name} (${g.domain})`));
    }

    // Check user_groups
    const { data: userGroups, error: ugError } = await supabase
      .from('s42_user_groups')
      .select(`
        user_id,
        group_id,
        role,
        user:s42_users(email),
        group:s42_groups(name)
      `);

    if (ugError) {
      console.error('User groups error:', ugError);
    } else {
      console.log(`Found ${userGroups?.length || 0} user-group relationships:`, userGroups?.map(ug => `${ug.user?.email} -> ${ug.group?.name} (${ug.role})`));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Test service role access directly
async function testServiceRoleAccess() {
  try {
    console.log('Testing service role access...');

    // Test categories access
    const { data: categories, error: catError } = await supabase
      .from('s42_categories')
      .select('*');

    console.log('Categories access:', { success: !catError, count: categories?.length, error: catError });

    // Test menu items access
    const { data: menuItems, error: menuError } = await supabase
      .from('s42_menu_items')
      .select('*');

    console.log('Menu items access:', { success: !menuError, count: menuItems?.length, error: menuError });

    // Test pages access
    const { data: pages, error: pageError } = await supabase
      .from('s42_pages')
      .select('*');

    console.log('Pages access:', { success: !pageError, count: pages?.length, error: pageError });

  } catch (error) {
    console.error('Service role test error:', error);
  }
}

checkNavigation();
checkUsersAndGroups();
testServiceRoleAccess();