let scale = 1.0;

let translating = false;
let didTranslating = false;

let oldX = 0;
let oldY = 0;

let deltaX = 0;
let deltaY = 0;

let selectedObject = null;

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

    clear();
    drawObjects();

    addEventListener("resize", (event) => {
        init();
        return;
    });

    // Zoom
    addEventListener("wheel", (event) => {
        let diff = (event.deltaY > 0) ? -0.1 : 0.1;
        scale = scale + diff;

        scale = Math.min(Math.max(0.5, scale), 5);

        clear();
        drawObjects();

        console.log("Scrolling");
    });

    // Translate
    addEventListener("mousedown", (event) => {
        oldX = event.clientX;
        oldY = event.clientY;
        console.log("Translating");
        translating = true;
    });

    addEventListener("mousemove", (event) => {
        if(translating)
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

            clear();
            drawObjects();

            didTranslating = true;
        }
    });

    addEventListener("mouseup", (event) => {
        translating = false;
        console.log("Done translating");

        // Prevents clicking objects at the end of translating the screen.
        if(!didTranslating)
        {
            testForObject(event.clientX, event.clientY);
        }

        didTranslating = false;
    });   
}

function drawObjects()
{
    let canvas = document.getElementById('t-canvas');
    let ctx = canvas.getContext('2d');

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
}

function testForObject(x, y)
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
            selectedObject = objects[i];

            clear();
            drawObjects();
            return;
        }
    }
}

function clear()
{
    let canvas = document.getElementById('t-canvas');
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

init();