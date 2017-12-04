

function CameraGroup(newGroupId, cameraSock){
	var groupId = newGroupId;
	var viewingClients = [];

	// ClientConnection object representing the camera uploading video
	var cameraClient = new CameraClient(groupId,this,cameraSock);

	this.addViewer = function(viewerSock){
		console.log('New viewing client added to ' + this.description());
		viewingClients.push(new ViewingClient(groupId,this,viewerSock));
		console.log('Sending ack message to new viewing client in ' + this.description());
		viewerSock.send(JSON.stringify({"connected":true}));
	};

	this.description = function(){ return 'CameraGroup ' + groupId;};

	this.onCameraMessage = function(message){
		console.log(this.description() + ' received message from camera client');
		broadcastToViewers(message);
	};

	this.broadcastToViewers = function(message){
		console.log(this.description() + ' broadcasting message to viewers');
		viewingClients.foreach(function(item,index,array){
			item.sendMessage(message);
		});
	};
	
	this.onViewerMessage = function(message){
		console.log(this.description() + ' received message from viewing client');
		console.log(this.description() + ' sending message to camera client');
		cameraClient.sendMessage(message);
	};

	this.onMessage = function(message, isCamera){
		if(isCamera) onCameraMessage(message);
		else onViewerMessage(message);
	};
};

module.exports = CameraGroup;
