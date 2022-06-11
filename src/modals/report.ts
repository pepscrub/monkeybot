import { ButtonTypes, ModalFields } from '../types';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { ModalTypes } from '../types';
import { Modal as CustomModal } from "../types";

export const Report: CustomModal = {
    name: ModalTypes.report,
    run: async (client, interaction) => {
        const image = interaction.message?.embeds[0].image?.url;
        const owner = await client.users.fetch(`507793672209825792`);
        const textInput = interaction.fields.getTextInputValue(ModalFields.report_input);
        const embed = new MessageEmbed()
            .setTitle('User report')
            .setThumbnail(image ?? '')
            .setColor('#ed2207')
            .setDescription(`\`User description\` ${textInput}\n\`URL\` ${image}`);
        const linkRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(ButtonTypes.delete_document)
                    .setLabel('Delete Image')
                    .setEmoji('☠️')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId(ButtonTypes.ignore_document)
                    .setEmoji('✔️')
                    .setLabel('Complete')
                    .setStyle('SUCCESS')
            );
        interaction.followUp({content: "Thank you for your report!"});
        owner.send({ embeds: [embed], components: [linkRow] });
    }
}