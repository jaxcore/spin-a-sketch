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
        //if (props.width != this.width || props.height != height) {
        console.log('componentWillReceiveProps', props);
        //alert(this.points.length);
        this.setSize(props.edgeSize);
        //this.redraw();
        //}
    }

    setSize(edgeSize) {
        this.worldWidth = window.innerWidth - 2;
        this.worldHeight = edgeSize * 2.5; //window.innerHeight / 10;
        // renderer.view.style.width = w + 'px';
        // renderer.view.style.height = h + 'px';
        this.refCanvas.current.style.width = this.worldWidth + 'px';
        this.refCanvas.current.style.height = this.worldHeight + 'px';
    }

    componentDidMount() {
        global.p = this;
        this.setSize(this.props.edgeSize);

        this.app = new PIXI.Application({
            width: this.worldWidth,         // default: 800
            height: this.worldHeight,        // default: 600
            antialias: true,    // default: false
            transparent: true, // default: false
            resolution: 1,       // default: 1
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

        //this.refCanvas.current.addEventListener('mousedown', this.mouseDown, false);

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
        //this.worldHeight
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

        /*
var x = e.layerX;
        var y = e.layerY;
        
        const i = Math.floor( y / 300);
        
        const spin = this.spins[i];
        if (!spin) {
            let me = this;
            debugger;
            return;
        }
        const sprite = spin.sprite; //this.sprites[i];
        let { midX, midY } = this;
        midY += (sprite.y - this.midY);
        */


        var x = e.layerX;
        var y = e.layerY;
        const { knob } = this.physicsV;
        const { midX, midY } = this;
        // if (x < 300) {
        //     console.log('left');
        // }
        // if (x > window.innerWidth300) {
        //     console.log('left');
        // }

        var angle = Math.atan2(midY - y, midX - x);
        if (angle < 0) angle = Math.PI * 2 + angle;
        this.dragPoint = {
            last: knob.angle,
            angle: angle,
            //knobAngle: knob.angle,
            times: [new Date().getTime()],
            angles: [knob.angle]
            //dragPoint.previous = diffAngle;
        };
        // var knobDeg = knob.angle * 180 / Math.PI;

        var deg = angle * 180 / Math.PI;
        console.log('down', deg);

        // knob.torque = 0;
        // Body.setAngularVelocity(knob, 0);

        this.physicsV.stop();

        this.dragging = true;
        //lastAngle = angle;

        window.addEventListener('mousemove', this.mouseMove, false);
        window.addEventListener('mouseup', this.mouseUp, false);

    }

    mouseMove = (e) => {
        const { knob } = this.physicsV;
        const { midX, midY } = this;
        const { dragPoint } = this;
        if (!this.dragging) return;

        // var xs = dragPoint.x;
        // var ys = dragPoint.y;
        // var x = e.layerX;
        // var y = e.layerY;
        // var angle = dragPoint.a + Math.atan2(ys - y, xs - x);
        // console.log('move', dragPoint.a, Math.atan2(y - dragPoint.y, x - dragPoint.x));
        // rotateKnob(angle); //knob.angle = angle;
        var x = e.layerX;
        var y = e.layerY;
        var angle = Math.atan2(midY - y, midX - x);
        var deltaAngle = (angle - dragPoint.angle);
        if (deltaAngle > Math.PI) {
            var ndeltaAngle = Math.PI * 2 - deltaAngle;
            //console.log('fix deltaAngle >', deltaAngle, ndeltaAngle);
            deltaAngle = ndeltaAngle;
        }
        else if (deltaAngle < -Math.PI) {
            var ndeltaAngle = Math.PI * 2 + deltaAngle;
            //console.log('fix deltaAngle <', deltaAngle, ndeltaAngle);
            deltaAngle = ndeltaAngle;
        }
        dragPoint.angle = angle;
        //var deltaAngle = changeAngle - dragPoint.last;


        //if (angle < 0) angle = Math.PI*2 + angle;
        //var diffAngle = (angle - dragPoint.angle) - dragPoint.knobAngle;
        //console.log(diffAngle);
        //console.log('move kA=', dragPoint.knobAngle, 'diffA = '+diffAngle, 'new=');
        //diffAngle - knob.angle;

        var newAngle = knob.angle + deltaAngle;
        console.log('deltaAngle', deltaAngle, newAngle);

        this.physicsV.rotate(deltaAngle);

        //dragPoint.angle
        var limit = 7;
        dragPoint.angles.push(newAngle);
        if (dragPoint.angles.length > limit) dragPoint.angles.shift();
        //dragPoint.timeDiff = new Date().getTime() - dragPoint.timeDiff;
        dragPoint.times.push(new Date().getTime());
        if (dragPoint.times.length > limit) dragPoint.times.shift();

        //lastAngle = angle;
    }

    mouseUp = (e) => {
        // const {knob} = this.simulator;
        const { dragPoint } = this;
        window.removeEventListener('mousemove', this.mouseMove, false);
        window.removeEventListener('mouseup', this.mouseUp, false);

        if (!this.dragging) return;
        this.dragging = false;
        //var v = dragPoint.diffAngle / dragPoint.timeDiff;
        if (dragPoint.times.length < 4) return;
        console.log('up', dragPoint.times, dragPoint.angles);

        // var angularVelocities = [];
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


            // else if (diffAngle>0 && overallDir===-1) {
            //     diffAngle = -Math.PI*2 + diffAngle;
            //     alert('correct left');
            // }
            // if (dragPoint.angles[i] > 0 && dragPoint.angles[i+1]<0) {
            //     diffAngle = Math.PI*2 + diffAngle;
            //     alert('correct left');
            // }
            // else if (dragPoint.angles[i] < 0 && dragPoint.angles[i+1]>0) {
            //     //diffAngle = Math.PI*2 + diffAngle;
            //     alert('correct right');
            // }
            totalDiffAngle += diffAngle;
            totalDiffTime += diffTime;
            av = (diffAngle / diffTime) * i + 1;
            console.log(i, 'av ' + av, 'a=' + diffAngle, 't=' + diffTime);
            // if (av<0 && overallDir===1) {
            //     // var xdiffAngle = Math.PI*2 + diffAngle;
            //     // console.log('xdiffAngle='+xdiffAngle);
            //     alert('correct right');
            // }
            // else if (av>0 && overallDir===-1) {
            //     // var xdiffAngle = Math.PI*2 + diffAngle;
            //     // console.log('xdiffAngle='+xdiffAngle);
            //     alert('correct left');
            // }
            //angularVelocities.push(av);
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
        console.log('aav', averageAngularVelocity, overallDir);

        this.physicsV.setAngularVelocity(averageAngularVelocity * 10);
    }

    render() {
        return (<canvas ref={this.refCanvas} id="knobscanvas"></canvas>);
    }
}

export default PixiKnob;