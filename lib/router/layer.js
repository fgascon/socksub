var pathRegexp = require('path-to-regexp');
var hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = SubscriptionLayer;

function SubscriptionLayer(path, fn){
	this.handle = fn;
	this.params = undefined;
	this.topic = undefined;
	this.user = undefined;
	this.regexp = pathRegexp(path, this.keys = []);
}

SubscriptionLayer.prototype.match = function match(topic){
	if(topic == null){
	    // no topic, nothing matches
		this.params = undefined;
		this.path = undefined;
		this.user = undefined;
		return false;
	}
	
	var m = this.regexp.exec(topic);
	
	if(!m){
		this.params = undefined;
		this.topic = undefined;
		this.user = undefined;
		return false;
	}
	
	// store values
	this.params = {};
	this.topic = m[0];
	
	var keys = this.keys;
	var params = this.params;
	var prop;
	var n = 0;
	var key;
	var val;
	
	for(var i = 1, len = m.length; i < len; ++i){
		key = keys[i - 1];
		prop = key ? key.name : n++;
		val = m[i];
		
		if(val !== undefined || !(hasOwnProperty.call(params, prop))){
			params[prop] = val;
		}
	}
	
	return true;
};
