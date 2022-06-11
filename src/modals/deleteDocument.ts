import { Columns } from '../types';
import { ButtonTypes, ModalFields } from '../types';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { ModalTypes } from '../types';
import { Modal as CustomModal } from "../types";
import { DataBase } from '../database';

export const DeleteDocument: CustomModal = {
    name: ModalTypes.deleteDocument,
    run: async (client, interaction) => {
        const textInput = interaction.fields.getTextInputValue('confirmation');
        if(textInput !== interaction.user.username) return interaction.followUp({ content: 'Invalid capcha...'});
        const url = interaction.fields.getTextInputValue('url');

        DataBase.delete(Columns.monkey, { url })
            .then(({ deletedCount })=>{
                const embed = new MessageEmbed()
                    .setTitle('Deleted')
                    .setDescription('succesfully deleted image from database.')
                    .setColor('#42b983')
                    .setThumbnail(url)
                if(deletedCount === 0) {
                    embed.setDescription('Image was already deleted')
                    interaction.replied ? interaction.deleteReply() : interaction.followUp({ embeds: [embed], components: [] });
                    return;
                }
                interaction.replied ? interaction.deleteReply() : interaction.followUp({ embeds: [embed], components: [] });
                return;
            })
            .catch(()=>{
                interaction.followUp({content: 'Unable to delete image... something must of happened'});
            })
    }
}