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
			self.wsc.send(JSON.stringify({
				"candidate": evt.candidate, 
				"viewerId": this.viewerId
			}));
		};
		this.peerConn.onaddstream = function(evt){
			self.localVideo.addStream(evt.stream);
		};
	};

	this.createAndSendOffer = function(){
		this.peerConn.createOffer(
			function(offer){
				var off = new RTCSessionDescription(offer);
				self.peerConn.setLocalDescription(
					new RTCSessionDescription(off),
					function(){
						self.wsc.send(JSON.stringify({
							"sdp":off, 
							"viewerId": this.viewerId
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
	console.log('received SDP from remote peer: ' + message.viewerId);
	this.peerConn.setRemoteDescription(new RTCSessionDescription(signal.sdp));
};

ViewingClient.onDisconnectMessage = function(message){
	this.resetUIElements();
	this.peerConn.close();
	this.peerConn = null;
};
