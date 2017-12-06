var ClientConnection = require('./ClientConnection');

// child class for client connections to cameras
function CameraConnection(newGroupId, newParent, newWebSock){
	ClientConnection.call(this,newGroupId, newParent, newWebSock);
};

CameraConnection.prototype = Object.create(ClientConnection.prototype);
CameraConnection.prototype.constructor = CameraConnection;

// override this method in camera client objects
CameraConnection.prototype.isCamera = function(){
	console.log('TESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSST!@');
	return true;
};

module.exports = CameraConnection;
