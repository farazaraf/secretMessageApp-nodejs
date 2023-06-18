const dgram = require('dgram');
const client = dgram.createSocket('udp4');
client.bind(12345);
const {open} = require('out-url');
let firstrun = true;  

client.on('message', (msg, rinfo) => {
    if (firstrun === true){
      console.log('first run')
      open(`http://${rinfo.address}:3000`)
      firstrun = false
    }
    console.log(`Received ${msg} from ${rinfo.address}`);
  });
  
  client.on('close', () => {
    console.log('Client closed');
  });
  
  process.on('SIGINT', () => {
    client.close();
  });
  