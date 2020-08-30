const discord = require('discord.js');

/**
 * @description gets the current date in a 12 hour format
 */
module.exports.timestamp = () =>new Date().toLocaleString()
/**
 * @description It's just a fancier console.log
 * @param {Object} msg 
 * @param {String} text
 */
module.exports.log = (text, msg = null) =>
{
    if(typeof(text) == 'object') text = JSON.stringify(text);
    if(!msg) console.log(`${'[Monkey]'.bold.green} ${this.timestamp()} ${text}`)
    else console.log(`${'[Monkey]'.bold.green} ${`${msg.guild.name}`.italic.cyan} ${this.timestamp()} ${text}`)
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
    admin(){return this.msg.member.guild.me.hasPermission(['ADMINISTRATOR'])}
    /**
     * @description Returns boolean if the user is allowed to delete
     * messages, reactions, pin messages ...
     * @returns {boolean} 
     */
    del(){return this.msg.member.guild.me.hasPermission(['MANAGE_MESSAGES'])}
    /**
     * @description Returns boolean if the user is allowed to send files
     * @returns {boolean} 
     */
    attach(){return this.msg.member.guild.me.hasPermission(['ATTACH_FILES'])}
    /**
     * @description Returns boolean if the user is allowed to send messages
     * @returns {boolean} 
     */
    /**
     * @description Returns boolean if the user is allowed to add reactions to a message
     * @returns {boolean} 
     */
    react(){return this.msg.member.hasPermission('ADD_REACTIONS')}
    msg(){return this.msg.member.guild.me.hasPermission(['SEND_MESSAGES'])}
    /**
     * @description Returns boolean if the user is allowed to view the current channel
     * @returns {boolean} 
     */
    viewchat(){return this.msg.member.guild.me.hasPermission(['VIEW_CHANNEL'])}
    /**
     * @description Returns boolean if the user is allowed to speak
     * @returns {boolean} 
     */
    speak(){return this.msg.member.guild.me.hasPermission(['SPEAK'])}
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
    admin(){return this.msg.member.hasPermission(['ADMINISTRATOR'])}
    /**
     * @description Returns boolean if the user is allowed to delete
     * messages, reactions, pin messages ...
     * @returns {boolean} 
     */
    del(){return this.msg.member.hasPermission(['MANAGE_MESSAGES'])}
    /**
     * @description Returns boolean if the user is allowed to send files
     * @returns {boolean} 
     */
    attach(){return this.msg.member.hasPermission(['ATTACH_FILES'])}
    /**
     * @description Returns boolean if the user is allowed to add reactions to a message
     * @returns {boolean} 
     */
    react(){return this.msg.member.hasPermission('ADD_REACTIONS')}
    /**
     * @description Returns boolean if the user is allowed to send messages
     * @returns {boolean} 
     */
    msg(){return this.msg.member.hasPermission(['SEND_MESSAGES'])}
    /**
     * @description Returns boolean if the user is allowed to view the current channel
     * @returns {boolean} 
     */
    viewchat(){return this.msg.member.hasPermission(['VIEW_CHANNEL'])}
    /**
     * @description Returns boolean if the user is allowed to speak
     * @returns {boolean} 
     */
    speak(){return this.msg.member.hasPermission(['SPEAK'])}
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
  * @param {Error} e Error message
  * @param {Object} msg Discord API message manager
  * @description Sends an error message into chat
  */
module.exports.err = (e, msg) =>
{
    const perms = new this.Perms(msg);
    const title = perms.del() ? "Click the X to close this message" : "Something happened ..."
    const embed = new discord.MessageEmbed()
    .setTitle(title)
    .setDescription(`\`\`\`${e}\`\`\``)
    .setColor(process.env.BOT_COLOR_ERR)
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
    .setTimestamp();
    if(msg.channel == undefined) return;
    else
    {
        msg.channel.send(embed).then(thismsg=>{this.delreact(thismsg)})
    }
}

 /**
  * @description Adds a reaction to a given message and after x amount of ms will delete the message
  * @param {Object} msg Discord API message manager
  */
module.exports.delreact = (msg) =>
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
}


 /**
  * @param {object} msg Discord API message manager
  * @param {String} desc Text to send to the user
  * @description Basic message embed
  */
module.exports.sendmessage = (msg, desc) => {
    const embed = new discord.MessageEmbed()
    .setAuthor(this.randomnoise(), msg.client.user.displayAvatarURL())
    .setColor(process.env.BOT_COLOR)
    .setTitle(`${desc}`)
    .setTimestamp()
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`);
    msg.channel.send(embed);
}


module.exports.empty = (obj) =>
{
    for(const key in obj)
    {
        if(obj.hasOwnProperty(key)) return false;
    }
    return true;
}