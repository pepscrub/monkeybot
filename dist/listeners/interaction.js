"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionCreate = void 0;
const logging_1 = require("../database/logging");
const buttons_1 = require("../buttons");
const commands_1 = require("../commands");
const modals_1 = require("./../modals");
const interactionCreate = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (interaction.isModalSubmit())
            await handleModal(client, interaction);
        if (interaction.isButton())
            await handleButtonInteractions(client, interaction);
        if (interaction.isCommand() || interaction.isContextMenu())
            await handleSlashCommand(client, interaction);
    });
};
exports.interactionCreate = interactionCreate;
const handleSlashCommand = async (client, interaction) => {
    const slashCommand = commands_1.Commands.find((c) => c.name === interaction.commandName);
    await interaction.deferReply();
    if (!slashCommand)
        return interaction.followUp({ ephemeral: true, content: `🐒 Something happened... Can't read ${interaction.commandName}?...` });
    (0, logging_1.Logging)(client, interaction);
    slashCommand.run(client, interaction);
};
const handleButtonInteractions = async (client, interaction) => {
    const button = buttons_1.Buttons.find((c) => c.name === interaction.customId);
    if (!button) {
        interaction.followUp({ ephemeral: true, content: `🐒 Something happened... Can't read ${interaction.customId}?...` });
        return;
    }
    button.run(client, interaction);
};
const handleModal = async (client, interaction) => {
    const modalSubmit = modals_1.Modals.find((c) => c.name === interaction.customId);
    await interaction.deferReply({ ephemeral: true });
    if (!modalSubmit) {
        interaction.followUp({ ephemeral: true, content: `🐒 Something happened... Can't read ${interaction.customId}?...` });
        return;
    }
    ;
    modalSubmit.run(client, interaction);
};
