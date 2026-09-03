const http = require('http');
const https = require('https');

const API_KEY = REDACTED LMAO;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      }
    };
    const proxy = https.request(options, r => {
      res.writeHead(r.statusCode, { 'Content-Type': 'application/json' });
      r.pipe(res);
    });
    proxy.write(body);
    proxy.end();
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`proxy running on port ${PORT}`));
