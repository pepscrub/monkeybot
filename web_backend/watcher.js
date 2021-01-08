const { app } = require('./index');
const { log } = require('../global/helpers');

app.use((req, res, next)=>
{
    log(`METHOD: ${req.method} | ${req.originalUrl}`, null, '[WEB]'.bold.magenta);
    next();
})