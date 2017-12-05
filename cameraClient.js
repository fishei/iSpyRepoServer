
function CameraClient(){
	ClientBase.call(this);

	this.viewingPeers = new Map();

	this.localVideoStream = null;

	this.buildPeerConnection = function(i){
		var peerConn = new RTCPeerConnection(this.peerConnectionConfig);
		peerConn.onicecandidate = function(evt){
			console.log('received ice candidate for connection ' + i);
			if(!evt || !evt.candidate) return;
			wsc.send(JSON.stringify({
				"candidate": evt.candidate, 
				"viewerId":i
			}));
		};
		peerConn.addStream(localVideoStream);
	};

	/* create RTCPeerConnection for viewer i if it does not exist
		return the RTCPeerConnection for viewer i */

	this.getPeerConnection = function(i){
		if(!viewingPeers.has(i))
			viewingPeers.set(i,buildPeerConnection(i));
		return viewingPeers.get(i);
	};

	this.checkMessageForId = function(){
			if(!message.viewerId){
				console.log('invalid message: no viewer id ' + message);
				return false;
			}
		return true;
	};
};

CameraClient.prototype = Object.create(ClientBase.prototype);
CameraClient.constructor = CameraClient;

CameraClient.prototype.resetUIElements = function(){
	startbutton.enabled = true;
	stopbutton.enabled = false;
	groupIdBox.value = '';
};

CameraClient.prototype.pageReady() = function(){
	navigator.getUserMedia(
		{"audio":false,"video":true},
		function(stream){
			console.log('retrieved local video stream');
			localVideoStream = stream;
			super.pageReady();
			localVideo.src = URL.createObjectURL(localVideoStream);
		},
		function(error){
			console.log(error);
			alert("your browser may not support webRTC");
		}
	);
};

CameraClient.prototype.onIceMessage = function(message){
	if(this.checkMessageForId(message)){
		console.log('received ICE Candidate from remote peer: ' + message.viewerId);
		this.getPeerConnection(message.viewerId).addIceCandidate(new RTCIceCandidate(signal.candidate));
	}
};

CameraClient.prototype.onSDPMessage = function(message){
	if(this.checkMessageForId(message)){
		console.log('received SDP from remote peer: ' + message.viewerId);
		this.getPeerConnection(message.viewerId).setRemoteDescription(new RTCSessionDescription(signal.sdp);
		this.createAndSendAnswer(message.viewerId);
	}
};

CameraClient.onDisconnectMessage = function(message){
	if(this.checkMessageForId(message)){
		getPeerConnection(message.viewerId).close();
	}
};

	


