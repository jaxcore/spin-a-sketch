import React, { Component } from 'react';
import PixiKnobs from './PixiKnobs';
import SketchCanvas from './SketchCanvas';
import VirtualSpin from 'jaxcore-virtualspin';
import EventEmitter from 'events';
import Jaxcore, {Spin} from 'jaxcore-client';

class App extends Component {
	constructor() {
		super();

		this.state = {
			edgeSize: Math.round(window.innerHeight / 15),
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

		this.clearbutton = React.createRef();
		this.savebutton = React.createRef();
	}

	componentWillMount() {
		
		
		Jaxcore.connect(() => {
			Spin.connectAll((spin) => {
				console.log('connected spin', spin);
				
				if (!this.leftSpin) this.leftSpin = spin.id;
				else if (!this.rightSpin) this.rightSpin = spin.id;
				spin.on('spin', (direction, position) => {
					if (spin.id === this.leftSpin) {
						this.setState({
							leftPosition: position
						});
					}
					else if (spin.id === this.rightSpin) {
						this.setState({
							rightPosition: position
						});
					}
				});
				spin.on('button', (pushed) => {
					if (pushed) {
						this.onClear();
					}
				});
			});
		});
	}

	resize() {
		const edgeSize = Math.round(window.innerHeight / 15);
		this.setState({
			width: window.innerWidth,
			height: window.innerHeight,
			edgeSize
		});
		this.clearbutton.current.style.bottom = Math.round(edgeSize*1.4) + 'px';
		this.savebutton.current.style.bottom = Math.round(edgeSize/2.5) + 'px';
	}

	componentDidMount() {
		window.addEventListener('resize', () => {
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				this.resize();
			}, 200);
		});
		this.resize();
		
		
	}

	render() {
		return (
			<div className="App">
				<div class="buttons">
					<button id="clearbutton" href="/" onClick={this.onClear} alt="Clear" ref={this.clearbutton}>clear</button><br/>
					<button id="savebutton" href="/" onClick={this.onSave} alt="Clear" ref={this.savebutton}>save</button>
				</div>
				
				<SketchCanvas leftPosition={this.state.leftPosition} rightPosition={this.state.rightPosition}
					events={this.events} ref={this.refSketch} edgeSize={this.state.edgeSize}
					width={this.state.width}
					height={this.state.height}
					spinV={this.spinV} spinH={this.spinH} />
				<PixiKnobs leftPosition={this.state.leftPosition} rightPosition={this.state.rightPosition}
					edgeSize={this.state.edgeSize} spinV={this.spinV} spinH={this.spinH} />
			</div>
		);
	}

	onClear = (e) => {
		e.preventDefault();
		this.events.emit('clear');
	};
	
	onSave = (e) => {
		e.preventDefault();
		let data = document.getElementById('sketchcanvas').toDataURL("image/png").replace("image/png", "image/octet-stream");
		window.location.href = data;
	};

}

export default App;
