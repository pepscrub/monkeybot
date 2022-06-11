"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonkeyGoogle = exports.MonkeyReddit = exports.MonkeySaved = exports.CONFIG = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const database_1 = require("./database");
const types_1 = require("./types");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const javascript_time_ago_1 = tslib_1.__importDefault(require("javascript-time-ago"));
const en_1 = tslib_1.__importDefault(require("javascript-time-ago/locale/en"));
require("dotenv/config");
exports.CONFIG = process.env;
javascript_time_ago_1.default.addDefaultLocale(en_1.default);
let quote_reached = 0;
let google_results = [];
const timeAgo = new javascript_time_ago_1.default('en-US');
const SEARCH_KEY = exports.CONFIG.SEARCH_KEY;
const SEARCH_KEY_SECOND = exports.CONFIG.SEARCH_KEY_SECOND;
const MonkeySaved = async (embed, linkRow, interaction) => {
    const table = await database_1.DataBase.randomDocument('monkey_rankings');
    const settings = (await database_1.DataBase.randomDocument('settings'))[0];
    const { url, color, users, rank } = table[0];
    embed.setDescription(`Rank given: **${settings.colors[rank[0]][1]}**`)
        .setImage(url)
        .setColor(color[0])
        .setFooter({ text: Array.isArray(users) ? users.join(', ') : users, iconURL: interaction.user.avatarURL() ?? 'https://canary.contestimg.wish.com/api/webimage/5ec797cb29b38e548541da43-large.jpg?cache_buster=013886739c3b31130737c7ee955fa50d' })
        .setTimestamp();
    linkRow.addComponents(new discord_js_1.MessageButton()
        .setCustomId(types_1.ButtonTypes.report)
        .setLabel('Report image')
        .setStyle('SECONDARY'));
    await interaction.followUp({
        ephemeral: true,
        embeds: [embed],
        components: [linkRow]
    });
};
exports.MonkeySaved = MonkeySaved;
const MonkeyReddit = async (embed, linkRow, interaction) => {
    const settings = (await database_1.DataBase.randomDocument('settings'))[0];
    const subreddits = settings.subreddits;
    const randomSubReddit = subreddits[Math.floor(Math.random() * subreddits.length)].replace(' ', '_');
    const queryMonkey = !randomSubReddit.includes('monkey') ? '&q=monkey' : '';
    const body = (await (0, node_fetch_1.default)(`https://www.reddit.com/r/${randomSubReddit}/random/.json?include_over_18=on&count=1&kind=t3&post_hint=image${queryMonkey}`).then(async (res) => res.json()));
    if (!body[0] || !body[0].data.dist) {
        await (0, exports.MonkeyReddit)(embed, linkRow, interaction);
        return;
    }
    const { author, created_utc, is_video, post_hint, title, url } = body[0].data.children.map(({ data }) => data)[0];
    if (post_hint !== 'image' || is_video) {
        await (0, exports.MonkeyReddit)(embed, linkRow, interaction);
        return;
    }
    embed
        .setTitle(title)
        .setImage(url)
        .setColor('RANDOM')
        .setDescription(`Made by u/${author} on r/${randomSubReddit} ${timeAgo.format(new Date(created_utc * 1000))}`)
        .setFooter({ text: 'Powered by reddit' });
    linkRow.addComponents(new discord_js_1.MessageButton()
        .setCustomId(types_1.ButtonTypes.report)
        .setLabel('Report image')
        .setStyle('SECONDARY'));
    await interaction.followUp({
        ephemeral: true,
        embeds: [embed],
        components: [linkRow]
    });
};
exports.MonkeyReddit = MonkeyReddit;
const MonkeyGoogle = async (embed, linkRow, interaction) => {
    const token = quote_reached === 0 ? SEARCH_KEY : SEARCH_KEY_SECOND;
    const settings = (await database_1.DataBase.randomDocument('settings'))[0];
    const searchterms = settings.search_terms.map((search_term) => `monkey ${search_term}`);
    const randomSearchTerm = searchterms[Math.floor(Math.random() * searchterms.length)];
    if (!google_results || google_results.length === 0) {
        await (0, node_fetch_1.default)(`https://www.googleapis.com/customsearch/v1?key=${token}&cx=013031014986252904024:vnjtgx5lwxi&q=${randomSearchTerm}&searchType=image&start=${Math.floor(Math.random() * 100)}`)
            .then((res) => { return res.json(); })
            .then((res) => {
            if (res.error) {
                switch (res.error.code) {
                    case 429: {
                        quote_reached++;
                        return (0, exports.MonkeyReddit)(embed, linkRow, interaction);
                    }
                }
            }
            google_results = res.items;
        });
    }
    ;
    const google = google_results[0];
    google_results.shift();
    embed
        .setTitle(google.title)
        .setImage(google.link)
        .setColor('RANDOM')
        .setFooter({ text: 'Powered by google' });
    linkRow.addComponents(new discord_js_1.MessageButton()
        .setCustomId(types_1.ButtonTypes.report)
        .setLabel('Report image')
        .setStyle('SECONDARY'));
    await interaction.followUp({
        ephemeral: true,
        embeds: [embed],
        components: [linkRow]
    });
};
exports.MonkeyGoogle = MonkeyGoogle;
