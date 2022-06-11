"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteDocument = void 0;
const types_1 = require("../types");
const discord_js_1 = require("discord.js");
const types_2 = require("../types");
const database_1 = require("../database");
exports.DeleteDocument = {
    name: types_2.ModalTypes.deleteDocument,
    run: async (client, interaction) => {
        const textInput = interaction.fields.getTextInputValue('confirmation');
        if (textInput !== interaction.user.username)
            return interaction.followUp({ content: 'Invalid capcha...' });
        const url = interaction.fields.getTextInputValue('url');
        database_1.DataBase.delete(types_1.Columns.monkey, { url })
            .then(({ deletedCount }) => {
            const embed = new discord_js_1.MessageEmbed()
                .setTitle('Deleted')
                .setDescription('succesfully deleted image from database.')
                .setColor('AQUA')
                .setThumbnail(url);
            if (deletedCount === 0) {
                embed.setDescription('Image was already deleted');
                interaction.replied ? interaction.deleteReply() : interaction.followUp({ embeds: [embed], components: [] });
                return;
            }
            interaction.replied ? interaction.deleteReply() : interaction.followUp({ embeds: [embed], components: [] });
            return;
        })
            .catch(() => {
            interaction.followUp({ content: 'Unable to delete image... something must of happened' });
        });
    }
};
