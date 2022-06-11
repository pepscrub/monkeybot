import { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import { intwithcommas } from '../../utils/numbers';

export const servers = async (client: Client, interaction: BaseCommandInteraction, args?: string[]) => {
    const embed = new MessageEmbed();
    let length_check = 0;
    let members = 0;
    let i = 0;

    client.guilds.cache
        .sort((a,b)=>b.memberCount - a.memberCount)
        .map((server) => {
            if( !(i >= 24 || length_check >= 6000) ) {
                const {
                    name,
                    id,
                    memberCount,
                    partnered,
                    premiumSubscriptionCount,
                    premiumTier,
                    verified,
                    icon,
                    banner,
                    splash
                } = server;
                if(i === 0 ) embed.setThumbnail(`https://cdn.discordapp.com/icons/${id}/${icon || splash || banner || ''}.webp?size=256`);
                const header = `🕹 ${name} | 👪 \`${memberCount}\``;
                const body = `\`\`\`swift
                \n🌏| ${server.preferredLocale}\
                \n✅| ${verified ? 'verified' : 'not verified'}\
                \n☄️| ${partnered ? 'Partnered' : 'Not Partnered'}\
                \n🚀| Nitro boosted: ${premiumSubscriptionCount}\
                \n🌌| Nitro server teir: ${premiumTier}
                \`\`\``;
                
                length_check += header.length;
                length_check += body.length;
                i++;
                if(length_check < 6000) embed.addField(header, body)
            }

            members += server.memberCount;
        });

    const title = `${client.user?.username} servers list`;
    const description = `\`\`\`swift\nGeneral Information\
    \nTotal servers bot is in: ${intwithcommas(client.guilds.cache.size)}\
    \nTotal users in all servers: ${intwithcommas(members)}\
    \`\`\``;

    length_check += title.length;
    length_check += description.length;

    embed
        .setTitle(title)
        .setDescription(description)
        .setColor('#42b983');
    await interaction.followUp({
        ephemeral: args && args[0] ? false : true,
        embeds: [embed]
    })
}