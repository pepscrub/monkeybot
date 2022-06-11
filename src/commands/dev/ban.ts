import { BaseCommandInteraction, Client } from "discord.js";
import { DataBase } from "../../database";

export const ban = async (client: Client, interaction: BaseCommandInteraction, args: string[], command: string) => {
    const table = await DataBase.table('ratelimit');
    const user = await client.users.fetch(args[0]);

    if(command === 'ban') {
        table.updateOne({'user_id': user.id }, {$set: {'msg_disabled': true}})
        return interaction.followUp({ content: `I'm now ignoring ${user.username}'s commands`});
    }
    if(command === 'unban') {
        table.updateOne({'user_id': user.id }, {$set: {'msg_disabled': false}})
        return interaction.followUp({ content: `I'm now listening to ${user.username}'s commands`});
    }
}