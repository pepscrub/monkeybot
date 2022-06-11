import { ButtonInteraction, MessageEmbed } from 'discord.js';
import { Button, ButtonTypes } from './../types/button';
export const IgnoreDocumentReport: Button = {
    name: ButtonTypes.ignore_document,
    run: async (client, interaction: ButtonInteraction) => {
        const embed = interaction.message.embeds[0];
        const embeds = new MessageEmbed()
            .setTitle('Ticket completed')
            .setDescription(embed?.description ?? '')
            .setThumbnail(embed?.thumbnail?.url ?? '')
            .setColor('AQUA')
        interaction.update({ embeds: [embeds], components: [] })
    }
}