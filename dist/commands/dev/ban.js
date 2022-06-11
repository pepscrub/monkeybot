"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ban = void 0;
const database_1 = require("../../database");
const ban = async (client, interaction, args, command) => {
    const table = await database_1.DataBase.table('ratelimit');
    const user = await client.users.fetch(args[0]);
    if (command === 'ban') {
        table.updateOne({ 'user_id': user.id }, { $set: { 'msg_disabled': true } });
        return interaction.followUp({ content: `I'm now ignoring ${user.username}'s commands` });
    }
    if (command === 'unban') {
        table.updateOne({ 'user_id': user.id }, { $set: { 'msg_disabled': false } });
        return interaction.followUp({ content: `I'm now listening to ${user.username}'s commands` });
    }
};
exports.ban = ban;
