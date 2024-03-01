let scale = 1.0;

let isTranslating = false;
let didTranslating = false;

let oldX = 0;
let oldY = 0;

let deltaX = 0;
let deltaY = 0;

let selectedObject = null;

let winWidth = 0;
let winHeight = 0;


const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 1;

let objects = [
    { 
        id: 1,
        x: 100,
        y: 200,
        width: 100,
        height: 100
    },
    { 
        id: 2,
        x: 50,
        y: 100,
        width: 25,
        height: 25
    },
    { 
        id: 3,
        x: 500,
        y: 200,
        width: 300,
        height: 250
    },
];

function init()
{
    let canvas = document.getElementById('t-canvas');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    winWidth = canvas.width;
    winHeight = canvas.height;

    render();

    addEventListener("resize", (event) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        winWidth = canvas.width;
        winHeight = canvas.height;

        render();
    });

    // Zoom
    addEventListener("wheel", (event) => {
        let diff = (event.deltaY > 0) ? -0.1 : 0.1;
        scale = scale + diff;

        scale = Math.min(Math.max(0.5, scale), 5);

        render();

        console.log("Scrolling");
    });

    // Translate
    addEventListener("mousedown", (event) => {
        switch(event.button)
        {
            case MOUSE_LEFT:
                startTranslate(event, true);
                break;

            case MOUSE_RIGHT:
                event.preventDefault();
                break;
        }
    });

    addEventListener("mousemove", (event) => {
        switch(event.button)
        {
            case MOUSE_LEFT:
                translate(event);
                break;
        }
    });

    addEventListener("mouseup", (event) => {
        switch(event.button)
        {
            case MOUSE_LEFT:
                startTranslate(event, false);
                break;

            case MOUSE_RIGHT:
                event.preventDefault();
                break;
        }
    });   

    addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
}

function translate(event)
{
    if(isTranslating)
    {
        let curX = event.clientX;
        let curY = event.clientY;

        let diffX = -(oldX - curX);
        let diffY = -(oldY - curY);

        deltaX += diffX;
        deltaY += diffY;

        oldX = curX;
        oldY = curY;

        console.log(`Diff: ${diffX}:${diffY}`)

        render();

        didTranslating = true;
    }
}

function startTranslate(event, translating)
{
    if(translating)
    {
        oldX = event.clientX;
        oldY = event.clientY;

        isTranslating = true;
    }
    else
    {
        isTranslating = false;

        // Prevents clicking objects at the end of translating the screen.
        if(!didTranslating)
        {
            trySelectObject(event.clientX, event.clientY);
        }

        didTranslating = false;
    }
}

function render()
{
    let canvas = document.getElementById('t-canvas');
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // A dot every 5 px;
    let dotSpacing = 15 * scale;
    let dotSize = 2 * scale;
    for(let x = 0; x < winWidth / dotSpacing; x++)
    {
        for(let y = 0; y < winHeight / dotSpacing; y++)
        {
            ctx.fillStyle = "#DDDDDD";
            ctx.fillRect(x * dotSpacing, y * dotSpacing, dotSize, dotSize);
        }
    }

    for(let i = 0; i < objects.length; i++)
    {
        let obj = objects[i];

        if(selectedObject != null && obj.id == selectedObject.id)
        {
            ctx.fillStyle = "#ff0000";
        }
        else
        {
            ctx.fillStyle = "#000000";
        }

        ctx.fillRect((obj.x * scale) + deltaX, (obj.y * scale) + deltaY, obj.width * scale, obj.height * scale);
    }

    ctx.fillStyle = "#000000";

    ctx.textBaseline = "top";
    ctx.font = "bold 16px Verdana";
    ctx.fillText("TestCanvas", 5, 5);
    ctx.font = "10px Verdana";
    ctx.fillText(`Zoom: ${Number(scale).toFixed(2)}`, 5, 25);
    ctx.fillText(`Selected: ${selectedObject == null ? "None" : selectedObject.id}`, 5, 40);
}

function trySelectObject(x, y)
{
    for(let i = 0; i < objects.length; i++)
    {
        let obj = objects[i];

        let objX = (obj.x * scale) + deltaX;
        let objY = (obj.y * scale) + deltaY;

        let objWidth = obj.width * scale;
        let objHeight = obj.height * scale;

        if(x > objX && y > objY && x < (objX + objWidth) && y < (objY + objHeight))
        {
            let foundObj = objects[i];

            // Deselect the already selected object.
            if(selectedObject != null && 
                selectedObject.id == foundObj.id)
            {
                selectedObject = null;
            }
            else
            {
                selectedObject = objects[i];
            }

            render();
            return;
        }
    }

    selectedObject = null;
    render();
}

init();