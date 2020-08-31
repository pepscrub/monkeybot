const discord = require('discord.js');
const { status } = require('./owner.js');
const { play, skip, stop, queue, disconnect} = require('./youtube');
const { monkey } = require('./google');
const { bcommand } = require('./commands');
const { invite } = require('./invite');
const { log_commands } = require('../db/logging.js');
const { leaderboard } = require('./leaderboard');
const del = require('./admin.js').delete;



const prefix = process.env.PREFIX || '`';                                  // Import prefix from 

module.exports = async (msg) =>
{
    const args = msg.content.split(" ");                            // Split based on space e.g. !play" "link" "volume
    if(args.length == 0 || args[0].charAt(0) !== prefix) return;
    const command = args.shift().substr(1);
    switch(command)
    {
        case 'delete': case 'remove': case 'purge':
            del(msg, args);
            log_commands(msg);
        break;
        case 'monkey':
            monkey(msg);
            log_commands(msg);
        break;
        case 'queue':
            queue(msg);
            log_commands(msg);
        break;
        case 'play':
            play(msg, args);
            log_commands(msg);
        break;
        case 'disconnect': case 'leave':
            disconnect(msg);
            log_commands(msg);
        break;
        case 'skip':
            skip(msg);
            log_commands(msg);
        break;
        case 'stop':
            stop(msg);
            log_commands(msg);
        break;
        case 'commands': case 'command': case 'help':
            bcommand(msg);
        break;
        case 'invite':
            invite(msg);
        break;
        case 'status':
            status(msg, args);
        break;
        case 'top':
            leaderboard(msg);
        break;
    }
}