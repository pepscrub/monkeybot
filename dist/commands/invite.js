"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = void 0;
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
exports.Invite = {
    name: 'invite',
    description: 'Invite all things monkey.',
    type: 'CHAT_INPUT',
    run: async (client, interaction) => {
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=2147601408&scope=bot%20applications.commands`;
        const linkRow = new discord_js_2.MessageActionRow()
            .addComponents(new discord_js_2.MessageButton()
            .setEmoji('🐒')
            .setURL(inviteLink)
            .setStyle('LINK')
            .setLabel('Invite to your server'));
        const embed = new discord_js_1.MessageEmbed().setDescription(`Invite [${client.user?.username}](${inviteLink}) to your server!`);
        await interaction.followUp({
            ephemeral: true,
            embeds: [embed],
            components: [linkRow]
        });
    }
};
