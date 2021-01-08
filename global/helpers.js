const { wss, sockets } = require('../web_backend/ws');
const ansispan = require('ansispan');
const discord = require('discord.js');
const ta = require('time-ago')
const args = process.argv.slice(2);
let dev = false;
let debug = false;

args.forEach(arg=>
{
    if(/dev/gi.test(arg)) dev = true;
    if(/debug/gi.test(arg)) debug = true;
})

/**
 * @description gets the current date in a 12 hour format
 */
module.exports.timestamp = () =>new Date().toLocaleString()

module.exports.log = (text, msg = null, origin = '[Monkey Bot]'.bold.green) =>
{
    try
    {
        if(dev)
        {
            if(typeof(text) == 'object') text = JSON.stringify(text);
            if(!msg) console.log(`${origin} ${this.timestamp()} ${text}`)
            else console.log(`${origin} ${this.timestamp()} ${`${msg.guild.name}`.italic.cyan} ${text}`)
        }

        sockets.forEach(socket=>
        {
            if(typeof(text) == 'object') text = JSON.stringify(text);
            if(!msg) socket.send(`${ansispan(origin)} | ${this.timestamp()} | ${ansispan(text)}`)
            else socket.send(`${ansispan(origin)} | ${this.timestamp()} | ${ansispan(`${msg.guild.name}`.italic.cyan)} | ${ansispan(text)}`)
        })

    }catch(e)
    {
        console.log(e)
    }
}

module.exports.intwithcommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports.truncate = (str, n) => {try{return str.length > n ? `${str.substr(0, n-1)}…` : str;}catch(e){console.error(e);}}

module.exports.checkurl = (url) =>
{
    if(url == null)
    {
        return 'https://canary.contestimg.wish.com/api/webimage/5ec797cb29b38e548541da43-large.jpg?cache_buster=013886739c3b31130737c7ee955fa50d'
    }else{
        return url;
    }
}


 /**
  * @returns {String} Random monkey text from array
  * @TODO Move noises to mongodb
  */
module.exports.randomnoise = () =>
{
    const noise = [
        'OOOOOOOOOO OOOO AHHHHHHH AH',
        'OOOOOO',
        'MMMM OOOO OOO AAAA AAAH',
        'AAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '*Monkey noises*',
        'AAAA OOOO OO AA OOOOooooOO',
        'AAA OOOOOOO',
        'OOOOOO AAAAAAH AHHHHHHHHHHHHHHHHHHH',
        'EEK EEEEK',
        'HOOO HOOO HOOOOOO',
        'OOOOO OOOOO OOOO',
        'OOOK OOOO HOOOO'
    ]
    const r = Math.floor(Math.random() * noise.length)
    return noise[r];
}

 /**
  * @description Adds a reaction to a given message and after x amount of ms will delete the message
  * @param {Object} msg Discord API message manager
  */
module.exports.delreact = (msg) =>
{
    try
    {
        const perms = new this.Perms(msg);
        if(!perms.del()) return;     // Check to see if we have manage_messages
        msg.react('❌');                                                                                 // React to our msg with X
        const filter = (reaction, user) => '❌' === reaction.emoji.name && user.id === msg.author.id;    // Some filter shit ??
        msg.awaitReactions(filter, {time: 5000}).then(result=>
        {
            if(msg.deleted) return;
            if(result.get('❌').count-1 >= 1) msg.delete();
            else msg.reactions.removeAll().catch();
        })
        .catch(e=>
        {
            console.log(e)
        })
    }catch(e)
    {
        this.err(e, msg);
    }
}


 /**
  * @param {object} msg Discord API message manager
  * @param {String} desc Text to send to the user
  * @description Basic message embed
  */
module.exports.sendmessage = (msg, desc) => {
    try
    {
        const embed = new discord.MessageEmbed()
        .setAuthor(this.randomnoise(), msg.client.user.displayAvatarURL())
        .setColor(process.env.BOT_COLOR)
        .setTitle(`${desc}`)
        .setTimestamp()
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, this.checkurl(msg.author.avatarURL()));
        msg.channel.send(embed);
    }catch(e)
    {
        this.err(e, msg);
    }
}


module.exports.empty = (obj) =>
{
    try
    {
        for(const key in obj)
        {
            if(obj.hasOwnProperty(key)) return false;
        }
        return true;
    }catch(e)
    {
        this.err(e, msg);
        return true;
    }
}


/**
 * @description Bot specific permissions
 */
