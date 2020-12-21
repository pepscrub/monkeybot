const ws = require('ws');
const { log } = require('../../global/helpers.js');
const osu = require('os-utils');

module.exports.wss = new ws.Server({noServer: true});
module.exports.wss2 = new ws.Server({noServer: true});

module.exports.sockets = [];
module.exports.sockets2 = [];

this.wss.on('connection', (sock, req) =>
{
    // console.log('Connection made');
    this.sockets.push(sock);
})

this.wss.on('close', socket=>
{
    console.log('Closed socket');
})

this.wss2.on('connection', (sock, req)=>
{
    const id = setInterval(function () {
        osu.cpuUsage(val=>{
            sock.send(JSON.stringify([val, process.memoryUsage()]), function (e) {
                //
                // Ignore errors.
                //
            });
        })
    }, 1000);
    
    sock.on('close', function () {
      clearInterval(id);
    });
})