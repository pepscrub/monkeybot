"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logging = void 0;
const _1 = require(".");
const Logging = async (client, interaction) => {
    const { id } = interaction.user;
    const { guildId } = interaction;
    const serverExistsAndUser = await _1.DataBase.tableQuery('commands', { 'server.id': guildId, 'users': { $elemMatch: { '0.id': id } } });
    const serverExists = await _1.DataBase.tableQuery('commands', { 'server.id': guildId });
    const table = await _1.DataBase.table('commands');
    if (!interaction.guild || interaction.guild.memberCount < 5)
        return;
    const { guild, user } = interaction;
    if (!serverExistsAndUser.length && !serverExists.length) {
        await _1.DataBase.insertinto('commands', {
            'server': {
                id: guildId,
                name: guild.name,
                icon: guild.iconURL(),
                banner: guild.bannerURL(),
                dbanner: guild.discoverySplashURL()
            },
            'users': [
                [{
                        id: user.id,
                        name: `${user.username}#${user.discriminator}`,
                        pfp: user.avatarURL(),
                        commandUsage: [[`/${interaction.commandName}`, Date.now()]]
                    }]
            ]
        });
        return;
    }
    await table.updateMany({ 'users': { $elemMatch: { '0.id': id } } }, { $set: {
            'users.$.0.name': `${user.username}#${user.discriminator}`,
            'users.$.0.pfp': user.avatarURL()
        } });
    await table.updateOne({ 'server.id': guildId, 'users': { $elemMatch: { '0.id': id } } }, { $push: { 'users.$.0.commandusage': [`/${interaction.commandName}`, Date.now()] } });
    return;
};
exports.Logging = Logging;