module.exports.Perms = class Perms
{
    constructor(msg){this.msg = msg;}

    // All functions return a bool for if the bot has permissions
    /**
     * @description Returns boolean if the user is an admin
     * @returns {boolean} 
     */
    admin(){try{return this.msg.guild == null ? console.log("admin Can't get permissions") :  this.msg.member.guild.me.hasPermission(['ADMINISTRATOR'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to delete
     * messages, reactions, pin messages ...
     * @returns {boolean} 
     */
    del(){try{
        return this.msg.guild == null ? console.log(`${this.msg.author.username} delete Can't get permissions`) : this.msg.member.guild.me.hasPermission(['MANAGE_MESSAGES'])
    }catch(e){
        console.error(e);
    }}
    /**
     * @description Returns boolean if the user is allowed to send files
     * @returns {boolean} 
     */
    attach(){try{return this.msg.guild == null ? console.log("attach Can't get permissions") :  this.msg.member.guild.me.hasPermission(['ATTACH_FILES'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to send messages
     * @returns {boolean} 
     */
    /**
     * @description Returns boolean if the user is allowed to add reactions to a message
     * @returns {boolean} 
     */
    react(){try{return this.msg.guild == null ? console.log("react Can't get permissions") :  this.msg.member.hasPermission('ADD_REACTIONS')}catch(e){console.error(e);}}
    message(){try{return this.msg.guild == null ? console.log("message Can't get permissions") :  this.msg.member.guild.me.hasPermission(['SEND_MESSAGES'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to view the current channel
     * @returns {boolean} 
     */
    viewchat(){try{return this.msg.guild == null ? console.log("viewchat Can't get permissions") :  this.msg.member.guild.me.hasPermission(['VIEW_CHANNEL'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to speak
     * @returns {boolean} 
     */
    speak(){try{return this.msg.guild == null ? console.log("speak Can't get permissions") :  this.msg.member.guild.me.hasPermission(['SPEAK'])}catch(e){console.error(e);}}

    connect(){try{return this.msg.guild == null ? console.log("connect Can't get permissions") :  this.msg.member.guild.me.hasPermission(['CONNECT'])}catch(e){console.error(e);}}

    invite(){try{return this.msg.guild == null ? console.log("invite Can't get permissions") :  this.msg.member.guild.me.hasPermission(['CREATE_INSTANT_INVITE'])}catch(e){console.error(e)}}
}

/**
 * @description User specific permissions
 */
module.exports.UserPerms = class UserPerms
{
    /**
     * 
     * @param {Object} msg 
     */
    constructor(msg){this.msg = msg;}

    /**
     * @description Returns boolean if the user is an admin
     * @returns {boolean} 
     */
    admin(){try{return this.msg.guild == null ? console.log("admin Can't get permissions") :  this.msg.member.hasPermission(['ADMINISTRATOR'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to delete
     * messages, reactions, pin messages ...
     * @returns {boolean} 
     */
    del(){try{return this.msg.guild == null ? console.log("delete Can't get permissions") :  this.msg.member.hasPermission(['MANAGE_MESSAGES'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to send files
     * @returns {boolean} 
     */
    attach(){try{return this.msg.guild == null ? console.log("attach Can't get permissions") :  this.msg.member.hasPermission(['ATTACH_FILES'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to add reactions to a message
     * @returns {boolean} 
     */
    react(){try{return this.msg.guild == null ? console.log("react Can't get permissions") :  this.msg.member.hasPermission('ADD_REACTIONS')}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to send messages
     * @returns {boolean} 
     */
    msg(){try{return this.msg.guild == null ? console.log("message Can't get permissions") :  this.msg.member.hasPermission(['SEND_MESSAGES'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to view the current channel
     * @returns {boolean} 
     */
    viewchat(){try{return this.msg.guild == null ? console.log("view chat Can't get permissions") :  this.msg.member.hasPermission(['VIEW_CHANNEL'])}catch(e){console.error(e);}}
    /**
     * @description Returns boolean if the user is allowed to speak
     * @returns {boolean} 
     */
    speak(){try{return this.msg.guild == null ? console.log("speak Can't get permissions") :  this.msg.member.hasPermission(['SPEAK'])}catch(e){console.error(e);}}
}

 /**
  * @param {Error} e Error message
  * @param {Object} msg Discord API message manager
  * @description Sends an error message into chat
  */
 module.exports.err = async (e, msg = null) =>
 {
     try
     { 
         if(msg == null || msg.channel == undefined) return;
         else
         {
             const problem_file = e.stack.toString().match(/\(.*?js.*/gm)[0];
             const embed = new discord.MessageEmbed()
             .setColor(process.env.BOT_COLOR_ERR)
             .setFooter(`${msg.author.username}#${msg.author.discriminator}`, this.checkurl(msg.author.avatarURL()))
             .setTimestamp()
             .setDescription(`\`\`\`swift\n${e.name}: ${e.message}\
             \n Process killed: ${ta.today()}\
             \n🐛 ${problem_file}\
             \n\n
             \n🥞 Full error stack\
             \n${e.stack}\
             \`\`\``)
             const owner = await msg.client.users.fetch('507793672209825792');
             owner.send(embed);
         }
         setTimeout(()=>{process.kill(process.pid, "SIGINT");},5000)
     }catch(e)
     {
         console.log(e);
     }
 }