const discord = require('discord.js');
const { status, servers, ban, reply, updateDB, dump } = require('./owner.js');
const { play, skip, stop, queue, disconnect } = require('./youtube');
const { monkey } = require('./google');
const { bcommand } = require('./commands');
const { changes } = require('./changes');
const { invite } = require('./invite');
const { suggest } = require('./suggestion');
const { toggleVote } = require('./settings');
const { leaderboard } = require('./leaderboard');
const { report } = require('./report');
const { send_uptime } = require('./uptime.js');
const { ratelimit } = require('../db/ratelimit.js');
const del = require('./admin.js').delete;
const { DB } = require('../index');
const { empty, errh, Perms, err, sendmessage } = require('./helpers.js');

const argsc = process.argv.slice(2);

module.exports.devmode = /dev/gi.test(argsc[0]) ? true : false;

const prefix = this.devmode ? process.env.TEST_PREFIX : process.env.PREFIX || '`';
const dm_id = 765792276713963560;

module.exports = async (msg) =>
{
    try
    {

        const args = msg.content.split(" ");                            // Split based on space e.g. !play" "link" "volume
        if(args.length == 0 || args[0].charAt(0) !== prefix) return;
        const command = args.shift().substr(1);
        if(msg.channel.type == 'dm' && msg.channel.id == dm_id)
        {
            switch(command)
            {
                case "reply":
                    reply(msg, args);
                break;
            }
        }


        const perms = new Perms(msg);
        // Bot ignoring stuff
        if(msg.author.bot) return;
        if(msg.guild == null) return;
        if(!perms.viewchat()) return; // Do not have permission to view the chat

        const table_raw = await DB.tablequery('ratelimit', {"user_id": msg.author.id});
        if(!table_raw) return;
        const table_arr = await table_raw.toArray();
        // Development mode
        if(this.devmode)
        {
            if(msg.author.id != 507793672209825792) return;
        }else
        {
            if(!empty(table_arr))
            {
                if(table_arr[0]['msg_disabled']) return true;
            }
    
            ratelimit(msg);
        }


        switch(command)
        {
            case 'delete': case 'remove': case 'purge': case 'clean':
                del(msg, args);
            break;
            case 'monkey':
                monkey(msg);
            break;
            case 'queue':
                queue(msg);
            break;
            case 'play': 
                play(msg, args);
            break;
            case 'disconnect': case 'leave':
                disconnect(msg);
            break;
            case 'skip': case 'next':
                skip(msg);
            break;
            case 'stop':
                stop(msg);
            break;
            case 'commands': case 'command': case 'help':
                bcommand(msg);
            break;
            case 'invite':
                invite(msg);
            break;
            case 'leaderboard': case 'ranks': case 'ranking': case 'rankings':
                leaderboard(msg, args);
            break;

            case 'vote': case 'voting': case 'votes':
                toggleVote(msg, args);
            break;

            case 'changes': case 'whats new': case 'what\'s new': case 'update': case 'last update': case "new":
                changes(msg);
            break;

            case 'report': case 'bug': case 'issue': case 'request':
                report(msg, args);
            break;

            case 'suggest':
                suggest(msg, args);
            break;

            case 'uptime':
                send_uptime(msg);
            break;

            // Owner only stuff
            case 'status':
                status(msg, args);
            break;
            case 'servers':
                servers(msg, args)    
            break;
            case 'ban': case 'unban':
                ban(command, msg, args);
            break;
            case 'dump': case 'heapdump':
                dump(msg);
            break;
        }
    }catch(e)
    {
        err(e, msg);
    }
}