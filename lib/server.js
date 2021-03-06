var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Client = require('./client');
var RpcHandler = require('./rpc-handler');
var SubscriptionsManager = require('./subscriptions');

function Server(){
	EventEmitter.call(this);
	this.rpc = new RpcHandler();
	this.subscriptions = new SubscriptionsManager();
}

util.inherits(Server, EventEmitter);
module.exports = Server;
var proto = Server.prototype;

proto.createClient = function createClient(user){
	return new Client(this, user);
};

proto.expose = function expose(method, handle){
	this.rpc.expose(method, handle);
};

proto.subscription = function subscription(topic, handle){
	this.subscriptions.route(topic, handle);
};

proto.dispatch = function dispatch(topic, args){
	this.subscriptions.dispatch(topic, args);
};
