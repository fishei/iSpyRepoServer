var ClientConnection = require('./ClientConnection');

// child class for client connections to cameras
function CameraConnection(newGroupId, newParent, newWebSock){
	ClientConnection.call(this,newGroupId, newParent, newWebSock);

	// override this method in camera client objects
	this.isCamera = function(){
		return true;
	};
};

CameraConnection.prototype = Object.create(ClientConnection.prototype);
CameraConnection.prototype.constructor = CameraConnection;

module.exports = CameraConnection;
