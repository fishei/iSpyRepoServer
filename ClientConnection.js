function ClientConnection(newGroupId, newParent, newWebSock){
	var groupId = newGroupId;
	var parent = newParent;
	var webSock = newWebSock;

	this.isCamera = function(){
		return false;
	};

	this.getGroupId = function(){
		return groupId;
	};

	// add message handler function onMessage
	webSock.on('message', this.onMessage);

	// to do: add error handling, check for closed web sockets
	this.sendMessage = function(message){
		webSock.send(JSON.stringify(message));
	};
};

ClientConnection.prototype.onMessage = function(message){
	parent.onMessage(message, this.isCamera());
};

module.exports = ClientConnection;
