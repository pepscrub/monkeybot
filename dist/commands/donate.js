"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Donate = void 0;
const discord_js_1 = require("discord.js");
exports.Donate = {
    name: 'donate',
    description: 'Support the continued development of monkey bot.',
    type: 'CHAT_INPUT',
    run: async (client, interaction) => {
        const donateUrl = 'https://www.paypal.com/donate/?hosted_button_id=JL96WKNEHXY7Y';
        const embed = new discord_js_1.MessageEmbed().setDescription(`You can support <@${client.user?.id}> by donating [here](${donateUrl})!`);
        await interaction.followUp({
            ephemeral: true,
            embeds: [embed],
        });
    }
};
