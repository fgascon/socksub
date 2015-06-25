var Q = require('q');

function Response(socket){
	this.socket = socket;
	this.deferred = Q.defer();
}

module.exports = Response;

var proto = Response.prototype;

proto.accept = proto.resolve = function(){
	this.deferred.resolve();
};

proto.reject = function(reason){
	this.deferred.reject(reason);
};