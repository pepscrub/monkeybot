import { BaseCommandInteraction, Client } from 'discord.js';

enum AcitivityTypes {
    playing = 'PLAYING',
    streaming = 'STREAMING',
    listening = 'LISTENING',
    watching = 'WATCHING',
    competing = 'COMPETING'
}

enum Status {
    idle = 'idle',
    away = 'idle',
    dnd = 'dnd',
    offline = 'invisible',
    online = 'online',
}

const random = (keys: typeof AcitivityTypes): string => Object.keys(keys)[Math.floor(Math.random() * Object.keys(keys).length)];

export const status = (client: Client, interaction: BaseCommandInteraction, args: string[]) => {
    if(!args.length || args.length <= 0) return interaction.followUp(({ content: 'you stupid. `activity`, `type`, `name`', ephemeral: true }));
    
    const activityCheck = Object.keys(AcitivityTypes).find((type)=> args.find((arg) => arg === type));
    const statusCheck = Object.keys(Status).find((type)=> args.find((arg) => arg === type));

    if(!statusCheck && !activityCheck) args.unshift(Status.online, random(AcitivityTypes));
    if(!activityCheck && statusCheck) args.splice(1,0, activityCheck?.toUpperCase() || 'PLAYING');
    if(!statusCheck && activityCheck) {
        args.unshift(Status.online);
        // Validating and removing entry of activity (regex might work better?)
        const index = args.indexOf(activityCheck);
        args.splice(index,1);
        args.splice(1,0, activityCheck?.toUpperCase() || 'PLAYING');
    }

    const [active, invalidType, ...rest] = args;
    const type = invalidType?.toUpperCase() as AcitivityTypes | undefined;
    const name = rest.join(' ');

    client.user?.setStatus(active as Status)
    client.user?.setPresence({
        activities: [
            {
                name: name ?? '',
                type,
                url: type === AcitivityTypes.streaming ? 'https://www.twitch.tv/peps_b' : undefined,
            },
        ]
    })
    interaction.followUp({content: 'updated bot presence', ephemeral: false })
}