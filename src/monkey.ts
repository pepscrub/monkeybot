import { BaseCommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { DataBase } from "./database";
import { MonkeySettings, ButtonTypes, RedditResults, StoredMonkey } from "./types";
import fetch from 'node-fetch';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en'
import 'dotenv/config';
import { ENVConfig } from "./types/env";
export const CONFIG = process.env as unknown as ENVConfig;

TimeAgo.addDefaultLocale(en);
let quote_reached = 0;
let google_results: GoogleResultsData[] = [];

const timeAgo = new TimeAgo('en-US');
const SEARCH_KEY = CONFIG.SEARCH_KEY;
const SEARCH_KEY_SECOND = CONFIG.SEARCH_KEY_SECOND;


export const MonkeySaved = async (embed: MessageEmbed, linkRow: MessageActionRow, interaction: BaseCommandInteraction) => {
    const table = await DataBase.randomDocument('monkey_rankings');
    const settings = (await DataBase.randomDocument('settings'))[0] as MonkeySettings;
    const {url, color, users, rank} = table[0] as StoredMonkey;
    embed.setDescription(`Rank given: **${settings.colors[rank[0]][1]}**`)
        .setImage(url)
        .setColor(color[0])
        .setFooter({text: Array.isArray(users) ? users.join(', ') : users, iconURL: interaction.user.avatarURL() ?? 'https://canary.contestimg.wish.com/api/webimage/5ec797cb29b38e548541da43-large.jpg?cache_buster=013886739c3b31130737c7ee955fa50d'})
        .setTimestamp()

    linkRow.addComponents(
        new MessageButton()
            .setCustomId(ButtonTypes.report)
            .setLabel('Report image')
            .setStyle('SECONDARY')
    );

    await interaction.followUp({
        ephemeral: true,
        embeds: [embed],
        components: [linkRow]
    })
}


export const MonkeyReddit = async (embed: MessageEmbed, linkRow: MessageActionRow, interaction: BaseCommandInteraction) => {
    const settings = (await DataBase.randomDocument('settings'))[0] as MonkeySettings;
    const subreddits = settings.subreddits;
    const randomSubReddit = subreddits[Math.floor(Math.random() * subreddits.length)].replace(' ', '_');
    const queryMonkey = !randomSubReddit.includes('monkey') ? '&q=monkey' : '';
    const body = (await fetch(`https://www.reddit.com/r/${randomSubReddit}/random/.json?include_over_18=on&count=1&kind=t3&post_hint=image${queryMonkey}`).then(async(res) => res.json())) as RedditResults[];
    if(!body[0] || !body[0].data.dist) {
        await MonkeyReddit(embed, linkRow, interaction);
        return;
    }
    const {author, created_utc, is_video, post_hint, title, url} = body[0].data.children.map(({data}) => data)[0];
    if(post_hint !== 'image' || is_video) {
        await MonkeyReddit(embed, linkRow, interaction);
        return;
    }
    embed
        .setTitle(title)
        .setImage(url)
        .setColor('RANDOM')
        .setDescription(`Made by u/${author} on r/${randomSubReddit} ${timeAgo.format(new Date(created_utc * 1000))}`)
        .setFooter({ text: 'Powered by reddit' })

    linkRow.addComponents(
        new MessageButton()
            .setCustomId(ButtonTypes.report)
            .setLabel('Report image')
            .setStyle('SECONDARY')
    );

    await interaction.followUp({
        ephemeral: true,
        embeds: [embed],
        components: [linkRow]
    })
}

interface GoogleResults {
    error?: { code: number };
    items: GoogleResultsData[];
}

interface GoogleResultsData {
    link: string;
    title: string;
}

export const MonkeyGoogle = async (embed: MessageEmbed, linkRow: MessageActionRow, interaction: BaseCommandInteraction) => {
    const token = quote_reached === 0 ? SEARCH_KEY : SEARCH_KEY_SECOND;
    const settings = (await DataBase.randomDocument('settings'))[0] as MonkeySettings;
    const searchterms = settings.search_terms.map((search_term) => `monkey ${search_term}`);
    const randomSearchTerm = searchterms[Math.floor(Math.random() * searchterms.length)];
    if(!google_results || google_results.length === 0) {
        await fetch(`https://www.googleapis.com/customsearch/v1?key=${token}&cx=013031014986252904024:vnjtgx5lwxi&q=${randomSearchTerm}&searchType=image&start=${Math.floor(Math.random()*100)}`)
            .then((res) => {return res.json()})
            .then((res: GoogleResults) => {
                if(res.error) {
                    switch(res.error.code) {
                        case 429: {
                            quote_reached++;
                            return MonkeyReddit(embed, linkRow, interaction);
                        }
                    }
                }
                google_results = res.items;
            })
    };
    const google = google_results[0];
    google_results.shift();
    embed
        .setTitle(google.title)
        .setImage(google.link)
        .setColor('RANDOM')
        .setFooter({ text: 'Powered by google' })

    linkRow.addComponents(
        new MessageButton()
            .setCustomId(ButtonTypes.report)
            .setLabel('Report image')
            .setStyle('SECONDARY')
    );

    await interaction.followUp({
        ephemeral: true,
        embeds: [embed],
        components: [linkRow]
    })
}
