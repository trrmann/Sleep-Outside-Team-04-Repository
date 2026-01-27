import fs from "fs/promises";

async function readToken() {
  try {
    const env = await fs.readFile("src/.env.production.local", "utf8");
    const m = env.match(/BACKEND_API_TOKEN=(.*)/);
    return m ? m[1].replace(/(^"|"$)/g, "") : null;
  } catch (e) {
    return null;
  }
}

async function doPost(url, token, email) {
  console.log(`\nPosting avatar to ${url}`);
  const buffer = await fs.readFile(".vscode/test-avatar.png");
  const fd = new FormData();
  fd.append("email", email);
  fd.append("avatar", new Blob([buffer], { type: "image/png" }), "test-avatar.png");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(url, { method: "POST", headers, body: fd });
    const txt = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", txt.slice(0, 2000));
  } catch (e) {
    console.log("Request error:", e.message);
  }
}

(async function main(){
  const proxy = process.env.TARGET || "http://localhost:3000";
  const backend = process.env.BACKEND_URL || "https://wdd330-backend.onrender.com";
  const token = await readToken();
  const email = `test+avatar${Date.now()}@example.com`;

  await doPost(`${proxy}/users/avatar`, token, email);
  await doPost(`${backend}/users/avatar`, token, email);

  console.log("\nDone.");
})();
