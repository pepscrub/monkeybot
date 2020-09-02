const discord = require('discord.js');                                                                              // Discordjs library
const client = new discord.Client();                                                                                // new instance of bot
const colors = require('colors');
const { log } = require('./commands/helpers.js');
const { DataBase } = require('./db');
module.exports.DB = new DataBase();

this.DB.conn()

// Commands index.js
const commands = require('./commands');                                                     // Importing  commands index.js
require('dotenv').config();                                                                 // doxenv allows us to read .env files as enviroment variables

client.login(process.env.token);                                                            // Logging into our bot (Token is supplied in .env)
client.on('ready', async ()=>{
    log(`Logged in as ${`${client.user.username}`.underline}.`)                             // Logging that our login was successfull
    client.user.setPresence({activity:{name: "Console (bot under dev)",type: "WATCHING"},status: "online"})
    log(`Set to default status`)
}) 
client.on('message', commands);                                                             // Messages event listener, commands found in ./commands/index.js