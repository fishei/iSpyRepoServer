
<<<<<<< HEAD
var localVideo = null
	,peerConnection = null
	,localVideoStream = null
	,hasSentAnswer = false
	,startButton = null
	,wsc = new WebSocket('wss://ispyrevolution.com/websocket/')
	
	// configure peer connections to use our turn server running on DO droplet
	,peerConnectionConfig = {iceServers: 
                         [{'urls': 'turn:ispyrevolution.com:3478'
		  	  ,'username': 'duncan'
			  ,'credential': 'thisisduncan'
		  }
	]};
=======
function CameraClient(){
	var self = this;
	ClientBase.call(this);
>>>>>>> ObjectOriented

	this.viewingPeers = new Map();
	this.offersSent = new Map();
	this.localVideoStream = null;

	this.buildPeerConnection = function(i){
		var peerConn = new RTCPeerConnection(this.peerConnectionConfig);
		peerConn.onicecandidate = function(evt){
			console.log('received ice candidate for connection ' + i);
			if(!evt || !evt.candidate) return;
			console.log('sending ice candidate to remote peer ' + i);
			self.wsc.send(JSON.stringify({
				"candidate": evt.candidate, 
				"viewerId":i
			}));
		};
		peerConn.addStream(this.localVideoStream);
		this.offersSent.set(i,false);
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
						console.log('sending sdp answer to remote peer ' + viewerId);
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
			self.localVideo.src = URL.createObjectURL(self.localVideoStream);
		},
		function(error){
			console.log(error);
			alert("your browser may not support webRTC");
		}
	);			
};

<<<<<<< HEAD
	// set up event handler to handle messages from signaling svr
wsc.onmessage = function(evt){
	console.log('received message');
	if(!peerConnection) {
		return;
	}
	var signal = JSON.parse(evt.data);
	//check for session description message from signaling server
	if(signal.sdp){
		console.log('received SDP from remote peer');
		peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
	}
	//check for ice candidate description from signaling server
	else if(signal.candidate){
		console.log("Received ICECandidate from remote peer.");
		peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
	}
	//if we haven't replied to the caller then send them an answer
	if(!hasSentAnswer) createAndSendAnswer();
};

function startStreaming(){
	// to do: move getUserMedia options to "static variable" at top of page
	console.log('starting stream upload');
	//startButton.addAttribute("disabled");
	//create a peer connection object and add an ice candidate handler to send ice candidates to remote peer
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
	peerConnection.onicecandidate = onIceCandidateHandler;
	//get video and audio feed from local device, add streams to peer connection and local video element
	navigator.getUserMedia({"audio": false, "video": true}, function(stream){
		console.log('retrieved local video stream');
		localVideoStream = stream;
		localVideo.src = URL.createObjectURL(localVideoStream);
		peerConnection.addStream(localVideoStream);
	}, function(error){console.log(error);});
		console.log('added local video stream');
};

//create a session description, send it to remote peer, and set the local description of the peer connection
function createAndSendAnswer(){
	console.log('creating answer');
	peerConnection.createAnswer(
		function(answer){
			console.log('created answer');
			var ans = new RTCSessionDescription(answer);
			peerConnection.setLocalDescription(new RTCSessionDescription(ans), 
				function(){
					console.log('set local description');
					wsc.send(JSON.stringify({"sdp":ans}));
				},
				function(error){console.log(error);}
			);
		},
		function(error){console.log(error);}
	);
	hasSentAnswer = true;
};

//fires when an ice candidate is received from the turn server, sends candidate description to remote peer
function onIceCandidateHandler(evt) {
  console.log('received ice candidate');
  if (!evt || !evt.candidate) return;
  console.log('sending ice candidate to remote peer');
  wsc.send(JSON.stringify({"candidate": evt.candidate }));
=======
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
		this.getPeerConnection(message.viewerId).addIceCandidate(new RTCIceCandidate(message.candidate));
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
>>>>>>> ObjectOriented
};

CameraClient.prototype.getClientType = function(){return 'camera';};
	


