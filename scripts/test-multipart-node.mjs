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

async function send(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    console.log(`\n-> ${url} \nStatus: ${res.status}\nBody: ${text.slice(0,2000)}`);
  } catch (e) {
    console.error('Request error', e && e.message);
  }
}

(async () => {
  const token = await readToken();
  const avatarPath = '.vscode/test-avatar.png';
  const buffer = await fs.readFile(avatarPath);
  const blob = new Blob([buffer], { type: 'image/png' });

  const email = `node+multipart${Date.now()}@example.com`;

  const form = new FormData();
  form.append('name', 'Node Multipart Test');
  form.append('address', '1 Test St');
  form.append('email', email);
  form.append('password', 'password123');
  form.append('avatar', blob, 'test-avatar.png');

  const proxyUrl = process.env.TARGET || 'http://localhost:3000/users';
  const backendUrl = 'https://wdd330-backend.onrender.com/users';

  console.log('Sending multipart via native FormData to proxy (no auth header)');
  await send(proxyUrl, { method: 'POST', body: form });

  console.log('\nSending multipart via native FormData to proxy (with Authorization header)');
  await send(proxyUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });

  console.log('\nSending multipart via native FormData directly to backend (with Authorization header)');
  // rebuild form because body streams cannot be reused
  const form2 = new FormData();
  form2.append('name', 'Node Multipart Test');
  form2.append('address', '1 Test St');
  form2.append('email', email);
  form2.append('password', 'password123');
  form2.append('avatar', new Blob([buffer], { type: 'image/png' }), 'test-avatar.png');
  await send(backendUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form2 });

  console.log('\nComplete. Check proxy logs if needed: .vscode/proxy-server.out.log');
})();
