const { log } = require('./helpers')
const { client, DB, sendmessage } = require('../bot')
const { server } = require('../web_backend');

process.stdin.resume();
process.setMaxListeners(0);

function exit_gracefully(SIG)
{
    log(`${SIG} recieved attempting to close.`)

    try
    {
        if(DB !== undefined ||!DB)
        {
            if(DB.connected())
            {
                DB.close();
            }
        }else{
            log(`Can't read DB.`, null, `[ERROR]`.bold.red);
        }
    }catch(e){
        log(`Failed to disconnect from DB!`, null, `[ERROR]`.bold.red)
    }

    try
    {
        client.destroy();
        log(`Sucessfully logged out of discord!`, null, `[DISCORD]`.bold.gray);
    }catch(e){
        log(`Failed to log out of discord!`,null, `[ERROR]`.bold.red)
    }

    try
    {
        server.close();
        log('Sucessfully terminated Web Server', null, '[WEB]'.bold.magenta);
    }catch(e)
    {
        log('Failed to terminate Web Server', null, '[WEB]'.bold.magenta)
    }
    log(`Terminating parent process with ${SIG}`);
    process.kill(process.pid, SIG);
    process.exit();
}


process.on('warning', (warn) => {sendmessage(`Warning: ${warn}`)});
process.on('uncaughtException', (err, origin) => {
    try
    {
        console.log(`${'[ERROR]'.bold.red} uncaughtException: ${err.stack || err}\nOrigin${origin}`)
        sendmessage(`Execption: ${err}\nOrigin${origin}`);
        
    }catch(e)
    {
        console.log('[ERROR]'.bold.red, e.stack || e)
    }
    process.kill(process.pid, "SIGINT")
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    try
    {
        console.log(`${'[ERROR]'.bold.red} uncaughtExceptionMonitor: ${err.stack || err}\nOrigin${origin}`)
        sendmessage(`Execption: ${err}\nOrigin${origin}`)
    }catch(e)
    {
        console.log('[ERROR]'.bold.red, e.stack || e)
    }
    process.kill(process.pid, "SIGINT");
});

process.on('unhandledRejection', (reason, promise) => {
    try
    {
        if(typeof promise === 'object') sendmessage(`Unhandled rejection at: ${JSON.stringify(promise)}\nReason: ${reason.stack || reason}`)
        else sendmessage(`Unhandled rejection at: ${promise}\nReason: ${reason.stack || reason}`)
    }catch(e)
    {
        console.log('[ERROR]'.bold.red, e.stack || e)
    }
    console.log(promise);
    console.log(reason.stack || reason);
    process.kill(process.pid, "SIGINT");
});
process.on('exit', (exitcode) => {
    log(`Bot is exiting with exit code of ${exitcode}`);
    exit_gracefully(exitcode);
})
process.on('SIGINT', (code)=>exit_gracefully(code));
process.on('SIGTERM', (code)=> exit_gracefully(code));
process.on('SIGUSR1', (code)=> exit_gracefully(code));
process.on('SIGUSR2', (code)=> exit_gracefully(code));
process.on('SIGHUP', (code)=> exit_gracefully(code));