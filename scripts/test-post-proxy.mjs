const url = 'http://localhost:3000/users';

(async ()=>{
  const payload = {
    name: 'Proxy Test User',
    address: '1 Test St',
    email: `test+proxy${Date.now()}@example.com`,
    password: 'password123'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('status', res.status);
    const txt = await res.text();
    console.log(txt);
  } catch (e) {
    console.error('ERR', e.message);
  }
})();
