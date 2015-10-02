
function Client(actionHandler){
	if(typeof actionHandler !== 'function'){
		throw new Error("Action handler is required");
	}
	this.action = actionHandler;
}

module.exports = Client;
var proto = Client.prototype;

proto.request = function request(method, args, callback){
	this.action({
		type: 'req',
		method: method,
		args: args
	}, callback);
};

proto.subscribe = function subscribe(topic, callback){
	this.action({
		type: 'sub',
		topic: topic
	}, callback);
};

proto.unsubscribe = function unsubscribe(topic, callback){
	this.action({
		type: 'unsub',
		topic: topic
	}, callback);
};
