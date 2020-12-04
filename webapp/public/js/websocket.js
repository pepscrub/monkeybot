const ws = new WebSocket(`ws://localhost:8888/logs`);

ws.onopen = () =>
{
    // console.log('Connected log to websocket');
    ws.send('Web client connected');
};

ws.addEventListener('message', e =>
{
    const elem = document.querySelector('#log_input');
    const node = document.createElement('li');
    node.innerHTML = e.data;
    elem.appendChild(node);
    // console.log(`Receieved: '${e.data}'`);
})


const ws2 = new WebSocket(`ws://localhost:8888/mem`);

ws2.onopen = () =>
{
    // console.log("Connected memory to websocket");
    ws.send('Web client connected');
}

function byte_to_MB(val)
{
    return Math.round(val / 1024 / 1024 * 100) / 100;
}

ws2.addEventListener('message', e =>
{
    const ctx = document.getElementById("memory_chart").getContext('2d')
    const mem = JSON.parse(e.data);

    const h_used = byte_to_MB(mem['heapUsed']);
    const h_total = byte_to_MB(mem['heapTotal']);

    const h_percent = Math.round(h_used / h_total * 100);
    const RSS = mem['rss'];

    console.log(`${h_percent}% of ${h_total}MB`);

    // console.log(mem);
    // console.log(mem['heapUsed'] / mem['heapTotal'] * 100)

    // const linechart = new Chart(ctx, {
    //     type: 'line',
    //     data: e.data,
    //     options: {
    //         color: [
    //             'red'
    //         ]
    //     }
    // })
})
