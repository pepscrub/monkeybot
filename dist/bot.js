"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const tslib_1 = require("tslib");
require("dotenv/config");
const discord_js_1 = require("discord.js");
const error_1 = require("./listeners/error");
const interaction_1 = require("./listeners/interaction");
const listeners_1 = require("./listeners");
const discord_modals_1 = tslib_1.__importDefault(require("discord-modals"));
exports.CONFIG = process.env;
const token = exports.CONFIG.TOKEN;
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord_js_1.Intents.FLAGS.DIRECT_MESSAGES
    ]
});
(0, listeners_1.ready)(client);
(0, error_1.error)(client);
(0, interaction_1.interactionCreate)(client);
(0, discord_modals_1.default)(client);
client.login(token);
