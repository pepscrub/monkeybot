const   express = require('express'),           // HTTP server module
        bodyParser = require('body-parser'),    // module allows for Form data parsing via POST
        multiparty = require('multiparty'),     // Used to parse File data from POST
        fs = require('fs'),                     // File System module
        port = process.env.WEB_PORT || 8888,    // Grabbing environment variable port value or listening on 8080
        app = express(),                        // HTTP server entry point
        error = console.error,                  // Entry point for all errors
        { log } = require('../global/helpers');
        cookieParser = require('cookie-parser'),// Session initalizations (cookie management)
        helmet = require('helmet');
module.exports.app = app;
require('./watcher');
        
const server = app.listen(port, ()=>{
    log(`Web Server is listening on port: ${port}`, null, '[WEB]'.bold.magenta);
    // log(`Server is listening on port: ${port}`, null, '[nodeJS]'.bold.lime);
});


// Middle ware
// --------------------
// Basic web server setup (serves static files)
app.use(express.static(__dirname+'/public')).use(cookieParser());       // Serves all the files in the current directory (Cookie parser lets us initate a session on all the pages we're serving)
app.use(bodyParser.json())                                              // Allows the use of JSON in POSTS/GETS
app.use(bodyParser.urlencoded({ extended: true }));                     // Allow for headers with Content-Type: application/x-www-form-urlencoded
app.use(helmet());                                                      // Sanitization of all communication between server and client

