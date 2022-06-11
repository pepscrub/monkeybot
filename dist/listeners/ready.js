"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ready = exports.CONFIG = void 0;
require("dotenv/config");
const commands_1 = require("../commands");
const nanospinner_1 = require("nanospinner");
const numbers_1 = require("../utils/numbers");
exports.CONFIG = process.env;
const ready = async (client) => {
    const spinner = (0, nanospinner_1.createSpinner)('Logging into client').start();
    try {
        client.on("ready", async () => {
            if (!client.user || !client.application) {
                spinner.error({ text: 'Invalid user / application.' });
                return;
            }
            ;
            spinner.update({ text: 'Registering commands...' });
            await client.application.commands.set(commands_1.Commands);
            spinner.update({ text: 'Setting discord status' });
            client.user.setPresence({
                activities: [{
                        name: `${(0, numbers_1.intwithcommas)(client.guilds.cache.size)} servers`,
                        type: 'WATCHING'
                    }]
            });
            spinner.success({ text: `Logged in as ${client.user?.username}! We're ready to go.` });
        });
    }
    catch (error) {
        const e = error;
        spinner.error({ text: `Uh oh something happened ${e.message}` });
    }
};
exports.ready = ready;
