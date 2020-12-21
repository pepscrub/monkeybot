const ws = new WebSocket(`ws://localhost:8888/logs`);

ws.onopen = () =>
{
    ws.send('Web client connected');
};

ws.addEventListener('message', e =>
{
    const elem = document.querySelector('#log_input');
    const node = document.createElement('li');
    node.innerHTML = e.data;
    elem.appendChild(node);
    elem.scrollTo(0, elem.scrollHeight)
})


const ws2 = new WebSocket(`ws://localhost:8888/mem`);
let memory_chart = null;
let cpu_chart = null;
ws2.onopen = () =>
{
    ws.send('Web client connected');
}

window.addEventListener('load', ()=>
{
    const ctx = document.getElementById("memory_chart").getContext('2d');
    const ctx2 = document.getElementById("cpu_chart").getContext('2d');
    
    memory_chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Heap Usage of NodeJS',
                    fill: false,
                    fill: 'origin',
                    lineTension: 0.1,
                    backgroundColor: "#c722ae59",
                    borderColor: "#c722ae",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(0,0,0, 0)",
                    pointBackgroundColor: "rgba(0, 0, 0, 0)",
                    pointBorderWidth: 0,
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                    cubicInterpolationMode: 'monotone',
                    data: []
                }
            ]
        },
        options:
        {
            legend:
            {
                labels:
                {
                    fontColor: '#fff',
                }
            },
            scales:
            {
                yAxes:
                [{
                    ticks:
                    {
                        fontColor: '#fff',
                        callback: (val, index, values) =>
                        {
                            return `${val}MB`
                        }
                    }
                }],
                xAxes:
                [{
                    ticks:
                    {
                        fontColor: '#fff'
                    }
                }]
            }
        }
    })


    cpu_chart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Cpu Usage %',
                    fill: 'origin',
                    lineTension: 0.1,
                    backgroundColor: "#2483c759",
                    borderColor: "#2483c7",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(0,0,0, 0)",
                    pointBackgroundColor: "rgba(0, 0, 0, 0)",
                    pointBorderWidth: 0,
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                    cubicInterpolationMode: 'monotone',
                    data: []
                }
            ]
        },
        options:
        {
            legend:
            {
                labels:
                {
                    fontColor: '#fff',
                }
            },
            scales:
            {
                yAxes:
                [{
                    ticks:
                    {
                        min: 0,
                        max: 1,
                        fontColor: '#fff',
                        callback: (val, index, values) =>
                        {
                            return `${val*100}%`
                        }
                    }
                }],
                xAxes:
                [{
                    ticks:
                    {
                        fontColor: '#fff'
                    }
                }]
            }
        }
    })
})

function byte_to_MB(val)
{
    return Math.round(val / 1024 / 1024 * 100) / 100;
}

const data_chart = [];
const cpu_usage = [];
const labels = [];


ws2.addEventListener('message', e =>
{
    if(memory_chart == null) return;
    const max = 25
    const cpu = JSON.parse(e.data)[0]
    const mem = JSON.parse(e.data)[1];

    const h_used = byte_to_MB(mem['heapUsed']);

    if(data_chart.length >= max)
    {
        memory_chart.data.labels.shift();
        memory_chart.data.datasets[0].data.shift();
    }
    if(cpu_usage.length >= max)
    {
        cpu_chart.data.labels.shift();
        cpu_chart.data.datasets[0].data.shift();
    }

    data_chart.push(h_used)
    cpu_usage.push(Math.round(cpu * 100) / 100);

    memory_chart.data.labels.push(new Date().toLocaleString());
    memory_chart.data.datasets[0].data = data_chart;
    memory_chart.update();

    cpu_chart.data.labels.push(new Date().toLocaleString());
    cpu_chart.data.datasets[0].data = cpu_usage;
    cpu_chart.update();


})
