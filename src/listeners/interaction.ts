import { BaseCommandInteraction, ButtonInteraction, Client, Interaction, ModalSubmitInteraction } from "discord.js";
import { Logging } from "../database/logging";
import { Buttons } from '../buttons';
import { Commands } from '../commands';
import { Modals } from './../modals';

export const interactionCreate = (client: Client): void => {
    client.on('interactionCreate', async (interaction) => {
        if(interaction.isModalSubmit()) await handleModal(client, interaction);
        if(interaction.isButton()) await handleButtonInteractions(client, interaction);
        if(interaction.isCommand() || interaction.isContextMenu()) await handleSlashCommand(client, interaction);
    })
}

const handleSlashCommand = async (client: Client, interaction: BaseCommandInteraction) => {
    const slashCommand = Commands.find((c: { name: string; }) => c.name === interaction.commandName)
    await interaction.deferReply();
    if(!slashCommand) return interaction.followUp({ ephemeral: true, content: `🐒 Something happened... Can't read ${interaction.commandName}?...` });
    Logging(client, interaction);
    slashCommand.run(client, interaction);
}

const handleButtonInteractions = async (client: Client, interaction: ButtonInteraction) => {
    const button = Buttons.find((c: { name: string;}) => c.name === interaction.customId);
    if(!button) {
        interaction.followUp({ ephemeral: true, content: `🐒 Something happened... Can't read ${interaction.customId}?...` });
        return;
    }
    button.run(client, interaction);
}

const handleModal = async ( client: Client, interaction: ModalSubmitInteraction) => {
        const modalSubmit = Modals.find((c: { name: string }) => c.name === interaction.customId)
        await interaction.deferReply({ephemeral: true});
        if(!modalSubmit) {
            interaction.followUp({ ephemeral: true, content: `🐒 Something happened... Can't read ${interaction.customId}?...` })
            return;
        };
        modalSubmit.run(client, interaction);
}