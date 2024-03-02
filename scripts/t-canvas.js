customElements.define("t-canvas", class TCanvasElement extends HTMLElement {
    canvas = null;
    context = null;

    minScale = 0.5;
    maxScale = 5;
    scale = 0.5;

    isTranslating = false;
    didTranslating = false;

    oldX = 0;
    oldY = 0;

    deltaX = 100;
    deltaY = 100;

    selectedObject = null;

    winWidth = 0;
    winHeight = 0;


    MOUSE_LEFT = 0;
    MOUSE_RIGHT = 1;

    objects = [
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

    constructor() {
        super();
    }

    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <canvas id="t-canvas"></canvas>
        `;

        this.canvas = shadow.getElementById("t-canvas");
        this.context = this.canvas.getContext("2d");

        this.updateSize();

        this.addEventListener("wheel", this.onScroll);
        this.addEventListener("mousedown", this.onMouseDown);
        this.addEventListener("mousemove", this.onMouseMove);
        this.addEventListener("mouseup", this.onMouseUp);
        this.addEventListener("contextmenu", (event) => { event.preventDefault(); });

        window.addEventListener("resize", (event) => { this.updateSize(); });

        this.render();
    }

    updateSize() {
        this.canvas.height = this.parentElement.clientHeight;
        this.canvas.width = this.parentElement.clientWidth;

        this.winHeight = this.canvas.height;
        this.winWidth = this.canvas.width;

        this.render();
    }

    onScroll(event) {
        let diff = (event.deltaY > 0) ? -0.1 : 0.1;
        this.zoom(this.scale + diff);
    }

    onMouseDown(event) {
        switch(event.button)
        {
            case this.MOUSE_LEFT:
                this.startTranslate(event, true);
                break;

            case this.MOUSE_RIGHT:
                event.preventDefault();
                break;
        }
    }

    onMouseMove(event) {
        switch(event.button)
        {
            case this.MOUSE_LEFT:
                this.translate(event);
                break;
        }
    }

    onMouseUp(event) {
        switch(event.button)
        {
            case this.MOUSE_LEFT:
                // Prevents clicking objects at the end of translating the screen.
                if(!this.didTranslating)
                {
                    this.trySelectObject(event.clientX, event.clientY);
                }

                this.startTranslate(event, false);
                break;

            case this.MOUSE_RIGHT:
                event.preventDefault();
                break;
        }
    }

    translate(event)
    {
        if(this.isTranslating)
        {
            let curX = event.clientX;
            let curY = event.clientY;

            let diffX = -(this.oldX - curX);
            let diffY = -(this.oldY - curY);

            this.deltaX += diffX;
            this.deltaY += diffY;

            this.oldX = curX;
            this.oldY = curY;

            this.render();

            this.didTranslating = true;
        }
    }

    startTranslate(event, translating)
    {
        if(translating)
        {
            this.oldX = event.clientX;
            this.oldY = event.clientY;

            this.isTranslating = true;
        }
        else
        {
            this.isTranslating = false;
            this.didTranslating = false;
        }
    }

    zoom(value)
    {
        this.scale = Math.min(Math.max(this.minScale, value), this.maxScale);
        this.render();
    }

    render()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // A dot every 5 px;
        let dotSpacing = 15 * this.scale;
        let dotSize = 2 * this.scale;
        for(let x = 0; x < this.winWidth / dotSpacing; x++)
        {
            for(let y = 0; y < this.winHeight / dotSpacing; y++)
            {
                this.context.fillStyle = "#EEEEEE";
                this.context.fillRect(x * dotSpacing, y * dotSpacing, dotSize, dotSize);
            }
        }

        for(let i = 0; i < this.objects.length; i++)
        {
            let obj = this.objects[i];

            if(this.selectedObject != null && obj.id == this.selectedObject.id)
            {
                this.context.fillStyle = "#ff0000";
            }
            else
            {
                this.context.fillStyle = "#000000";
            }

            this.context.fillRect((obj.x * this.scale) + this.deltaX, (obj.y * this.scale) + this.deltaY, obj.width * this.scale, obj.height * this.scale);
        }

        this.context.fillStyle = "#000000";

        this.context.textBaseline = "top";
        this.context.font = "bold 16px Verdana";
        this.context.fillText("TestCanvas", 5, 5);
        this.context.font = "10px Verdana";
        this.context.fillText(`Zoom: ${Number(this.scale).toFixed(2)}`, 5, 25);
        this.context.fillText(`Selected: ${this.selectedObject == null ? "None" : this.selectedObject.id}`, 5, 40);
        this.context.fillText(`X: ${-this.deltaX}, Y: ${-this.deltaY}`, 5, 55);
    }

    trySelectObject(x, y)
    {
        for(let i = 0; i < this.objects.length; i++)
        {
            let obj = this.objects[i];

            let objX = (obj.x * this.scale) + this.deltaX;
            let objY = (obj.y * this.scale) + this.deltaY;

            let objWidth = obj.width * this.scale;
            let objHeight = obj.height * this.scale;

            if(x > objX && y > objY && x < (objX + objWidth) && y < (objY + objHeight))
            {
                let foundObj = this.objects[i];

                // Deselect the already selected object.
                if(this.selectedObject != null && 
                    this.selectedObject.id == foundObj.id)
                {
                    this.selectedObject = null;
                }
                else
                {
                    this.selectedObject = this.objects[i];
                }

                this.render();
                return;
            }
        }

        this.selectedObject = null;
        this.render();
    }
});