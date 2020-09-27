const discord = require('discord.js');                                                                              // Discordjs library
const client = new discord.Client();                                                                                // new instance of bot
const colors = require('colors');
const errh = require('./commands/helpers.js').err;
const { log, intwithcommas } = require('./commands/helpers.js');
const { DataBase } = require('./db');
module.exports.DB = new DataBase();
module.exports.uptime = new Date().toISOString();
this.DB.conn();

async function sendmessage(desc)
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
        console.log(e);
    }
}

async function send_server_update(server, color)
{
    const s_owner = server.owner;
    const o_string = `${s_owner.user.username}#${s_owner.user.discriminator} ${s_owner.nickname ? '| '+s_owner.nickname : ''}`
    const s_name = server.name;
    const s_mem_count = server.memberCount;
    const s_partnered = server.partnered;
    const s_boosted = server.premiumSubscriptionCount;
    const s_teir = server.premiumTier;
    const s_location = server.region;
    const s_verified = server.verified;
    const s_count = intwithcommas(client.guilds.cache.array().length);

    let embed = new discord.MessageEmbed()
    .setTitle(`🕹 ${s_name} | 👪 ${s_mem_count}`)
    .setDescription(`\`\`\`swift
        \n👑| ${o_string}\
        \n🌏| ${s_location}\
        \n✅| ${s_verified}\
        \n☄️| ${s_partnered ? 'Partnered Server❗️' : "Not Partnered"}\
        \n🚀| Nitro boosted: ${s_boosted}\
        \n🌌| Nitro server teir: ${s_teir}\
        \n⭐| I am now in ${s_count} servers!\
        \`\`\``)
    .setColor(color)
    .setTimestamp();
    const owner = await client.users.fetch('507793672209825792');
    owner.send(embed);
}

// Commands index.js
const commands = require('./commands');                                                     // Importing  commands index.js
require('dotenv').config();                                                                 // doxenv allows us to read .env files as enviroment variables

client.login(process.env.token);                                                            // Logging into our bot (Token is supplied in .env)

client.on('ready', async ()=>{
    log(`Logged in as ${`${client.user.username}`.underline}.`)                             // Logging that our login was successfull
    client.user.setPresence({activity:{name: "`help",type: "LISTENING"},status: "online"})
    log(`Set to default status`)
}) 

client.on("error", async (e)=>
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
})

// When we join a new server
client.on("guildCreate", async (server) =>
{
    send_server_update(server, process.env.BOT_COLOR)
})

client.on("guildDelete", async (server) =>
{
    send_server_update(server, process.env.BOT_COLOR_ERR)
})

client.on("resume", async (replays) =>
{
    sendmessage(`Reconnected to websocket\nREPLAYS: ${replays}`);
})

client.on("warn", async (info) =>
{
    sendmessage(`WARNING: ${info}`);
})

client.on('message', commands);                                                             // Messages event listener, commands found in ./commands/index.js