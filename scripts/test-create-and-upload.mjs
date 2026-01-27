import fs from "fs/promises";

async function readToken() {
  try {
    const env = await fs.readFile("src/.env.production.local","utf8");
    const m = env.match(/BACKEND_API_TOKEN=(.*)/);
    return m ? m[1].replace(/(^"|"$)/g, "") : null;
  } catch (e) {
    return null;
  }
}

async function postJson(url, includeAvatar = false) {
  const email = `test+json${Date.now()}@example.com`;
  const body = { name: "Integration Test", address: "1 Test St", email, password: "password123" };
  if (includeAvatar) {
    try {
      const buffer = await fs.readFile('.vscode/test-avatar.png');
      const b64 = buffer.toString('base64');
      body.avatar = `data:image/png;base64,${b64}`;
    } catch (e) {
      // ignore avatar read errors
    }
  }
  console.log("\n== JSON create to", url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", txt.slice(0, 2000));
  let j = null;
  try { j = JSON.parse(txt); } catch (e) { j = null; }
  return { res, body: j, email };
}

async function uploadAvatar(url, email, token) {
  console.log("\n== Avatar upload to", url);
  const buffer = await fs.readFile(".vscode/test-avatar.png");
  const fd = new FormData();
  fd.append('email', email);
  fd.append('avatar', new Blob([buffer], { type: 'image/png' }), 'test-avatar.png');

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { method: 'POST', headers, body: fd });
  const txt = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", txt.slice(0, 2000));
  return res;
}

(async function main(){
  const BASE = process.env.TARGET || "http://localhost:3000";
  // Normalize to origin so TARGET can include a path without duplicating it
  const ORIGIN = (() => { try { return new URL(BASE).origin; } catch (e) { return BASE; } })();
  const makeUrl = (path) => new URL(path, ORIGIN).toString();
  const token = await readToken();
  console.log("Found BACKEND_API_TOKEN?", !!token);
  console.log("BASE:", BASE);
  console.log("Create URL:", makeUrl("/users"));
  console.log("Avatar URL:", makeUrl("/users/avatar"));

  const create = await postJson(makeUrl('/users'), true);
  if (!create.res.ok) {
    console.log("Create failed; aborting avatar upload.");
    process.exit(create.res.status);
  }

  const returnedToken = create.body && create.body.token;
  const useToken = returnedToken || token || null;

  console.log("Avatar upload skipped (embedded in create JSON)");

  console.log("\nIntegration test complete.");
})();
