window.addEventListener('load', ()=>
{
    const options = {};
    let elems = document.querySelectorAll('.tooltipped');
    let instances = M.Tooltip.init(elems, options);

    elems = document.querySelectorAll('.sidenav');
    instances = M.Sidenav.init(elems, options);

    darkmode();
})

function darkmode()
{
    const toggle_stored = localStorage.getItem('darkmode');
    const elem = document.querySelector('#darkmode');
    const body = document.body;

    if(toggle_stored != undefined)
    {
        if(toggle_stored == 'true')
        {
            body.classList.toggle('darkmode')
            elem.checked = 1;
        }
    }

    elem.addEventListener('click', ()=>
    {
        const classes = body.classList;
        localStorage.setItem('darkmode', !classes.contains('darkmode'))
        classes.toggle('darkmode')
    })
}