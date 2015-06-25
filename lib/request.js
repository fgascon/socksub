
function Request(socket, topic){
	this.socket = socket;
	this.topic = topic;
	this.user = socket.request.user;
}

module.exports = Request;
