const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  return envVars;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDuplicates() {
  try {
    // Check for duplicate menu items
    const { data: menuItems } = await supabase
      .from('s42_menu_items')
      .select('*')
      .eq('href', '/');

    console.log('Menu items with href="/":', menuItems?.length);
    menuItems?.forEach(item => console.log('Menu item:', item.label, item.id));

    // Check for duplicate dashboard pages
    const { data: pages } = await supabase
      .from('s42_pages')
      .select('*')
      .eq('slug', 'dashboard');

    console.log('Dashboard pages:', pages?.length);
    pages?.forEach(page => console.log('Page:', page.title, page.id));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkDuplicates();