import { MessageEmbed } from 'discord.js';
import { Command } from './../types/command';

export const Donate: Command = {
    name: 'donate',
    description: 'Support the continued development of monkey bot.',
    type: 'CHAT_INPUT',
    run: async(client, interaction) => {
        const donateUrl = 'https://www.paypal.com/donate/?hosted_button_id=JL96WKNEHXY7Y';

        const embed = new MessageEmbed()
            .setColor('#42b983')
            .setDescription(`You can support <@${client.user?.id}> by donating [here](${donateUrl})!`);

        await interaction.followUp({
            ephemeral: true,
            embeds: [embed],
        })
    }
}