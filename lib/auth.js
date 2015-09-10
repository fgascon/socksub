
function AuthManager(){
	this.stack = [];
}

module.exports = AuthManager;
var proto = AuthManager.prototype;

proto.use = function(handle){
	this.stack.push(handle);
};

proto.login = function(credentials, done){
	var stack = this.stack;
	var idx = 0;
	
	next();
	
	function next(err, user){
		if(err){
			return done(err);
		}
		if(user){
			return done(null, user);
		}
		
		var layer = stack[idx++];
		if(!layer){
			return done();
		}
		
		try{
			layer(credentials, next);
		}catch(err){
			done(err);
		}
	}
};