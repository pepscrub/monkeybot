import { Command } from '../types/command'
import { MessageEmbed } from 'discord.js';
import { DataBase } from "../database";
import { intwithcommas } from '../utils/numbers';

interface AggreatedMongodb {
    _id: string;
    name: string;
    commandUsage: [string, number][];
    pfp: string;
}

/**
 * Basic command interaction
 */
export const leaderBoard: Command = {
    name: 'leaderboard',
    description: 'See who\'s the craziest about monkies',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'type',
            description: 'Command',
            type: 'STRING',
            choices: [
                { name: 'server', value: 'server' },
                { name: 'global', value: 'global' },
            ]
        }
    ],
    run: async(client, interaction) => {
        const option = interaction.options.get('type')?.value ?? 'global';
        const queryOptions = option === 'server' ? [{ $match: { 'server.id': interaction.guildId } },{ $unwind: '$users' }] : [{ $unwind: '$users' }];
        const embed = new MessageEmbed();
        const rawTable = await DataBase.table('commands');

        const queryFormatting = { 
            '$replaceRoot': {
                'newRoot': {
                    _id: {$first: '$users.id'},
                    name: {'$first': '$users.name'},
                    pfp: {$first: '$users.pfp'},
                    commandUsage: {'$first': '$users.commandusage'}
                }
            }
        };

        const tableAggreated = await rawTable.aggregate([ ...queryOptions, queryFormatting ]).toArray();
        const table = tableAggreated as unknown as AggreatedMongodb[];
        const output = table.map((value)=> {
            const exists = table.filter((filter)=> filter.name === value.name);
            const index = exists.indexOf(exists[0]);
            if(exists.length) table[index].commandUsage = table[index].commandUsage
                .concat(value.commandUsage);
            return value;
        })
        .sort((a,b) => b.commandUsage.length - a.commandUsage.length)

        embed
            .setColor('#42b983')
            .setTitle(`1. 🎉${output[0].name}🎉`)
            .setDescription(`\`\`\`swift ${intwithcommas(output[0].commandUsage.length)} interactions POG \`\`\``)
            .setThumbnail(output[0].pfp)
            .setURL(output[0].pfp)

        const length = output.length > 5 ? 5 : output.length;

        for(let i = 1; i < length; i++) {
            embed.addField(
                `${i+1}. ${output[i+1].name}`,
                `\`\`\`swift ${intwithcommas(output[i].commandUsage.length)} interactions! \`\`\``
            );
        };


        await interaction.followUp({
            ephemeral: true,
            embeds: [embed]
        })
    }
}