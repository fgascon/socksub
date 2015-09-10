var pathRegexp = require('path-to-regexp');
var hasOwnProperty = Object.prototype.hasOwnProperty;

function Layer(path, handle){
	this.handle = handle;
	this.topic = undefined;
	this.params = undefined;
	this.regexp = pathRegexp(path, this.keys = []);
}

module.exports = Layer;
var proto = Layer.prototype;

proto.match = function match(topic){
	if(topic == null){
		this.topic = undefined;
		this.params = undefined;
		return false;
	}
	
	var m = this.regexp.exec(topic);
	
	if(!m){
		this.topic = undefined;
		this.params = undefined;
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