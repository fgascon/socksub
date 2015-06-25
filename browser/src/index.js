var io = require('socket.io-client');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var slice = [].slice;

function createPromise(fnc){
	return new Promise(function(resolve, reject){
		fnc(function(err, result){
			if(err){
				reject(new Error(err));
			}else{
				resolve(result);
			}
		});
	});
}

function wrapSocket(socket){
	var socksub = {};
	var events = new EventEmitter();
	var subscriptions = {};
	
	socket.on('error', function(err){
		events.emit('error', err);
	});
	
	socket.on('event', function(topic, args){
		args.unshift(topic);
		events.emit.apply(events, args);
	});
	
	socket.on('reconnect', function(){
		for(var topic in subscriptions){
			socket.emit('subscribe', topic, function(err){
				if(err){
					socket.emit('error', err);
				}
			});
		}
	});
	
	socksub.subscribe = function(topic, callback){
		if(!subscriptions[topic]){
			subscriptions[topic] = createPromise(function(callback){
				socket.emit('subscribe', topic, callback);
			})['catch'](function(err){
				delete subscriptions[topic];
				throw err;
			});
		}
		return subscriptions[topic];
	};
	
	socksub.unsubscribe = function(topic, callback){
		var subscribePromise = subscriptions[topic];
		delete subscriptions[topic];
		return createPromise(function(callback){
			socket.emit('unsubscribe', topic, callback);
		})['catch'](function(err){
			subscriptions[topic] = subscribePromise;
			throw err;
		});
	};
	
	socksub.on = function(topic, handler, autoSubscribe){
		events.on(topic, handler);
		if(autoSubscribe){
			return socksub.subscribe(topic);
		}
		return socksub;
	};
	
	socksub.off = function(topic, handler, autoUnsubscribe){
		if(handler){
			events.removeListener(topic, handler);
		}else{
			events.removeAllListeners(topic);
		}
		if(autoUnsubscribe){
			if(EventEmitter.listenerCount(events, topic) === 0){
				return socksub.unsubscribe(topic);
			}else{
				return Promise.resolve();
			}
		}
		return socksub;
	};
	
	socksub.rpc = function(method){
		var args = slice.call(arguments, 1);
		return createPromise(function(callback){
			socket.emit('rpc', method, args, callback);
		});
	};
	
	return socksub;
}

module.exports = function(){
	var socket = io.connect.apply(io, arguments);
	return wrapSocket(socket);
};
