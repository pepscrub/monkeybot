const args = process.argv.slice(2);
let dev = false;
let debug = false;

args.forEach(arg=>
{
    if(/dev/gi.test(arg)) dev = true;
    if(/debug/gi.test(arg)) debug = true;
})

/**
 * @description gets the current date in a 12 hour format
 */
module.exports.timestamp = () =>new Date().toLocaleString()

module.exports.log = (text, msg = null, origin = '[Monkey Bot]'.bold.green) =>
{
    try
    {
        if(dev)
        {
            if(typeof(text) == 'object') text = JSON.stringify(text);
            if(!msg) console.log(`${origin} ${this.timestamp()} ${text}`)
            else console.log(`${origin} ${this.timestamp()} ${`${msg.guild.name}`.italic.cyan} ${text}`)
        }
    }catch(e)
    {
        console.log(e)
    }
}