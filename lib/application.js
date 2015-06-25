var EventEmitter = require('events').EventEmitter;
var Router = require('./router');
var Request = require('./request');
var Response = require('./response');
var bindPromiseToCallback = require('./bind-promise-callback');

module.exports = function(){
	var events = new EventEmitter();
	var router = new Router();
	var exposed = {};
	var app = {};
	
	app.connection = function(socket){
		var subscriptions = {};
		
		socket.on('subscribe', function(topic, callback){
			if(subscriptions[topic]){
				return callback();
			}
			var req = new Request(socket, topic);
			var res = new Response(socket);
			
			var promise = res.deferred.promise.then(function(){
				function onEvent(args, socketId){
					if(socket.id !== socketId){
						socket.emit('event', topic, args);
					}
				}
				subscriptions[topic] = onEvent;
				events.on(topic, onEvent);
			});
			bindPromiseToCallback(promise, callback);
			
			router.handle(req, res);
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
	app.event = router.route.bind(router);
	
	return app;
};