"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
exports.Report = {
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
        const description = interaction.options.get('description', true).value;
        if (!type || !description)
            return interaction.followUp({ ephemeral: true, content: 'Sorry something went wrong...' });
        const colors = () => {
            switch (type) {
                case 'bug': return 'ORANGE';
                case 'image': return 'YELLOW';
                case 'error': return 'RED';
                default: return 'GREYPLE';
            }
        };
        const owner = await client.users.fetch(`507793672209825792`);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(`User report type ${type}`)
            .setColor(colors())
            .setDescription(`\`User description\` ${description}`);
        const linkRow = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId(types_1.ButtonTypes.ignore_document)
            .setEmoji('✔️')
            .setLabel('Complete')
            .setStyle('SUCCESS'));
        owner.send({ embeds: [embed], components: [linkRow] });
        interaction.followUp({ ephemeral: true, content: "Thank you for your report!" });
    }
};
