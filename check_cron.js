const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('crontab -l', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      console.log('CRON: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '202.155.94.170',
  port: 22,
  username: 'root',
  password: 'Bismillah@1m',
  readyTimeout: 10000
});
