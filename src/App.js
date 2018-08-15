import React, { Component } from 'react';
import PixiKnobs from './PixiKnobs';
import SketchCanvas from './SketchCanvas';
import VirtualSpin from 'jaxcore-virtualspin';
import EventEmitter from 'events';

class App extends Component {
  constructor() {
    super();

    this.state = {
      edgeSize: Math.round(window.innerHeight / 11)
    };

    var config = {
      friction: 0.1
    };
    this.spinV = new VirtualSpin(config);
    this.spinH = new VirtualSpin(config);

    this.events = new EventEmitter();
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
      },200);
    });
  }

  componentWillUnmount() {

  }

  render() {
    return (
      <div className="App">
        <a id="clearbutton" href="javascript:" onClick={this.onClear} alt="Clear">X</a>
        <SketchCanvas events={this.events} ref={this.refSketch} edgeSize={this.state.edgeSize}  spinV={this.spinV} spinH={this.spinH} />
        <PixiKnobs edgeSize={this.state.edgeSize} spinV={this.spinV} spinH={this.spinH} />
      </div>
    );
  }

  onClear = (e) => {
    this.events.emit('clear');
  }

}

export default App;
