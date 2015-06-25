
module.exports = function bindPromiseToCallback(promise, callback){
	promise.done(function(result){
		callback(null, result);
	}, function(err){
		var errStr = (err && err.message) || String(err);
		callback(errStr);
	});
};