var EventEmitter = require('events').EventEmitter;
var Router = require('./router');
var Request = require('./request');
var Response = require('./response');

var app = module.exports = {};

app.init = function(){
	this._router = new Router();
};

app.handle = function(socket, topic){
	var req = new Request(socket, topic);
	var res = new Response(socket);
	this._router.handle(req, res);
};

app.route = function(topic, handle){
	this._router.route(topic, handle);
};

module.exports = function(){
	var events = new EventEmitter();
	var router = new Router();
	var app = {};
	
	function handle(socket, topic){
		var req = new Request(socket, topic);
		var res = new Response(socket);
		router.handle(req, res);
		return res.deferred.promise;
	}
	
	app.connection = function(socket){
		var subscriptions = {};
		
		socket.on('subscribe', function(topic, callback){
			if(subscriptions[topic]){
				return callback();
			}
			handle(socket, topic).then(function(){
				function onEvent(args, socketId){
					if(socket.id !== socketId){
						socket.emit('event', topic, args);
					}
				}
				subscriptions[topic] = onEvent;
				events.on(topic, onEvent);
			}).done(function(){
				callback();
			}, function(err){
				var errStr = (err && err.message) || String(err);
				callback(errStr);
			});
		});
		
		socket.on('unsubscribe', function(topic, callback){
			var onEvent = subscriptions[topic];
			if(onEvent){
				events.removeListener(topic, onEvent);
				delete subscriptions[topic];
			}
			callback();
		});
		
		socket.on('disconnect', function(){
			for(var topic in subscriptions){
				events.removeListener(topic, subscriptions[topic]);
			}
		});
	};
	
	app.emit = events.emit.bind(events);
	app.route = router.route.bind(router);
	
	return app;
};