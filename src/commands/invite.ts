import { MessageEmbed } from 'discord.js';
import { Client } from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { Command } from './../types/command';

/**
 * Basic command interaction
 */
export const Invite: Command = {
    name: 'invite',
    description: 'Invite all things monkey.',
    type: 'CHAT_INPUT',
    run: async(client, interaction) => {

        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=2147601408&scope=bot%20applications.commands`;

        const linkRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setEmoji('🐒')
                    .setURL(inviteLink)
                    .setStyle('LINK')
                    .setLabel('Invite to your server')
            )
        
        const embed = new MessageEmbed().setDescription(`Invite [${client.user?.username}](${inviteLink}) to your server!`);

        await interaction.followUp({
            ephemeral: true,
            embeds: [embed],
            components: [linkRow]
        })
    }
}