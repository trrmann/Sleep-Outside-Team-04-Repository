import fs from 'fs/promises';

async function readToken() {
  try {
    const env = await fs.readFile('src/.env.production.local','utf8');
    const m = env.match(/BACKEND_API_TOKEN=(.*)/);
    return m ? m[1].replace(/(^"|"$)/g, '') : null;
  } catch (e) {
    return null;
  }
}

(async function(){
  const token = await readToken();
  console.log('Found token?', !!token);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const res = await fetch('https://wdd330-backend.onrender.com/openapi.json', { headers });
    const j = await res.json();
    await fs.writeFile('.vscode/openapi-sample.json', JSON.stringify(j, null, 2), 'utf8');
    console.log('Saved .vscode/openapi-sample.json');
  } catch (e) {
    console.error('Fetch error', e.message || e);
    process.exit(2);
  }
})();
