import 'dotenv/config';
import { Command } from '../types/command';
import { ENVConfig } from '../types/env';
import { MessageEmbed } from 'discord.js';
import en from 'javascript-time-ago/locale/en'
import fetch from 'node-fetch';
import readingTime from 'reading-time';
import TimeAgo from 'javascript-time-ago';

const CONFIG = process.env as unknown as ENVConfig;
const timeAgo = new TimeAgo('en-US');



interface GitHubCommit {
    commit: { author: { date: string }; message: string; }; // There's more here but this is all we care about
    stats: { total: number; additions: number; deletions: number; };
    author: { login: string; avatar_url: string; };
}

export const Changes: Command = {
    name: 'changes',
    description: 'Change-log of all things monkeybot related',
    type: 'CHAT_INPUT',
    run: async(client, interaction) => {


        const headers = { 'Authorization': `token ${CONFIG.GIT_TOKEN}` };
        const url = `https://api.github.com/repos/pepscrub/monkeybot/commits/master`;
        const { commit, stats, author }: GitHubCommit = await fetch(url, {"method": "GET", "headers": headers}).then((res)=>res.json());
        const { text } = readingTime(commit.message);

        const statsFormatted = `\n\n📈 Stats (${stats.total} changes)\
        \n✔️ Additions: ${stats.additions}\
        \n❌ Deletions: ${stats.deletions}`;

        const embed = new MessageEmbed()
            .setColor('#42b983')
            .setAuthor({name: author.login, url: author.avatar_url})
            .setDescription(`\`\`\`swift\n${new Date(commit.author.date).toLocaleString()} ${timeAgo.format(new Date(commit.author.date))}\
            \n📜 ${text}\
            \n${commit.message}\
            \n${statsFormatted}\
            \`\`\`
            `);

        await interaction.followUp({
            ephemeral: true,
            embeds: [embed],
        })
    }
}
