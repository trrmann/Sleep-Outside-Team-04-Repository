import fs from 'fs';

const env = fs.readFileSync('src/.env.production.local','utf8');
const m = env.match(/BACKEND_API_TOKEN=(.*)/);
const token = m ? m[1].trim() : null;
if(!token){ console.error('no token found'); process.exit(2); }

// Allow overriding the target via `TARGET` env var for proxy testing.
const DEFAULT_URL = 'https://wdd330-backend.onrender.com/users';
const url = process.env.TARGET || DEFAULT_URL;

(async ()=>{
  const payload = {
    name: 'Test User',
    address: '1 Test St',
    email: `test+signup${Date.now()}@example.com`,
    password: 'password123'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    });
    console.log('status', res.status);
    const txt = await res.text();
    console.log(txt);
  } catch (e) {
    console.error('ERR', e.message);
  }
})();
