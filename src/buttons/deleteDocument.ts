import { ButtonInteraction, TextBasedChannel } from 'discord.js';
import { Modal, TextInputComponent } from 'discord-modals';
import { ButtonTypes, ModalFields, ModalTypes } from '../types';
import { Button } from './../types';

/**
 * Basic command interaction
 */
export const DeleteDocument: Button = {
    name: ButtonTypes.delete_document,
    run: async (client, interaction: ButtonInteraction) => {
        const userName = interaction.user.username
        const modal = new Modal()
            .setCustomId(ModalTypes.deleteDocument)
            .setTitle('DELETING IMAGE')
            .addComponents(
                new TextInputComponent()
                    .setCustomId('confirmation')
                    .setLabel('Type your name to confirm')
                    .setStyle('SHORT')
                    .setPlaceholder(userName)
                    .setMinLength(1)
                    .setMaxLength(Math.floor(Math.random() * userName.length) + userName.length)
                    .setRequired(true),
                new TextInputComponent()
                    .setCustomId('url')
                    .setLabel('Url to delete')
                    .setStyle('SHORT')
                    .setDefaultValue(interaction.message.embeds[0].thumbnail?.url ?? 'unable to find url')
                    .setRequired(true)
            )
        await interaction.showModal(modal);
    }
}