var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Client = require('./client');
var RpcHandler = require('./rpc-handler');
var SubscriptionsManager = require('./subscriptions');
var AuthManager = require('./auth');

function Server(){
	EventEmitter.call(this);
	this.rpc = new RpcHandler();
	this.subscriptions = new SubscriptionsManager();
	this.authManager = new AuthManager();
}

util.inherits(Server, EventEmitter);
module.exports = Server;
var proto = Server.prototype;

proto.createClient = function createClient(){
	return new Client(this);
};

proto.auth = function auth(handle){
	this.authManager.use(handle);
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