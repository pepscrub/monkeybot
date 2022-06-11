"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const types_1 = require("../types");
const discord_js_1 = require("discord.js");
const types_2 = require("../types");
exports.Report = {
    name: types_2.ModalTypes.report,
    run: async (client, interaction) => {
        const image = interaction.message?.embeds[0].image?.url;
        const owner = await client.users.fetch(`507793672209825792`);
        const textInput = interaction.fields.getTextInputValue(types_1.ModalFields.report_input);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('User report')
            .setThumbnail(image ?? '')
            .setColor('RED')
            .setDescription(`\`User description\` ${textInput}\n\`URL\` ${image}`);
        const linkRow = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId(types_1.ButtonTypes.delete_document)
            .setLabel('Delete Image')
            .setEmoji('☠️')
            .setStyle('DANGER'), new discord_js_1.MessageButton()
            .setCustomId(types_1.ButtonTypes.ignore_document)
            .setEmoji('✔️')
            .setLabel('Complete')
            .setStyle('SUCCESS'));
        interaction.followUp({ content: "Thank you for your report!" });
        owner.send({ embeds: [embed], components: [linkRow] });
    }
};
