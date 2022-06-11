import { Command } from '../types/command'
import { MessageActionRow, MessageEmbed } from 'discord.js';
import { MonkeyGoogle, MonkeyReddit, MonkeySaved } from '../monkey';

/**
 * Basic command interaction
 */
export const Monkey: Command = {
    name: 'monkey',
    description: 'Image of a random monkey',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'type',
            description: 'How you would like to get your monkey image? (default is random)',
            type: 'STRING',
            choices:[
                { name: 'google', value: 'google' },
                { name: 'reddit', value: 'reddit' },
                { name: 'random', value: 'random' },
                { name: 'saved', value: 'database' },
            ]

        }
    ],
    run: async(client, interaction) => {
        const option = interaction.options.get('type')?.value ?? 'random';
        const embed = new MessageEmbed();
        const linkRow = new MessageActionRow()

        switch(option){
            case 'reddit': return MonkeyReddit(embed, linkRow, interaction);
            case 'database': return MonkeySaved(embed, linkRow, interaction);
            case 'google': return MonkeyGoogle(embed, linkRow, interaction);
            case 'random': return Math.floor(Math.random() * 2) ? MonkeyGoogle(embed, linkRow, interaction) : MonkeyReddit(embed, linkRow, interaction);
            default: return Math.floor(Math.random() * 2) ? MonkeyGoogle(embed, linkRow, interaction) : MonkeyReddit(embed, linkRow, interaction);
        };
    }
}