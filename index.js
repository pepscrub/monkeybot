const wtf = require('wtfnode');
const discord = require('discord.js');                                                                              // Discordjs library
const client = new discord.Client();                                                                                // new instance of bot
const colors = require('colors');
const { log } = require('./commands/helpers.js');
const { DataBase } = require('./db');
// const process_handling = require('./process');

module.exports.client = client;
module.exports.DB = new DataBase();
this.DB.conn();

module.exports.sendmessage = async (desc) =>
{
    try
    {
        const embed = new discord.MessageEmbed()
        .setColor(process.env.BOT_COLOR)
        .setTitle(`${desc}`)
        .setTimestamp()
        .setFooter(`${client.author.username}#${client.author.discriminator}`, `${client.author.avatarURL()}`);
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

client.login(process.env.token);                                                            // Logging into our bot (Token is supplied in .env)

client.on('ready', async ()=>{
    try
    {
        log(`Logged in as ${`${client.user.username}`.underline}.`)
        client.user.setPresence({activity:{name: "`help",type: "LISTENING"},status: "online"})
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

// Delete messages every half an hour
// Using client.setinterval instead of our own since it automatically deletes itself when we destory the client.
client.setInterval(()=>{
    client.sweepMessages(300); // Seconds
}, 300000) // MS


// Processing (should move to another folder)

wtf.setLogger('error', (err)=>{this.sendmessage(err)});
function exit_gracefully(SIG)
{
    log(`${SIG} recieved attemptikng to close.`)

    try
    {
        if(this.DB !== undefined)
        {
            this.DB.close();
            log(`Sucessfully disconnected from DB!`);
        }else{
            log(`Can't read DB.`);
        }
    }catch(e){
        log(`Failed to disconnect from DB!\n${e}`)
    }

    try
    {
        client.destroy();
        log(`Sucessfully logged out of discord!`);
    }catch(e){
        log(`Failed to log out of discord!`)
    }
    log(`Terminating parent process with ${SIG}`);
    process.kill(process.pid, SIG)
}

process.on('warning', (warn) => {this.sendmessage(`Warning: ${warn}`)});
process.on('uncaughtException', (err, origin) => {this.sendmessage(`Execption: ${err}\nOrigin${origin}`)});
process.on('unhandledRejection', (reason, promise) => {this.sendmessage(`Unhandled rejection at: ${promise}\nReason: ${reason}`)});
process.on('exit', (exitcode) => {this.sendmessage(`Bot is exiting with exit code of ${exitcode}`);})
process.on('SIGINT', (code)=> exit_gracefully(code));
process.on('SIGTERM', (code)=> exit_gracefully(code));
