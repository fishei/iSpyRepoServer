function ClientConnection(newGroupId, newParent, newWebSock){
	var groupId = newGroupId;
	var parent = newParent;
	var webSock = newWebSock;
	var self = this;
	this.isCamera = function(){
		return false;
	};

	this.getGroupId = function(){
		return groupId;
	};
	// add message handler function onMessage
	webSock.on('message', function(message){
		parent.onMessage(message, self.isCamera());
	});

	// to do: add error handling, check for closed web sockets
	this.sendMessage = function(message){
		webSock.send(JSON.stringify(message));
	};
};

module.exports = ClientConnection;
