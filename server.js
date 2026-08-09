const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Menangkap error tersembunyi cPanel dan menyimpannya ke file log
process.on('uncaughtException', (err) => {
  fs.appendFileSync(path.join(__dirname, 'cpanel-error.log'), err.stack + '\n');
  process.exit(1);
});

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

// SANGAT PENTING: Passenger cPanel sering salah membaca direktori root
const app = next({ 
  dev,
  dir: __dirname 
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  fs.appendFileSync(path.join(__dirname, 'cpanel-error.log'), 'Prepare error: ' + err.stack + '\n');
  process.exit(1);
});
