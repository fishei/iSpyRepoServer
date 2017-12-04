ClientConnection = require('./ClientConnection.js');

// child class for client connections to viewers
function ViewingConnection(newGroupId, newParent, newWebSock);
	ClientConnection.call(this,newGroupId, newParent, newWebSock);
};

ViewingClient.prototype = Object.create(ClientConnection.prototype);
ViewingClient.prototype.constructor = ViewingConnection;

};

module.exports = ViewingConnection;
