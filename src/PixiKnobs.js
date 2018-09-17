import * as PIXI from 'pixi.js';
import React, { Component } from 'react';

class PixiKnob extends Component {
    constructor(props) {
        super();

        this.refCanvas = React.createRef();
        this.physicsV = props.spinV;
        this.physicsH = props.spinH;
    }

    componentWillReceiveProps(props) {
        this.setSize(props.edgeSize);

        if (props.leftPosition !== this.lastLeft) {
            this.lastLeft = props.leftPosition;
            if (this.spriteH) this.spriteH.rotation = props.leftPosition * Math.PI / 16;
        }
        if (props.rightPosition !== this.rightLeft) {
            this.rightLeft = props.rightPosition;
            if (this.spriteV) this.spriteV.rotation = props.rightPosition * Math.PI / 16;
        }
    }

    setSize(edgeSize) {
        this.worldWidth = window.innerWidth - 2;
        this.worldHeight = edgeSize * 2.5;
        this.refCanvas.current.style.width = this.worldWidth + 'px';
        this.refCanvas.current.style.height = this.worldHeight + 'px';
    }

    componentDidMount() {
        global.p = this;
        this.setSize(this.props.edgeSize);

        this.app = new PIXI.Application({
            width: this.worldWidth, 
            height: this.worldHeight, 
            antialias: true,
            transparent: true,
            resolution: 1,
            view: this.refCanvas.current,
        });

        var imageSrc = this.imageSrc = "image.png";

        PIXI.loader
            .add(imageSrc)
            .load(this.setup);

        this.dragging = false;
        this.dragPoint = {};

        this.midX = this.worldHeight / 2;
        this.midY = this.worldHeight / 2;

        this.addDocumentEvents();
    }

    setup = () => {
        const midY = this.worldHeight / 2;
        this.spriteH = this.createKnob(this.physicsH, midY * 2, midY);
        this.spriteV = this.createKnob(this.physicsV, this.worldWidth - midY * 2, midY);
    }

    createKnob(spin, x, y) {
        const sprite = new PIXI.Sprite(
            PIXI.loader.resources[this.imageSrc].texture
        );
        sprite.x = x;
        sprite.y = y;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scale.x = this.worldHeight / 300;
        sprite.scale.y = this.worldHeight / 300;
        sprite.interactive = true;
        this.app.stage.addChild(sprite);
        spin.on('rotate', (angle, spin) => {
            sprite.rotation = angle;
        });

        spin.startSimulation();
        return sprite;
    }

    addDocumentEvents() {
        document.body.addEventListener('keydown', (e) => {
            var code = e.keyCode;
            console.log(code);
            switch (code) {
                case 38:
                    // up
                    this.physicsV.startSpinLeft(); break;
                case 40:
                    // down
                    this.physicsV.startSpinRight(); break;

                case 37:
                    // left
                    this.physicsH.startSpinLeft(); break;
                case 39:
                    // right
                    this.physicsH.startSpinRight(); break;
                default:
                    break;
            }
        });
        document.body.addEventListener('keyup', (e) => {
            var code = e.keyCode;

            switch (code) {
                case 38:
                    // up
                    this.physicsV.stopSpinLeft(); break;
                case 40:
                    // down
                    this.physicsV.stopSpinRight(); break;
                case 37:
                    // left
                    this.physicsH.stopSpinLeft(); break;
                case 39:
                    // right
                    this.physicsH.stopSpinRight(); break;
                default:
                    break;
            }
        });
    }

    mouseDown = (e) => {
        var x = e.layerX;
        var y = e.layerY;
        const { knob } = this.physicsV;
        const { midX, midY } = this;

        var angle = Math.atan2(midY - y, midX - x);
        if (angle < 0) angle = Math.PI * 2 + angle;
        this.dragPoint = {
            last: knob.angle,
            angle: angle,
            times: [new Date().getTime()],
            angles: [knob.angle]
        };
        var deg = angle * 180 / Math.PI;
        console.log('down', deg);
        this.physicsV.stop();
        this.dragging = true;

        window.addEventListener('mousemove', this.mouseMove, false);
        window.addEventListener('mouseup', this.mouseUp, false);
    }

    mouseMove = (e) => {
        const { knob } = this.physicsV;
        const { midX, midY } = this;
        const { dragPoint } = this;
        if (!this.dragging) return;
        var x = e.layerX;
        var y = e.layerY;
        var angle = Math.atan2(midY - y, midX - x);
        var deltaAngle = (angle - dragPoint.angle);
        if (deltaAngle > Math.PI) {
            var ndeltaAngle = Math.PI * 2 - deltaAngle;
            deltaAngle = ndeltaAngle;
        }
        else if (deltaAngle < -Math.PI) {
            var ndeltaAngle = Math.PI * 2 + deltaAngle;
            deltaAngle = ndeltaAngle;
        }
        dragPoint.angle = angle;
        var newAngle = knob.angle + deltaAngle;
        console.log('deltaAngle', deltaAngle, newAngle);

        this.physicsV.rotate(deltaAngle);

        var limit = 7;
        dragPoint.angles.push(newAngle);
        if (dragPoint.angles.length > limit) dragPoint.angles.shift();
        dragPoint.times.push(new Date().getTime());
        if (dragPoint.times.length > limit) dragPoint.times.shift();
    }

    mouseUp = (e) => {
        const { dragPoint } = this;
        window.removeEventListener('mousemove', this.mouseMove, false);
        window.removeEventListener('mouseup', this.mouseUp, false);

        if (!this.dragging) return;
        this.dragging = false;
        if (dragPoint.times.length < 4) return;
        console.log('up', dragPoint.times, dragPoint.angles);

        var diffTime, diffAngle, av;
        var totalDiffTime = 0;
        var totalDiffAngle = 0;
        var overallDir = (dragPoint.angles[0] - dragPoint.angles[dragPoint.angles.length - 1]) < 0 ? 1 : -1;
        var now = new Date().getTime();
        for (var i = 1; i < dragPoint.times.length - 3; i++) {
            if (now - dragPoint.times[i] > 100) {
                return;
            }
            diffTime = dragPoint.times[i + 1] - dragPoint.times[i];
            diffAngle = dragPoint.angles[i + 1] - dragPoint.angles[i];
            totalDiffAngle += diffAngle;
            totalDiffTime += diffTime;
            av = (diffAngle / diffTime) * i + 1;
        }

        // linear average
        if (totalDiffTime === 0) return;
        var averageAngularVelocity = totalDiffAngle / totalDiffTime;
        if (averageAngularVelocity < 0 && overallDir === 1) {
            //alert('correct right');
            averageAngularVelocity = -averageAngularVelocity;
        }
        if (averageAngularVelocity > 0 && overallDir === -1) {
            //alert('correct left');
            averageAngularVelocity = -averageAngularVelocity;
        }
        if (isNaN(averageAngularVelocity)) {
            return;
        }
        if (isNaN(overallDir)) {
            return;
        }

        //console.log('aav', averageAngularVelocity, overallDir);

        this.physicsV.setAngularVelocity(averageAngularVelocity * 10);
    }

    render() {
        return (<div>
            {/* <div>{this.props.leftPosition}</div>
            <div>{this.props.rightPosition}</div> */}
            <canvas ref={this.refCanvas} id="knobscanvas"></canvas>
        </div>);
    }
}

export default PixiKnob;