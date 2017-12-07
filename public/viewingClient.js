function ViewingClient(){
	ClientBase.call(this);
	
	this.peerConn = null;
	this.localVideoStream = null;
	this.viewerId = null;

	this.initializePeerConnection = function(){
		this.peerConn = new RTCPeerConnection(this.peerConnectionConfig);
		self = this;
		this.peerConn.onIceCandidate = function(evt){
			console.log('received ice candidate');
			console.log('sending ice candidate to remote peer');
			self.wsc.send(JSON.stringify({
				"candidate": evt.candidate, 
				"viewerId": self.viewerId
			}));
		};
		this.peerConn.onaddstream = function(evt){
			self.localVideo.src = URL.createObjectURL(evt.stream);
		};
	};

	this.createAndSendOffer = function(){
		this.peerConn.createOffer(
			function(offer){
				var off = new RTCSessionDescription(offer);
				self.peerConn.setLocalDescription(
					new RTCSessionDescription(off),
					function(){
						console.log('sending sdp offer to remote peer');
						self.wsc.send(JSON.stringify({
							"sdp":off, 
							"viewerId": self.viewerId
						}));
					},
					function(error){console.log(error);}
				);
			},
			function(error){console.log(error);},
			{offerToReceiveVideo: 1}
		);
	};
};

ViewingClient.prototype = Object.create(ClientBase.prototype);
ViewingClient.constructor = ViewingClient;

ViewingClient.prototype.onIceMessage = function(message){
	console.log('received ice candidate from remote peer');
	this.peerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
};

ViewingClient.prototype.onAckReceived = function(signal){
	if(!signal.viewerId) 
		console.log('ack received with no viewer id');
	else{
		ClientBase.prototype.onAckReceived.call(this,signal);
		this.viewerId = signal.viewerId;
		this.initializePeerConnection();
		this.createAndSendOffer();
	}
};

ViewingClient.prototype.onSDPMessage = function(message){
	console.log('received SDP from remote peer');
	this.peerConn.setRemoteDescription(new RTCSessionDescription(message.sdp));
};
