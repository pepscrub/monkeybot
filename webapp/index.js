const   express = require('express'),           // HTTP server module
        bodyParser = require('body-parser'),    // module allows for Form data parsing via POST
        multiparty = require('multiparty'),     // Used to parse File data from POST
        fs = require('fs'),                     // File System module
        port = process.env.WEB_PORT || 8888,    // Grabbing environment variable port value or listening on 8080
        app = express(),                        // HTTP server entry point
        { log } = require('../global/helpers'),
        cookieParser = require('cookie-parser'),// Session initalizations (cookie management)
        helmet = require('helmet'),
        url = require('url');
module.exports.app = app;
// Logger
require('./watcher');
// Websocket
const { wss, wss2, sockets } = require('./ws');
        
const server = app.listen(port, ()=>{
    log(`Web Server is listening on port: ${port}`, null, '[WEB]'.bold.magenta);
    // log(`Server is listening on port: ${port}`, null, '[nodeJS]'.bold.lime);
});

server.on('upgrade', (req, sock, head)=>
{
    const pathname = url.parse(req.url).pathname;

    if(pathname == '/logs')
    {
        wss.handleUpgrade(req, sock, head, sock =>
        {
            wss.emit('connection', sock, req);
        })
    }else if(pathname == '/mem')
    {
        wss2.handleUpgrade(req, sock, head, sock =>
        {
            wss2.emit('connection', sock, req);
        })
    }else
    {
        sock.destroy();
    }
})

module.exports.server = server;

// Middle ware
// --------------------
// Basic web server setup (serves static files)
app.use(express.static(__dirname+'/public')).use(cookieParser());       // Serves all the files in the current directory (Cookie parser lets us initate a session on all the pages we're serving)
app.use(bodyParser.json())                                              // Allows the use of JSON in POSTS/GETS
app.use(bodyParser.urlencoded({ extended: true }));                     // Allow for headers with Content-Type: application/x-www-form-urlencoded
app.use(helmet());                                                      // Sanitization of all communication between server and client

