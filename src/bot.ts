import 'dotenv/config';
import { Client, Intents } from "discord.js";
import { DataBase } from './database';
import { ENVConfig } from './types/env';
import { error } from './listeners/error';
import { interactionCreate } from './listeners/interaction';
import { ready } from "./listeners";
import discordModals from 'discord-modals';

const CONFIG = process.env as unknown as ENVConfig;
const token = CONFIG.TOKEN;

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES
    ]
});

ready(client);
error(client);
interactionCreate(client);
discordModals(client);

client.login(token);
