import React, {Component} from 'react';
import PixiKnobs from './PixiKnobs';
import SketchCanvas from './SketchCanvas';
import VirtualSpin from 'jaxcore-virtualspin';
import EventEmitter from 'events';
import io from 'socket.io-client';

const port = 3300;

class App extends Component {
	constructor() {
		super();
		
		this.state = {
			edgeSize: Math.round(window.innerHeight / 11),
			leftPosition: 0,
			rightPosition: 0
		};
		
		var config = {
			friction: 0.1
		};
		this.spinV = new VirtualSpin(config);
		this.spinH = new VirtualSpin(config);
		
		this.events = new EventEmitter();
		
		this.leftSpin = null;
		this.rightSpin = null;
	}
	
	componentWillMount() {
		window.addEventListener('resize', () => {
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				this.setState({
					width: window.innerWidth,
					height: window.innerHeight,
					edgeSize: Math.round(window.innerHeight / 11)
				});
			}, 200);
		});
	}
	
	componentDidMount() {
		this.connect();
	}
	
	componentWillUnmount() {
	
	}
	
	connect() {
		var socket = io.connect(document.location.protocol + '//' + document.location.hostname + ':' + port);
		socket.on('connect', () => {
			console.log('Client connected');
			this.setState({
				serverConnected: true
			});
			
			
		});
		
		socket.on('disconnect', () => {
			console.log('Client closed');
			this.setState({
				serverConnected: false
			});
		});
		
		socket.on('spin-connected', (spinId) => {
			console.log('spin-connected', spinId);
			
			if (!this.leftSpin) this.leftSpin = spinId;
			else if (!this.rightSpin) this.rightSpin = spinId;
		});
		
		socket.on('spin-disconnected', (spinId) => {
			console.log('spin-disconnected', spinId);
		});
		
		socket.on('spin', (spinId, direction, position) => {
			console.log('spin', direction);
			if (spinId === this.leftSpin) {
				this.setState({
					leftPosition: position
				});
			}
			else if (spinId === this.rightSpin) {
				this.setState({
					rightPosition: position
				});
			}
			else {
				console.log('unknown', spinId, this.leftSpin, this.rightSpin);
				if (!this.leftSpin) this.leftSpin = spinId;
				else if (!this.rightSpin) this.rightSpin = spinId;
			}
		});
		
		socket.on('knob', (spinId, pushed) => {
			console.log('knob', pushed);
		});
		
		socket.on('button', (spinId, pushed) => {
			console.log('button', pushed);
			this.onClear();
		});
		
		this.socket = socket;
	}
	
	render() {
		return (
			<div className="App">
				<a id="clearbutton" href="javascript:" onClick={this.onClear} alt="Clear">X</a>
				<SketchCanvas leftPosition={this.state.leftPosition} rightPosition={this.state.rightPosition}
							  events={this.events} ref={this.refSketch} edgeSize={this.state.edgeSize}
							  spinV={this.spinV} spinH={this.spinH}/>
				{/*<PixiKnobs leftPosition={this.state.leftPosition} rightPosition={this.state.rightPosition}*/}
						   {/*edgeSize={this.state.edgeSize} spinV={this.spinV} spinH={this.spinH}/>*/}
				
				<PixiKnobs leftPosition={0} rightPosition={0}
						   edgeSize={this.state.edgeSize} spinV={this.spinV} spinH={this.spinH}/>
			</div>
		);
	}
	
	onClear = (e) => {
		this.events.emit('clear');
	}
	
}

export default App;
