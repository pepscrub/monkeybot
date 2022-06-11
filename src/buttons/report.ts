import { ModalFields } from '../types';
import { ButtonInteraction, MessageSelectMenu, TextBasedChannel } from 'discord.js';
import { Modal, TextInputComponent, showModal } from 'discord-modals';
import { ButtonTypes, ModalTypes } from '../types';
import { Button } from './../types';

/**
 * Basic command interaction
 */
export const Report: Button = {
    name: ButtonTypes.report,
    run: async (client, interaction: ButtonInteraction) => {
        const modal = new Modal()
            .setCustomId(ModalTypes.report)
            .setTitle('Report an image')
            .addComponents(
                new TextInputComponent()
                    .setCustomId(ModalFields.report_input)
                    .setLabel('Description of your report')
                    .setStyle('SHORT')
                    .setPlaceholder(`Didn't display an image... Image not found...`)
                    .setRequired(false)
            );

        await interaction.showModal(modal);
    }
}