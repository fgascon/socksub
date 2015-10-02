
function RpcHandler(){
	this.exposed = {};
}

module.exports = RpcHandler;
var proto = RpcHandler.prototype;

proto.expose = function expose(method, handle){
	this.exposed[method] = handle;
};

proto.invoke = function invoke(userData, method, args, callback){
	var handle = this.exposed[method];
	if(typeof handle === 'function'){
		handle(userData, args, callback);
	}else{
		callback(new Error("Invalid method '"+method+"'"));
	}
};
