
var CameraConnection = require('./CameraConnection');
var ViewingConnection = require('./ViewingConnection');

var events=require('events');
var EventEmitter = events.EventEmitter;

CameraGroup.prototype=Object.create(EventEmitter.prototype);
CameraGroup.prototype.constructor=CameraGroup;

function CameraGroup(newGroupId, cameraSock){
	var groupId = newGroupId;
	var viewingClients = new Map();
	var nextViewerId = 0;


	// ClientConnection object representing the camera uploading video
	var cameraClient = new CameraConnection(groupId,this,cameraSock);
	cameraClient.sendMessage({connected: true});

	this.addViewer = function(viewerSock){
		console.log('New viewing client added to ' + this.description());
		viewingClients.set(nextViewerId, new ViewingConnection(groupId, this, viewerSock));
		console.log('Sending ack message to new viewing client in ' + this.description());
		viewerSock.send(JSON.stringify({"connected":true, "viewerId": nextViewerId}));
		nextViewerId++;
	};

	this.description = function(){ return 'CameraGroup ' + groupId;};

	this.onCameraMessage = function(message){
		console.log(this.description() + ' received message from camera client');
		sendMessageToViewer(message, message.viewerId);
	};

	this.sendMessageToViewer = function(message,viewerId){
		console.log(this.description() + ' sending message to viewing client ' + viewerId);
		viewingClients.get(viewerId).sendMessage(message);
	};
	
	this.onViewerMessage = function(message){
		console.log(this.description() + ' received message from viewing client');
		console.log(this.description() + ' sending message to camera client');
		cameraClient.sendMessage(message);
	};

	this.onMessage = function(message, isCamera){
		console.log(message);
		var signal = JSON.parse(message);
		if(isCamera) onCameraMessage(signal);
		else onViewerMessage(signal);
	};
	
};

module.exports = CameraGroup;
