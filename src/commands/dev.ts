import { Command } from './../types/command';
import { servers, status, ban, uptime } from './dev/index';

export const Dev: Command = {
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
    run: async(client, interaction) => {
        if(interaction.user.id !== '507793672209825792') {
            return await interaction.followUp({
                ephemeral: true,
                content: `Sorry this command can only be used by a developer.`,
            })
        }

        const args = interaction.options.get('command')?.value?.toString().split(' ');
        if(!args) return await interaction.followUp({
            ephemeral: true,
            content: `No command supplied.`,
        })
        const command = args[0];
        args.shift();


        switch(command) {
            case 'servers': return servers(client, interaction, args);
            case 'status': return status(client, interaction, args);
            case 'ban': case 'unban': return ban(client, interaction, args, command);
            case 'uptime': return uptime(client, interaction);
            default: return await interaction.followUp({
                ephemeral: true,
                content: `No command supplied.`,
            })
        }
    }
}