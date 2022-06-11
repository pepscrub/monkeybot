import { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import TimeAgo from 'javascript-time-ago';
const timeAgo = new TimeAgo('en-US');

export const uptime = async (client: Client, interaction: BaseCommandInteraction) => {
    const uptime = new Date().setMilliseconds(process.uptime() * 1000);
    const time = timeAgo.format(uptime, 'twitter').toString();
    const embed = new MessageEmbed()
        .setColor('#42b983')
        .setDescription(`\`\`\`swift\n${client.user?.username} has been online for 🟢 ${time === 'just now' ? '0 seconds' : time}\`\`\``);

    await interaction.followUp({
        ephemeral: true,
        embeds: [embed]
    })
}