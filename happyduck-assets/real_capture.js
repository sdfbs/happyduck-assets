const http = require('http');
const fs = require('fs');
const path = require('path');

function getDebuggerUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:8889/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          resolve(list[0].webSocketDebuggerUrl);
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch(e) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInPage(ws, expr) {
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true
  });
  return res.result ? res.result.value : null;
}

async function main() {
  const wsUrl = await getDebuggerUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  // Set device metrics to 420x600 @ 2x
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 420,
    height: 600,
    deviceScaleFactor: 2,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 500));

  const shot = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    fromSurface: true
  });

  const outPath = path.join(__dirname, 'real_test_live.png');
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Real Live Screenshot Saved to:', outPath);

  ws.close();
}

main().catch(console.error);
