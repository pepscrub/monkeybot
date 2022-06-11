"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dev = void 0;
const index_1 = require("./dev/index");
exports.Dev = {
    name: 'dev',
    description: 'Developer commands',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'command',
            description: 'Command',
            type: 'STRING',
            required: true,
        }
    ],
    run: async (client, interaction) => {
        if (interaction.user.id !== '507793672209825792') {
            return await interaction.followUp({
                ephemeral: true,
                content: `Sorry this command can only be used by a developer.`,
            });
        }
        const args = interaction.options.get('command')?.value?.toString().split(' ');
        if (!args)
            return await interaction.followUp({
                ephemeral: true,
                content: `No command supplied.`,
            });
        const command = args[0];
        args.shift();
        switch (command) {
            case 'servers': return (0, index_1.servers)(client, interaction, args);
            case 'status': return (0, index_1.status)(client, interaction, args);
            case 'ban':
            case 'unban': return (0, index_1.ban)(client, interaction, args, command);
            default: return await interaction.followUp({
                ephemeral: true,
                content: `No command supplied.`,
            });
        }
    }
};
