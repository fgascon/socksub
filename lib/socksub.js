var socketio = require('socket.io');
var application = require('./application');
var rpc = require('./rpc');
var slice = [].slice;

module.exports = function(){
	var socksub = {};
	var app = application();
	var rpcApp = rpc();
	var middlewares = [];
	var ios = [];
	
	socksub.install = function(server){
		var io = socketio(server);
		io.on('connection', function(socket){
			app.connection(socket);
			rpcApp.connection(socket);
		});
		ios.push(io);
		middlewares.forEach(function(middleware){
			io.use(middleware);
		});
	};
	
	socksub.use = function(middleware){
		middlewares.push(middleware);
		ios.forEach(function(io){
			io.use(middleware);
		});
	};
	
	socksub.auth = function(authHandler){
		this.use(function(socket, next){
			authHandler(socket.request, function(err, user){
				if(err){
					return next(err);
				}
				socket.request.user = user;
				next();
			});
		});
	};
	
	socksub.emit = function(topic){
		var args = slice.call(arguments, 1);
		app.emit(topic, args);
	};
	
	socksub.event = app.event;
	socksub.expose = rpcApp.expose;
	
	return socksub;
};