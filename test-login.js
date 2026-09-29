async function test() {
  const loginUrl = 'https://lmsrpl.skanamber.net/login';
  console.log("Checking server...");
  const res = await fetch(loginUrl);
  const text = await res.text();
  console.log("Login page loaded. Size:", text.length);
}
test();
