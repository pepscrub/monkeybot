"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IgnoreDocumentReport = void 0;
const discord_js_1 = require("discord.js");
const button_1 = require("./../types/button");
exports.IgnoreDocumentReport = {
    name: button_1.ButtonTypes.ignore_document,
    run: async (client, interaction) => {
        const embed = interaction.message.embeds[0];
        const embeds = new discord_js_1.MessageEmbed()
            .setTitle('Ticket completed')
            .setDescription(embed?.description ?? '')
            .setThumbnail(embed?.thumbnail?.url ?? '')
            .setColor('AQUA');
        interaction.update({ embeds: [embeds], components: [] });
    }
};
