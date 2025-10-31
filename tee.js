// tee.js
const fs = require('fs');
const output = fs.createWriteStream('dev.log');

process.stdin.on('data', (chunk) => {
  output.write(chunk);
  process.stdout.write(chunk);
});

process.stdin.on('end', () => {
  output.end();
});