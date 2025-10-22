// Try to disable RLS using direct HTTP calls to Supabase REST API
const fs = require('fs');
const path = require('path');
const https = require('https');

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

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function disableRLS() {
  try {
    console.log('🔧 Attempting to disable RLS via REST API...');

    // Try to execute SQL via RPC
    const rpcUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
    const sql = `
      ALTER TABLE public.s42_categories DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.s42_menu_items DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.s42_pages DISABLE ROW LEVEL SECURITY;
    `;

    console.log('Trying RPC call...');
    const response = await makeRequest(rpcUrl, 'POST', { sql });
    console.log(`RPC Response: ${response.statusCode} - ${response.body}`);

    // Test if it worked
    const testUrl = `${supabaseUrl}/rest/v1/s42_categories?select=*&limit=1`;
    const testResponse = await makeRequest(testUrl);
    console.log(`Test query response: ${testResponse.statusCode}`);
    if (testResponse.statusCode === 200) {
      const data = JSON.parse(testResponse.body);
      console.log(`✅ Found ${data.length} categories after RLS disable attempt`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

disableRLS();