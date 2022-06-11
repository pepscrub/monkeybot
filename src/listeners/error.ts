import { Client, MessageEmbed } from "discord.js";
import { Commands } from "../commands";
import { createSpinner } from 'nanospinner'

export const error = (client: Client): void => {
    client.on("error", async (error) => {
        const owner = await client.users.fetch('507793672209825792'); // me pepsb
        owner.send(`\`\`\`swift\n${error.name}: ${error.message}\
        \n\n
        \n🥞 Full error stack\
        \n${error.stack}\
        \`\`\``);
    });
}