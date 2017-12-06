
function CameraClient(){
	var self = this;
	ClientBase.call(this);

	this.viewingPeers = new Map();

	this.localVideoStream = null;

	this.buildPeerConnection = function(i){
		var peerConn = new RTCPeerConnection(this.peerConnectionConfig);
		peerConn.onicecandidate = function(evt){
			console.log('received ice candidate for connection ' + i);
			if(!evt || !evt.candidate) return;
			self.wsc.send(JSON.stringify({
				"candidate": evt.candidate, 
				"viewerId":i
			}));
		};
		peerConn.addStream(this.localVideoStream);
		return peerConn;
	};

	/* create RTCPeerConnection for viewer i if it does not exist
		return the RTCPeerConnection for viewer i */

	this.getPeerConnection = function(i){
		if(!this.viewingPeers.has(i))
			this.viewingPeers.set(i,this.buildPeerConnection(i));
		return this.viewingPeers.get(i);
	};

	this.checkMessageForId = function(message){
			if(!message.viewerId){
				console.log('invalid message: no viewer id ' + message);
				return false;
			}
		return true;
	};

	this.createAndSendAnswer = function(viewerId){
		self.getPeerConnection(viewerId).createAnswer(
			function(answer){
				var ans = new RTCSessionDescription(answer);
				self.getPeerConnection(viewerId).setLocalDescription(
					new RTCSessionDescription(ans),
					function(){
						self.wsc.send(JSON.stringify({
							"sdp":ans,
							"viewerId": viewerId
						}));
					},
					function(error){console.log(error);}
				);
			},
			function(error){console.log(error);}
		);
	};	
	navigator.getUserMedia(
		{"audio":false,"video":true},
		function(stream){
			console.log('retrieved local video stream');
			self.localVideoStream = stream;
			console.log(self);
			self.localVideo.src = URL.createObjectURL(self.localVideoStream);
		},
		function(error){
			console.log(error);
			alert("your browser may not support webRTC");
		}
	);			
};

CameraClient.prototype = Object.create(ClientBase.prototype);
CameraClient.constructor = CameraClient;

CameraClient.prototype.resetUIElements = function(){
	this.startbutton.enabled = true;
	this.stopbutton.enabled = false;
	this.groupIdBox.value = '';
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
		this.getPeerConnection(message.viewerId).setRemoteDescription(new RTCSessionDescription(message.sdp));
		this.createAndSendAnswer(message.viewerId);
	}
};

CameraClient.prototype.onDisconnectMessage = function(message){
	if(this.checkMessageForId(message)){
		this.getPeerConnection(message.viewerId).close();
		this.viewingPeers.delete(message.viewerId);
	}
};

CameraClient.prototype.getClientType = function(){return 'camera';};
	


