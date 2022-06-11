"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Monkey = void 0;
const discord_js_1 = require("discord.js");
const monkey_1 = require("../monkey");
exports.Monkey = {
    name: 'monkey',
    description: 'Image of a random monkey',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'type',
            description: 'How you would like to get your monkey image? (default is random)',
            type: 'STRING',
            choices: [
                { name: 'google', value: 'google' },
                { name: 'reddit', value: 'reddit' },
                { name: 'random', value: 'random' },
                { name: 'saved', value: 'database' },
            ]
        }
    ],
    run: async (client, interaction) => {
        const option = interaction.options.get('type')?.value ?? 'random';
        const embed = new discord_js_1.MessageEmbed();
        const linkRow = new discord_js_1.MessageActionRow();
        switch (option) {
            case 'reddit': return (0, monkey_1.MonkeyReddit)(embed, linkRow, interaction);
            case 'database': return (0, monkey_1.MonkeySaved)(embed, linkRow, interaction);
            case 'google': return (0, monkey_1.MonkeyGoogle)(embed, linkRow, interaction);
            case 'random': return Math.floor(Math.random() * 2) ? (0, monkey_1.MonkeyGoogle)(embed, linkRow, interaction) : (0, monkey_1.MonkeyReddit)(embed, linkRow, interaction);
            default: return Math.floor(Math.random() * 2) ? (0, monkey_1.MonkeyGoogle)(embed, linkRow, interaction) : (0, monkey_1.MonkeyReddit)(embed, linkRow, interaction);
        }
        ;
    }
};
