var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Client(server){
	EventEmitter.call(this);
	this.user = null;
	
	var client = this;
	var rpc = server.rpc;
	var subscriptions = server.subscriptions;
	var authManager = server.authManager;
	
	this.actions = {
		login: function login(payload, callback){
			authManager.login(payload.cred, function(err, user){
				if(err){
					return callback(err);
				}
				if(!user){
					return callback(new Error("Authentication failed"));
				}
				client.user = user;
				callback();
			});
		},
		req: function req(payload, callback){
			if(!client.user){
				return callback(new Error("Login required"));
			}
			rpc.invoke(payload.method, payload.args || [], callback);
		},
		sub: function sub(payload, callback){
			if(!client.user){
				return callback(new Error("Login required"));
			}
			subscriptions.subscribe(client, payload.topic, callback);
		},
		unsub: function unsub(payload, callback){
			if(!client.user){
				return callback(new Error("Login required"));
			}
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