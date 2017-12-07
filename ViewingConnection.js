ClientConnection = require('./ClientConnection.js');

// child class for client connections to viewers
function ViewingConnection(newGroupId, newParent, newWebSock){
	ClientConnection.call(this,newGroupId, newParent, newWebSock);
};

ViewingConnection.prototype = Object.create(ClientConnection.prototype);
ViewingConnection.prototype.constructor = ViewingConnection;

module.exports = ViewingConnection;
