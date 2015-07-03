var Q = require('q');
var Request = require('./request');
var bindPromiseToCallback = require('./bind-promise-callback');

module.exports = function(){
	var exposed = {};
	
	function handleRpc(req, callback){
		var handle = exposed[req.topic];
		if(typeof handle !== 'function'){
			return callback("Method '"+req.topic+"' is not exposed on the server.");
		}
		
		var promise = Q().then(function(){
			return handle.apply(req, req.params);
		});
		bindPromiseToCallback(promise, callback);
	}
	
	return {
		expose: function(method, handle){
			exposed[method] = handle;
		},
		connection: function(socket){
			socket.on('rpc', function(method, params, callback){
				var req = new Request(socket, method);
				req.params = params;
				handleRpc(req, callback);
			});
		}
	};
};
