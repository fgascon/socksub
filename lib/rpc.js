var Q = require('q');
var bindPromiseToCallback = require('./bind-promise-callback');

module.exports = function(){
	var exposed = {};
	
	function handleRpc(method, args, callback){
		var handle = exposed[method];
		if(typeof handle !== 'function'){
			return callback("Method '"+method+"' is not exposed on the server.");
		}
		
		var promise = Q().then(function(){
			return handle.apply(null, args);
		});
		bindPromiseToCallback(promise, callback);
	}
	
	return {
		expose: function(method, handle){
			exposed[method] = handle;
		},
		connection: function(socket){
			socket.on('rpc', handleRpc);
		}
	};
};