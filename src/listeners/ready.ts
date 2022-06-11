import 'dotenv/config';
import { Client } from "discord.js";
import { Commands } from "../commands";
import { createSpinner } from 'nanospinner'
import { ENVConfig } from "src/types/env";
import { intwithcommas } from '../utils/numbers';
export const CONFIG = process.env as unknown as ENVConfig;

export const ready = async (client: Client): Promise<void> => {
    const spinner = createSpinner('Logging into client').start();
    try {
        client.on("ready", async () => {
            if(!client.user || !client.application) {
                spinner.error({ text: 'Invalid user / application.' });
                return;
            };

            spinner.update({text: 'Registering commands...'});
            await client.application.commands.set(Commands);

            spinner.update({text: 'Setting discord status'})
            client.user.setPresence({
                activities: [{
                    name: `${intwithcommas(client.guilds.cache.size)} servers`,
                    type: 'WATCHING'
                }]
            })

            spinner.success({text: `Logged in as ${client.user?.username}! We're ready to go.`});
        });
    } catch( error ) {
        const e = error as Error;
        spinner.error({text: `Uh oh something happened ${e.message}`})
    }
}