'use strict';
const mongo = require('mongodb');
const discord = require('discord.js');
const client = new discord.Client();
const { log } = require('../global/helpers');
const { DataBase } = require('./db');
module.exports.client = client;
module.exports.DB = new DataBase();
this.DB.conn();

const args = process.argv.slice(2);
let dev = false;
let debug = false;

args.forEach(arg=>
{
    if(/dev/gi.test(arg)) dev = true;
    if(/debug/gi.test(arg)) debug = true;
})

module.exports.dev = dev;
module.exports.debug = debug;
module.exports.sendmessage = async (desc) =>
{
    try
    {
        const embed = new discord.MessageEmbed()
        .setColor(process.env.BOT_COLOR)
        .setTitle(`${desc}`)
        .setTimestamp();
        if(client.author !== undefined)
        {
            embed.setFooter(`${client.author.username}#${client.author.discriminator}`, `${client.author.avatarURL()}`);
        }
        const owner = await client.users.fetch('507793672209825792');
        owner.send(embed);
    }catch(e)
    {
        console.log(`An eror occured when attempting to send message\n${e}`);
    }
}
// Commands index.js
const commands = require('./commands');                                                     // Importing  commands index.js
require('dotenv').config();                                                                 // doxenv allows us to read .env files as enviroment variables

client.login(this.dev ? process.env.TEST_TOKEN : process.env.token)
.catch((e)=>{
    log(`An error occured while bot was authentication.\n${e.stack || e}`);
    process.exit('SIGTERM');
});

client.on('ready', async ()=>{
    try
    {
        log(`Logged in as ${`${client.user.username}`.underline}.`)
        if(/debugging/gi.test(args[1]))
        {
            client.user.setPresence({activity:{name: "In debugging mode"},status: "dnd"})
        }else{
            client.user.setPresence({activity:{name: "`help",type: "LISTENING"},status: "online"})
        }
        log(`Set to default status`)
        // process.kill(process.pid, 15);
    }catch(e)
    {
        this.sendmessage(`An error occured while bot was starting up.\n${e}`);
    }
}) 

client.on("error", async (e)=>
{
    try
    {
        let embed = new discord.MessageEmbed()
        .setTitle("Something happened ...")
        .setDescription(`\`\`\`swift\n${e.name}: ${e.message}\
            \n🐛 ${problem_file}\
            \n\n
            \n🥞 Full error stack\
            \n${e.stack}\
            \`\`\``)
        .setColor(process.env.BOT_COLOR_ERR)
        .setTimestamp();
        const owner = await client.users.fetch('507793672209825792');
        owner.send(embed);
    }catch(e)
    {
        console.error(e);
    }
})

client.on("resume", async (replays) =>
{
    this.sendmessage(`Reconnected to websocket\nREPLAYS: ${replays}`);
})

client.on("warn", async (info) =>
{
    this.sendmessage(`WARNING: ${info}`);
})

client.on("error", async(err)=>
{
    try
    {
        const embed = new discord.MessageEmbed()
        .setTitle(title)
        .setDescription(`\`\`\`swift\n${err.name}: ${err.message}\
        \n🐛 ${problem_file}\
        \n\n
        \n🥞 Full error stack\
        \n${err.stack}\
        \`\`\``)
        .setColor(process.env.BOT_COLOR_ERR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        .setTimestamp();
        const owner = await client.users.fetch('507793672209825792');
        owner.send(embed);    
    }catch(e)
    {
        this.sendmessage(`Two errors occured:\n${err}\nError handler error:\n${e}`);
    }

})

client.on('message', commands); // Messages event listener, commands found in ./commands/index.js

client.on('debug', (info)=>
{
    if(this.debug)
    {
        log(info.italic.gray, null, '[Debug]'.bold.yellow);
    }
})