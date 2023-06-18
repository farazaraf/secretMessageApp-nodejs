const express = require('express');
const fs = require('fs')
const app = express();
var pin = randPIN()
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const readline = require('readline');
const Tail = require("tail").Tail;
var tailoptions = {separator: /[\r]{0,1}\n/,flushAtEOF:true}
const tail = new Tail("ist_gossip.txt",tailoptions);

app.use(express.static(__dirname + '/static'));

let sentGossip = '' 
let lines = ''
// first run it will load all the text data. 
let firstrun = true;
fs.readFile('ist_gossip.txt', 'utf8', function(err, data) {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    lines = data.split(/\r?\n/);
  });


// periodic refreshing of the page and giving new data
tail.on("line",function(data){
sentGossip = data
console.log(data);
});
app.get('/getData', (req, res) => {
    if(firstrun == true){
        lines.forEach((line, index) => {
              sentGossip += line; // Delay each line by 1 second (adjust as needed)
          });
        firstrun = false;
        res.send(sentGossip)
    }else{
        
            res.send(sentGossip);
        }
    });
tail.on("error", function(error) {
    console.log("ERROR: ", error);
});

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/static/index.html');
})
app.get('/process_get',function(req,res){
    const password = req.query.pass.toUpperCase();
    if (password === pin){

        res.sendFile(__dirname + '/static/gossip.html')
        app.get('/gossip',function(req,res){
            updateGossip(req.query.gossip);
        })
    }
    else {
        res.send('<h1>Wrong Passkey, Enter the correct one</h1>')
    }
})
const webSite = app.listen(3000, function () {  
    const port = webSite.address().port
    server.bind(() => {
        server.setBroadcast(true);
        let count = 0
        setInterval(() => {
          server.send(`Secret Code: ${pin}, Port:${port} `,12345, '255.255.255.255');
          count+=1;
          if(count % 3 == 0){
            pin = randPIN()
          }
        }, 10000);
    })
   console.log("WebSite running at localhost:", port)
})
function randPIN(){
    const pin = Math.random().toString(36).substring(3,7).toUpperCase()
    return pin
}

function updateGossip(content){
    const stringWithoutNewlines = content.replace(/\n/g, ' ');
    const writeStream = fs.createWriteStream('ist_gossip.txt', { flags: 'a' });
    writeStream.write(stringWithoutNewlines + '\n');
    writeStream.end();

    writeStream.on('finish', () => {
    console.log('Gossip added successfully.');
});
}
function readGossip(){
    const files = fs.readFileSync('ist_gossip.txt','utf8');
    var gossip = files.match(/[^\r\n]+/g) || [];
    console.log('gossips read from file')
    return gossip
}