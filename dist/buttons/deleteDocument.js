"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteDocument = void 0;
const discord_modals_1 = require("discord-modals");
const types_1 = require("../types");
exports.DeleteDocument = {
    name: types_1.ButtonTypes.delete_document,
    run: async (client, interaction) => {
        const userName = interaction.user.username;
        const modal = new discord_modals_1.Modal()
            .setCustomId(types_1.ModalTypes.deleteDocument)
            .setTitle('DELETING IMAGE')
            .addComponents(new discord_modals_1.TextInputComponent()
            .setCustomId('confirmation')
            .setLabel('Type your name to confirm')
            .setStyle('SHORT')
            .setPlaceholder(userName)
            .setMinLength(1)
            .setMaxLength(Math.floor(Math.random() * userName.length) + userName.length)
            .setRequired(true), new discord_modals_1.TextInputComponent()
            .setCustomId('url')
            .setLabel('Url to delete')
            .setStyle('SHORT')
            .setDefaultValue(interaction.message.embeds[0].thumbnail?.url ?? 'unable to find url')
            .setRequired(true));
        await interaction.showModal(modal);
    }
};
