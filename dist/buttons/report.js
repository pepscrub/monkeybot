"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const types_1 = require("../types");
const discord_modals_1 = require("discord-modals");
const types_2 = require("../types");
exports.Report = {
    name: types_2.ButtonTypes.report,
    run: async (client, interaction) => {
        const modal = new discord_modals_1.Modal()
            .setCustomId(types_2.ModalTypes.report)
            .setTitle('Report an image')
            .addComponents(new discord_modals_1.TextInputComponent()
            .setCustomId(types_1.ModalFields.report_input)
            .setLabel('Description of your report')
            .setStyle('SHORT')
            .setPlaceholder(`Didn't display an image... Image not found...`)
            .setRequired(false));
        await interaction.showModal(modal);
    }
};
