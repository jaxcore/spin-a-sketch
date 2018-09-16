var Spin = require('jaxcore-spin');
Spin.debug(true);

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var opn = require('opn');

app.use(express.static('build'));
var port = process.env.PORT || 3300;

server.listen(port, function() {
	console.log('listening on http://localhost:'+port);
	if (process.env.NODE_ENV !== 'dev') {
		opn('http://localhost:'+port).then(() => {});
	}
});

var spins = {};

io.on('connection', function(socket){
	console.log('Socket connection established');
	
	socket.on('disconnect', function () {
		io.emit('user disconnected');
	});

	// socket.on('play', function (spinId, color) {
	// 	console.log('play', spinId, color);
	// 	if (spins[spinId]) {
	// 		spins[spinId].flash(color);
	// 	}
	// });
});

//Spin.connectUSB(function (spin) {
Spin.connectAll(function(spin) {
	
	var buffer = new Spin.Buffer(spin);
	console.log(buffer);

	spins[spin.id] = spin;
	
	spin.setThrottle(0);

	spin.on('connect', function() {
		console.log('connected');
		spin.flash([0,255,0]);
		io.emit('spin-connected', spin.id);
	});
	
	spin.on('disconnect', function() {
		console.log('disconnected');
		spin.flash([255,0,0]);
		io.emit('spin-disconnected', spin.id);
		delete spins[spin.id];
	});
	
	spin.on('spin', function(direction, position) {
		// if (buffer.spin(direction, 2)) {
			console.log('emit spin', direction, position);
			io.emit('spin', spin.id, direction, position);
			spin.rotate(direction, 0);
		// }
		// else console.log('buffer');
	});
	
	spin.on('knob', function(pushed) {
		console.log('knob pushed: '+pushed);
		io.emit('knob', spin.id, pushed);
	});
	
	spin.on('button', function(pushed) {
		console.log('button pushed: '+pushed);
		io.emit('button', spin.id, pushed);
	});
	
});

if (process.env.NODE_ENV === 'prod') {
	Spin.debug(false);
    console.log = function() {};
    process.on('uncaughtException', function (err) {
        console.error(err);
    });
}