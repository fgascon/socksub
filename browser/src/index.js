var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Client(){
	EventEmitter.call(this);
	this.logged = false;
	this.buffer = [];
}

util.inherits(Client, EventEmitter);
module.exports = Client;
var proto = Client.prototype;

proto.action = function action(payload, callback){
	if(this.logged){
		this.emit('action', payload, callback);
	}else{
		this.buffer.push([payload, callback]);
	}
};

proto.flush = function flush(){
	if(!this.logged){
		return;
	}
	var buffer = this.buffer;
	this.buffer = [];
	for(var i = 0; i < buffer.length; i++){
		this.emit('action', buffer[i][0], buffer[i][1]);
	}
};

proto.login = function login(credentials){
	var self = this;
	this.emit('action', {
		type: 'login',
		cred: credentials
	}, function(err){
		if(err){
			self.emit('error', err);
		}else{
			self.logged = true;
			self.flush();
		}
	});
};

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