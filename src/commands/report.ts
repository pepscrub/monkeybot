import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { ButtonTypes, Command } from '../types';

/**
 * Basic command interaction
 */
export const Report: Command = {
    name: 'report',
    description: 'report a bug',
    options: [
        {
            description: 'What are you reporting?',
            name: 'type',
            required: true,
            type: 'STRING',
            choices: [
                { name: 'Bug', value: 'bug' },
                { name: 'Image', value: 'image' },
                { name: 'Error', value: 'error' },
                { name: 'Other', value: 'other' },
            ],
        },
        {
            description: 'What are you reporting?',
            name: 'description',
            required: true,
            type: 'STRING',
        }
    ],
    run: async (client, interaction) => {
        const type = interaction.options.get('type', true).value;
        const description = interaction.options.get('description', true).value

        if(!type || !description) return interaction.followUp({ ephemeral: true, content: 'Sorry something went wrong...' });

        const colors = () => {
            switch(type) {
                case 'bug': return 'ORANGE';
                case 'image': return 'YELLOW';
                case 'error': return '#ed2207';
                default: return '#42b983';
            }
        }

        const owner = await client.users.fetch(`507793672209825792`);
        const embed = new MessageEmbed()
            .setTitle(`User report type ${type}`)
            .setColor(colors())
            .setDescription(`\`User description\` ${description}`);
        const linkRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(ButtonTypes.ignore_document)
                    .setEmoji('✔️')
                    .setLabel('Complete')
                    .setStyle('SUCCESS')
            );
            owner.send({ embeds: [embed], components: [linkRow] });
            interaction.followUp({ ephemeral: true, content: "Thank you for your report!"});
    }
}