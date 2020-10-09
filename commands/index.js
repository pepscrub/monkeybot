const discord = require('discord.js');
const { status, servers } = require('./owner.js');
const { play, skip, stop, queue, disconnect} = require('./youtube');
const { monkey } = require('./google');
const { bcommand } = require('./commands');
const { changes } = require('./changes');
const { invite } = require('./invite');
const { log_commands } = require('../db/logging.js');
const { toggleVote } = require('./settings');
const { leaderboard } = require('./leaderboard');
const { report } = require('./report');
const { send_uptime } = require('./uptime.js');
const { ratelimit } = require('../db/ratelimit.js');
const del = require('./admin.js').delete;
const { DB } = require('../index');
const { empty, errh } = require('./helpers.js');



const prefix = process.env.PREFIX || '`';                                  // Import prefix from 

module.exports = async (msg) =>
{
    try
    {
        // Bot ignoring stuff
        if(msg.author.bot) return;
        const args = msg.content.split(" ");                            // Split based on space e.g. !play" "link" "volume
        if(args.length == 0 || args[0].charAt(0) !== prefix) return;
        const command = args.shift().substr(1);


        const rate_limit = async () =>
        {
            const table_raw = await DB.tablequery('ratelimit', {"user_id": msg.author.id});
            const table_arr = await table_raw.toArray();
            if(!empty(table_arr))
            {
                if(table_arr[0]['msg_disabled']) return true;
            }


            ratelimit(msg);
        }

        // Development mode
        const argsc = process.argv.slice(2);
        if(/dev/gi.test(argsc[0]))
        {
            if(msg.author.id != 507793672209825792) return;
        }


        switch(command)
        {
            case 'delete': case 'remove': case 'purge': case 'clean':
                if(rate_limit()) return;
                del(msg, args);
            break;
            case 'monkey':
                if(rate_limit()) return;
                monkey(msg);
            break;
            case 'queue':
                if(rate_limit()) return;
                queue(msg);
            break;
            case 'play': 
                if(rate_limit()) return;
                play(msg, args);
            break;
            case 'disconnect': case 'leave':
                if(rate_limit()) return;
                disconnect(msg);
            break;
            case 'skip': case 'next':
                if(rate_limit()) return;
                skip(msg);
            break;
            case 'stop':
                if(rate_limit()) return;
                stop(msg);
            break;
            case 'commands': case 'command': case 'help':
                if(rate_limit()) return;
                bcommand(msg);
            break;
            case 'invite':
                if(rate_limit()) return;
                invite(msg);
            break;
            case 'leaderboard': case 'ranks': case 'ranking': case 'rankings':
                if(rate_limit()) return;
                leaderboard(msg, args);
            break;

            case 'vote': case 'voting': case 'votes':
                if(rate_limit()) return;
                toggleVote(msg, args);
            break;

            case 'changes': case 'whats new': case 'what\'s new': case 'update': case 'last update': case "new":
                if(rate_limit()) return;
                changes(msg);
            break;

            case 'report': case 'bug': case 'issue': case 'request':
                if(rate_limit()) return;
                report(msg, args);
            break;

            case 'uptime':
                if(rate_limit()) return;
                send_uptime(msg);
            break;

            // Owner only stuff
            case 'status':
                if(rate_limit()) return;
                status(msg, args);
            break;
            case 'servers':
                if(rate_limit()) return;
                servers(msg, args)    
            break;
        }
    }catch(e)
    {
        errh(e, msg);
    }
}