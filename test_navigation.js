// Test the exact navigation queries
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
});

async function testNavigationQueries() {
  try {
    console.log('Testing navigation queries...');

    // Test basic connection first
    console.log('Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('s42_categories')
      .select('id')
      .limit(1);

    console.log('Connection test:', { count: testData?.length, error: testError });

    // First, try to get categories
    console.log('Fetching categories...');
    const { data: categories, error: categoryError } = await supabase
      .from('s42_categories')
      .select('id, name, sort_order')
      .order('sort_order', { ascending: true });

    console.log('Categories result:', { count: categories?.length, error: categoryError, data: categories?.slice(0, 2) });

    if (categoryError) {
      console.error('Category error details:', JSON.stringify(categoryError, null, 2));
      return;
    }

    // Then try menu items
    console.log('Fetching menu items...');
    const { data: menuItems, error: menuError } = await supabase
      .from('s42_menu_items')
      .select('id, label, icon, href_type, href, sort_order, category_id, page:s42_pages(slug, title)')
      .order('sort_order', { ascending: true });

    console.log('Menu items result:', { count: menuItems?.length, error: menuError, data: menuItems?.slice(0, 2) });

    if (menuError) {
      console.error('Menu error details:', JSON.stringify(menuError, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testNavigationQueries();