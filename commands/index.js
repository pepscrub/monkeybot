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
const del = require('./admin.js').delete;



const prefix = process.env.PREFIX || '`';                                  // Import prefix from 

module.exports = async (msg) =>
{
    if(msg.author.bot) return;
    const args = msg.content.split(" ");                            // Split based on space e.g. !play" "link" "volume
    if(args.length == 0 || args[0].charAt(0) !== prefix) return;
    const command = args.shift().substr(1);
    switch(command)
    {
        case 'delete': case 'remove': case 'purge':
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

        case 'report': case 'bug': case 'issue':
            report(msg, args);
        break;

        // Owner only stuff
        case 'status':
            status(msg, args);
        break;
        case 'servers':
            servers(msg, args)    
        break;

    }
}