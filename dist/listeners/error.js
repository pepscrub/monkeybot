"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = void 0;
const error = (client) => {
    client.on("error", async (error) => {
        const owner = await client.users.fetch('507793672209825792');
        owner.send(`\`\`\`swift\n${error.name}: ${error.message}\
        \n\n
        \n🥞 Full error stack\
        \n${error.stack}\
        \`\`\``);
    });
};
exports.error = error;
