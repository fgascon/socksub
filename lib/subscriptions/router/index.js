var Layer = require('./layer');

function Router(){
	this.stack = [];
}

module.exports = Router;
var proto = Router.prototype;

proto.route = function route(topic, handle){
	this.stack.push(new Layer(topic, handle));
};

proto.handle = function handle(req, done){
	var stack = this.stack;
	var topic = req.topic;
	var idx = 0;
	var layer;
	
	try{
		while(layer = stack[idx++]){
			if(layer.match(topic)){
				req.params = layer.params;
				return layer.handle(req, done);
			}
		}
	}catch(err){
		return done(err);
	}
	
	done(new Error("Topic '"+topic+"' is not exposed on the server"));
};
