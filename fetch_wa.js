const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /root/ubos-wa-gateway/index.js', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('close', () => {
      console.log(data);
      conn.end();
    });
  });
}).connect({
  host: '202.155.94.170',
  port: 22,
  username: 'root',
  password: 'Bismillah@1m',
  readyTimeout: 10000
});
