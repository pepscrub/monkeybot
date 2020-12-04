const ws = require('ws');
const { log } = require('../../global/helpers.js');
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
        sock.send(JSON.stringify(process.memoryUsage()), function (e) {
            //
            // Ignore errors.
            //
        });
    }, 100);
    console.log('started client interval');
    
    sock.on('close', function () {
      console.log('stopping client interval');
      clearInterval(id);
    });
})