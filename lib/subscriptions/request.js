
function Request(client, topic){
	this.topic = topic;
	this.client = client;
	this.user = client.user;
}

module.exports = Request;
