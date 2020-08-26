const discord = require('discord.js');                                                                              // Discordjs library
const client = new discord.Client();                                                                                // new instance of bot
const colors = require('colors');
const {DB} = require('./db');

// Commands index.js
const commands = require('./commands');                                                                             // Importing  commands index.js
require('dotenv').config();                                                                                         // doxenv allows us to read .env files as enviroment variables

let database = new DB;
database.connect();

client.login(process.env.token);                                                                                    // Logging into our bot (Token is supplied in .env)
client.on('ready', ()=>{
    console.log(`${'[Monkey]'.bold.green} Logged in as ${`${client.user.username}`.underline}.`)                    // Logging that our login was successfull
    client.user.setPresence({activity:{name: "`help",type: "LISTENING"},status: "online"})
    console.log(`${'[Monkey]'.bold.green} Set to default status`)
}) 
client.on('message', commands);                                                                                     // Messages event listener, commands found in ./commands/index.js


// db_close();
