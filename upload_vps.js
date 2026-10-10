const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const readStream = fs.createReadStream('vps_index_fixed.js');
    const writeStream = sftp.createWriteStream('/root/ubos-wa-gateway/index.js');
    writeStream.on('close', () => {
      conn.exec('pm2 restart wa-gateway', (err, stream) => {
        stream.on('close', () => {
          console.log('Deployed robust gateway with Keep-Alive!');
          conn.end();
        }).on('data', (data) => {
          console.log(data.toString());
        });
      });
    });
    readStream.pipe(writeStream);
  });
}).connect({ host: '202.155.94.170', port: 22, username: 'root', password: 'Bismillah@1m', readyTimeout: 10000 });
