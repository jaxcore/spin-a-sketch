import React, { Component } from 'react';

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class SketchCanvas extends Component {
    constructor(props) {
        super();

        this.refCanvasBorder = React.createRef();
        this.refCanvas = React.createRef();

        this.speed = 2;

        //#a3a5b1
        //#7e828e
        //#858793

        this.lastV = 0;
        this.spinV = props.spinV;
        this.spinV.on('spin', (direction) => {
            this.moveVertical(direction)
        });
        this.lastH = 0;
        this.spinH = props.spinH;
        this.spinH.on('spin', (direction) => {
            this.moveHorizontal(direction)
        });

        this.points = [];
    }

    componentWillReceiveProps(props) {
        if (props.width != this.width || props.height != this.height) {
            this.setSize(props.edgeSize);
            this.lastEdgeSize = props.edgeSize;
            this.width = props.width;
            this.height = props.height;
            this.redraw();
        }

        if (props.leftPosition !== this.lastLeft) {
            let dirLeft = props.leftPosition - this.lastLeft;
            if (dirLeft < 0) this.moveHorizontal(-1);
            else this.moveHorizontal(1);
            this.lastLeft = props.leftPosition;
        }
        if (props.rightPosition !== this.rightLeft) {
            let dirRight = props.rightPosition - this.rightLeft;
            if (dirRight < 0) this.moveVertical(-1);
            else this.moveVertical(1);
            this.rightLeft = props.rightPosition;
        }
    }

    redraw() {
        this.clearRect();
        this.drawGradient();
        if (this.points.length) {
            this.lastPoint = this.points[0];
            this.points.forEach((point) => {
                this.addPoint(point, true);
            });
        }
    }

    drawGradient() {
        const { ctx } = this;
        var gradient = ctx.createLinearGradient(0, 0, this.canvasWidth, 0);
        // gradient.addColorStop(0, "#a8a9b9");
        gradient.addColorStop(0, "rgb(176,180,198)");
        gradient.addColorStop(0.5, "rgb(153,156,166)");
        gradient.addColorStop(0.8, "rgb(145,150,160)");
        gradient.addColorStop(1, "#898B93");
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);
    }

    setSize(edgeSize) {
        const canvas = this.refCanvas.current;
        const borderSize = Math.round(edgeSize/5);
        canvas.style.left = borderSize + 'px';
        canvas.style.top = borderSize + 'px';
        
        this.canvasWidth = window.innerWidth - edgeSize * 2;
        this.canvasHeight = window.innerHeight - edgeSize * 3.5;
        
        canvas.width = this.canvasWidth - borderSize*2;
        canvas.height = this.canvasHeight - borderSize*2;
        this.edgeSize = edgeSize;

        const canvasborder = this.refCanvasBorder.current;
        canvasborder.style.left = edgeSize + 'px';
        canvasborder.style.top = edgeSize + 'px';

        canvasborder.style.width = this.canvasWidth + 'px';
        canvasborder.style.height = this.canvasHeight + 'px';
    }

    moveVertical(direction) {
        const point = {
            x: this.lastPoint.x,
            y: this.lastPoint.y + direction * this.speed
        }
        this.addPoint(point);
    }

    moveHorizontal(direction) {
        const point = {
            x: this.lastPoint.x + direction * this.speed,
            y: this.lastPoint.y
        }
        this.addPoint(point);
    }

    clear() {
        this.points = [];
        this.clearRect();
        this.drawGradient();
    }

    clearRect() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    componentDidMount() {
        this.props.events.on('clear', () => {
            this.clear();
        });
        const canvas = this.refCanvas.current;
        canvas.fillStyle = 'rgb(100,110,100)';
        this.ctx = canvas.getContext('2d');
        this.setSize(this.props.edgeSize);
        this.lastPoint = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
        this.isDrawing = false;

        canvas.onmousedown = (e) => {
            this.isDrawing = true;
            if (this.firstPoint) {
                this.lastPoint = { x: e.layerX, y: e.layerY };
                this.ctx.moveTo(e.layerX, e.layerY);
            }
            else {
                this.addPoint({
                    x: e.layerX,
                    y: e.layerY
                });
            }
        };
        canvas.onmouseup = (e) => {
            this.isDrawing = false;
        };

        canvas.onmousemove = (e) => {
            if (!this.isDrawing) return;

            this.addPoint({
                x: e.layerX,
                y: e.layerY
            });

        };

        this.firstPoint = true;
        this.setSize(this.props.edgeSize);
    }

    addPoint(point, skip) {
        console.log('addPoint', point)
        this.stroke(point, 2, 3, 'rgba(0,0,0,0.04)');
        this.stroke(point, 1, 0.1, 'rgba(0,0,0,0.06)');
        this.lastPoint = point;
        
        if (this.lastPoint.x < this.props.edgeSize*0.05) this.lastPoint.x = this.edgeSize*0.05;
		if (this.lastPoint.x > this.canvasWidth-this.props.edgeSize*0.45) this.lastPoint.x = this.canvasWidth-this.props.edgeSize*0.45;
		if (this.lastPoint.y < this.props.edgeSize*0.05) this.lastPoint.y = this.edgeSize*0.05;
		if (this.lastPoint.y > this.canvasHeight-this.props.edgeSize*0.45) this.lastPoint.y = this.canvasHeight-this.props.edgeSize*0.45;
		console.log(this.edgeSize);
		
        this.firstPoint = false;
        
        if (!skip) this.points.push(point);
    }

    stroke(point, lineWidth, r, color) {
        let { lastPoint } = this;
        const { ctx } = this;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x - getRandom(0, r), lastPoint.y - getRandom(0, r));
        ctx.lineTo(point.x - getRandom(0, r), point.y - getRandom(0, r));
        ctx.stroke();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.moveTo(lastPoint.x + getRandom(0, r), lastPoint.y + getRandom(0, r));
        ctx.lineTo(point.x + getRandom(0, r), point.y + getRandom(0, r));
        ctx.stroke();
    }

    render() {
        return (<div id="sketchcanvasborder" ref={this.refCanvasBorder}>
            <canvas id="sketchcanvas" ref={this.refCanvas}></canvas>
        </div>);
    }
}

export default SketchCanvas;