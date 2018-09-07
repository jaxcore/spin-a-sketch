import React, { Component } from 'react';

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class SketchCanvas extends Component {
    constructor(props) {
        super();

        this.refCanvas = React.createRef();

        this.speed = 2;

        this.lastV = 0;
        this.spinV = props.spinV;
        this.spinV.on('spin', (direction) => {
            console.log('v', direction);
            this.moveVertical(direction)
        });
        this.lastH = 0;
        this.spinH = props.spinH;
        this.spinH.on('spin', (direction) => {
            console.log('v', direction);
            this.moveHorizontal(direction)
        });

        this.points = [];
    }

    componentWillReceiveProps(props) {
        //if (props.width != this.width || props.height != height) {
        //console.log('componentWillReceiveProps', props);
        //alert(this.points.length);

        if (props.edgeSize != this.lastEdgeSize) {
            this.setSize(props.edgeSize);
            this.lastEdgeSize = props.edgeSize;
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

        //
        //}
    }

    redraw() {
        console.log('redraw');
        this.clearRect();
        if (this.points.length) {
            this.lastPoint = this.points[0];
            this.points.forEach((point) => {
                this.addPoint(point, true);
            });
        }
    }

    setSize(edgeSize) {
        console.log('setSize', edgeSize);
        const canvas = this.refCanvas.current;
        canvas.style.left = edgeSize + 'px';
        canvas.style.top = edgeSize + 'px';
        this.canvasWidth = window.innerWidth - edgeSize * 2;
        this.canvasHeight = window.innerHeight - edgeSize * 3.5;
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        this.edgeSize = edgeSize;
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
        //canvas.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx = canvas.getContext('2d');


        this.setSize(this.props.edgeSize);
        this.lastPoint = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
        console.log('first lastPoint', this.lastPoint);

        // this.addPoint({
        //     x:this.lastPoint.x,
        //     y:this.lastPoint.y,
        // });

        // this.addPoint({
        //     x:this.lastPoint.x+1,
        //     y:this.lastPoint.y,
        // });
        // this.addPoint({
        //     x:this.lastPoint.x,
        //     y:this.lastPoint.y+1,
        // });
        // this.addPoint({
        //     x:this.lastPoint.x-1,
        //     y:this.lastPoint.y,
        // });
        // this.addPoint({
        //     x:this.lastPoint.x,
        //     y:this.lastPoint.y-1,
        // });

        this.isDrawing = false;
        //this.lastPoint = null;

        canvas.onmousedown = (e) => {
            this.isDrawing = true;
            if (this.firstPoint) {
                this.lastPoint = { x: e.layerX, y: e.layerY };
                this.ctx.moveTo(e.layerX, e.layerY);
            }
            //this.lastPoint = { x: e.layerX, y: e.layerY };
            else {
                this.addPoint({
                    x: e.layerX,// - edgeSize,
                    y: e.layerY// - edgeSize
                });
            }
        };
        canvas.onmouseup = (e) => {
            this.isDrawing = false;
        };

        canvas.onmousemove = (e) => {
            if (!this.isDrawing) return;

            this.addPoint({
                x: e.layerX,// - edgeSize,
                y: e.layerY// - edgeSize
            });

        };

        this.firstPoint = true;

        this.setSize(this.props.edgeSize);
    }

    addPoint(point, skip) {
        console.log('addPoint', point)
        this.stroke(point, 2, 3, 'rgba(0,0,0,0.02)');
        this.stroke(point, 1, 0.1, 'rgba(0,0,0,0.04)');
        this.lastPoint = point;
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
        return (<canvas id="sketchcanvas" ref={this.refCanvas}></canvas>);
    }
}

export default SketchCanvas;