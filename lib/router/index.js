var SubscriptionLayer = require('./layer');

module.exports = SubscriptionRouter;

function SubscriptionRouter(){
	this.stack = [];
}

var proto = SubscriptionRouter.prototype;

proto.route = function(topic, handle){
	this.stack.push(new SubscriptionLayer(topic, handle));
};

proto.handle = function(req, res){
	var idx = 0;
	var stack = this.stack;
	var topic = req.topic;
	
	next();
	
	function next(err){
		if(err){
			return res.reject(err);
		}
		var layer = stack[idx++];
		if(!layer){
			return res.reject("Topic '"+topic+"' is not exposed on the server");
		}
		try{
			if(layer.match(topic)){
				req.params = layer.params;
				layer.handle(req, res, next);
			}else{
				next();
			}
		}catch(err2){
			res.reject(err2);
		}
	}
};
