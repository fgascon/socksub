var Router = require('./router');
var Request = require('./request');

function SubscriptionsManager(){
	this.router = new Router();
	this.subscriptions = {};
}

module.exports = SubscriptionsManager;
var proto = SubscriptionsManager.prototype;

proto.route = function route(topic, handle){
	this.router.route(topic, handle);
};

proto.subscribe = function subscribe(client, topic, callback){
	var req = new Request(client.userData, topic);
	var subscriptions = this.subscriptions;
	this.router.handle(req, function(err){
		if(err){
			return callback(err);
		}
		var topic = req.topic;
		if(!subscriptions[topic]){
			subscriptions[topic] = [];
		}
		subscriptions[topic].push(client);
		callback();
	});
};

proto.unsubscribe = function unsubscribe(client, topic, callback){
	var subscriptions = this.subscriptions;
	if(subscriptions[topic]){
		var clients = subscriptions[topic];
		var index = clients.indexOf(client);
		if(index >= 0){
			clients.splice(index, 1);
			if(clients.length === 0){
				delete subscriptions[topic];
			}
		}
	}
	callback();
};

proto.dispatch = function dispatch(topic, args){
	var subscriptions = this.subscriptions;
	if(!subscriptions[topic]){
		return;
	}
	var payload = {
		topic: topic,
		args: args
	};
	subscriptions[topic].forEach(function(client){
		client.emit('event', payload);
	});
};