const discord = require('discord.js');                                                                              // Discordjs library
const client = new discord.Client();                                                                                // new instance of bot
const colors = require('colors');
const { networkInterfaces } = require('os'); // Needed for mongodb / heroku setup
const { log } = require('./commands/helpers.js');

// Commands index.js
const commands = require('./commands');                                                                             // Importing  commands index.js
require('dotenv').config();                                                                                         // doxenv allows us to read .env files as enviroment variables


const nets = networkInterfaces();
const results ={}; // or just '{}', an empty object

// https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }

            results[name].push(net.address);
        }
    }
}

log(JSON.stringify(results))

client.login(process.env.token);                                                            // Logging into our bot (Token is supplied in .env)
client.on('ready', async ()=>{
    log(`Logged in as ${`${client.user.username}`.underline}.`)                       // Logging that our login was successfull
    client.user.setPresence({activity:{name: "`help",type: "LISTENING"},status: "online"})
    log(`Set to default status`)
}) 
client.on('message', commands);                                                             // Messages event listener, commands found in ./commands/index.js


// db_close();
