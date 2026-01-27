import {exec} from 'child_process';
import {promisify} from 'util';
import fs from 'fs/promises';

const execP = promisify(exec);
const BASE = process.env.TARGET || "http://localhost:3000";
const endpoint = (BASE.endsWith('/users') ? BASE.replace(/\/users$/, '') : BASE).replace(/\/$/, '') + '/users';

function now() { return Date.now(); }

async function readToken() {
  try {
    const env = await fs.readFile('src/.env.production.local','utf8');
    const m = env.match(/BACKEND_API_TOKEN=(.*)/);
    return m ? m[1].replace(/(^"|"$)/g, '') : null;
  } catch (e) {
    return null;
  }
}

async function postJson() {
  const email = `test+json${now()}@example.com`;
  const body = { name: 'JSON Test', address: '1 Test St', email, password: 'password123' };
  console.log('\n== JSON POST to', endpoint);
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const txt = await r.text();
    console.log('Status:', r.status);
    console.log('Body:', txt.slice(0, 2000));
  } catch (e) {
    console.error('JSON POST error:', e.message);
  }
}

async function postMultipart() {
  const email = `test+multipart${now()}@example.com`;
  const avatarPath = '.vscode/test-avatar.png';
  console.log('\n== Multipart POST (curl) to', endpoint);

  // Build curl command (keeps simple for cross-shell compatibility)
  const cmd = [
    'curl -s -w "\\nHTTP_STATUS:%{http_code}"',
    `-X POST ${endpoint}`,
    `-F "name=Multipart Test"`,
    `-F "address=1 Test St"`,
    `-F "email=${email}"`,
    `-F "password=password123"`,
    `-F "avatar=@${avatarPath};type=image/png"`
  ].join(' ');

  try {
    const { stdout, stderr } = await execP(cmd, { maxBuffer: 1024 * 1024 * 5 });
    if (stderr) console.error('curl stderr:', stderr.trim());
    const parts = stdout.split('\nHTTP_STATUS:');
    const body = parts[0];
    const status = parts[1] ? parts[1].trim() : 'unknown';
    console.log('Status:', status);
    console.log('Body (first 2000 chars):', body.slice(0, 2000));
  } catch (e) {
    console.error('curl exec error:', e.message);
    if (e.stdout) console.log('stdout:', e.stdout.slice(0,1000));
    if (e.stderr) console.log('stderr:', e.stderr.slice(0,1000));
  }
}

(async function main(){
  console.log('Test script started at', new Date().toISOString());
  const token = await readToken();
  console.log('Found BACKEND_API_TOKEN?', !!token);
  await postJson();
  await postMultipart();
  console.log('Done. Check .vscode/proxy-server.out.log for proxy logs.');
})();
