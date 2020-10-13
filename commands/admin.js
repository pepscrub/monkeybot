const { err, Perms, UserPerms, sendmessage} = require('./helpers.js');
const discord = require('discord.js');
const ta = require('time-ago');

/**
 * @description Bulk delete message
 * @param {*} msg 
 * @param {String[]} args Expected: (String) 0-99
 */
module.exports.delete = (msg, args) =>
{
    try
    {
        const Bperms = new Perms(msg);
        const Uperms = new UserPerms(msg);
        let bot_perms = Bperms.admin() || Bperms.del();
        let user_perms = Uperms.admin() || Uperms.del();
        
        // User interactivity
        if(!bot_perms) sendmessage(msg, 'Bot missing permissions.');
        if(!user_perms) sendmessage(msg, 'User missing permissions.')
    
        if(bot_perms && user_perms)
        {
            try
            {
                if(args[0] < 0 || args[0] == undefined) return sendmessage(msg, "Can't delete nothing")
                else
                {
                    let count = parseInt(args[0]) + 1
                    if(!count || count == NaN)
                    {
                        sendmessage(msg, `Invalid args`);
                    }
                    else if(count > 100)
                    {
                        sendmessage(msg, `Can't delete more than 100 messages`);
                    }
                    else
                    {
                        msg.channel.messages.fetch({limit: count})
                        .then(messages=>{
                            messages.forEach(re=>{re.delete();count++;});
                        })
                        sendmessage(msg, `Deleted ${count} messages.`);
                    }
                }
            }catch(e)
            {
                console.log(e);
                err(e, msg);
            }
        }
    }catch(e)
    {
        err(e, msg);
    }
}