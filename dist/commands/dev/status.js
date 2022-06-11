"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
var AcitivityTypes;
(function (AcitivityTypes) {
    AcitivityTypes["playing"] = "PLAYING";
    AcitivityTypes["streaming"] = "STREAMING";
    AcitivityTypes["listening"] = "LISTENING";
    AcitivityTypes["watching"] = "WATCHING";
    AcitivityTypes["competing"] = "COMPETING";
})(AcitivityTypes || (AcitivityTypes = {}));
var Status;
(function (Status) {
    Status["idle"] = "idle";
    Status["away"] = "idle";
    Status["dnd"] = "dnd";
    Status["offline"] = "invisible";
    Status["online"] = "online";
})(Status || (Status = {}));
const random = (keys) => Object.keys(keys)[Math.floor(Math.random() * Object.keys(keys).length)];
const status = (client, interaction, args) => {
    if (!args.length || args.length <= 0)
        return interaction.followUp(({ content: 'you stupid. `activity`, `type`, `name`', ephemeral: true }));
    const activityCheck = Object.keys(AcitivityTypes).find((type) => args.find((arg) => arg === type));
    const statusCheck = Object.keys(Status).find((type) => args.find((arg) => arg === type));
    if (!statusCheck && !activityCheck)
        args.unshift(Status.online, random(AcitivityTypes));
    if (!activityCheck && statusCheck)
        args.splice(1, 0, activityCheck?.toUpperCase() || 'PLAYING');
    if (!statusCheck && activityCheck) {
        args.unshift(Status.online);
        const index = args.indexOf(activityCheck);
        args.splice(index, 1);
        args.splice(1, 0, activityCheck?.toUpperCase() || 'PLAYING');
    }
    const [active, invalidType, ...rest] = args;
    const type = invalidType?.toUpperCase();
    const name = rest.join(' ');
    client.user?.setStatus(active);
    client.user?.setPresence({
        activities: [
            {
                name: name ?? '',
                type,
                url: type === AcitivityTypes.streaming ? 'https://www.twitch.tv/peps_b' : undefined,
            },
        ]
    });
    interaction.followUp({ content: 'updated bot presence', ephemeral: false });
};
exports.status = status;
