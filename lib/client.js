var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Client(server, user){
	EventEmitter.call(this);
	this.user = user;
	
	var client = this;
	var rpc = server.rpc;
	var subscriptions = server.subscriptions;
	var authManager = server.authManager;
	
	this.actions = {
		req: function req(payload, callback){
			rpc.invoke(payload.method, payload.args || [], callback);
		},
		sub: function sub(payload, callback){
			subscriptions.subscribe(client, payload.topic, callback);
		},
		unsub: function unsub(payload, callback){
			subscriptions.unsubscribe(client, payload.topic, callback);
		}
	};
}

util.inherits(Client, EventEmitter);
module.exports = Client;
var proto = Client.prototype;

proto.action = function(payload, callback){
	var type = payload.type;
	var actions = this.actions;
	if(typeof actions[type] === 'function'){
		actions[type].call(this, payload, callback);
	}else{
		callback(new Error("Unsupported action type '"+type+"'"));
	}
};
