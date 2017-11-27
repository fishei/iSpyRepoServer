var remoteVideo = null
	,peerConnection = null
	,remoteVideoStream = null
	,wsc = new WebSocket('wss://ispyrevolution.com/websocket/')
	//configure peer connection to use our turn server running on DO droplet
	,peerConnectionConfig = {iceServers: 
       [{	'urls': 'turn:ispyrevolution.com:3478'
		  	  ,'username': 'duncan'
			  ,'credential': 'thisisduncan'
		  }
	]};

function pageReady(){
	remoteVideo = document.getElementById("remoteVideo");
	//create a peer connection and add handler functions
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
	peerConnection.onicecandidate = onIceCandidateHandler;
	peerConnection.onaddstream = onAddStreamHandler;
	//create an offer and send it to camera client
	wsc.onopen = createAndSendOffer;
};

function createAndSendOffer(){
	console.log('creating offer');
	peerConnection.createOffer(
		function(offer){
			console.log('created offer');
			var off = new RTCSessionDescription(offer);
			peerConnection.setLocalDescription(new RTCSessionDescription(off),
				function(){
					console.log('set local description, sending offer');
					wsc.send(JSON.stringify({"sdp":off}));
				},
				function(error){console.log(error);}
			);
		},
		function(error){console.log(error);},
		{offerToReceiveVideo: 1} //this line got everything to work, viewing clients must offer to receive the streams the want from the turn server/ camera peer
	);
};

wsc.onmessage = function(evt){
	var signal = JSON.parse(evt.data);
	//check for session description messages
	if(signal.sdp){
		console.log("Received SDP from remote peer.");
		peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
	}
	//check for ice candidate messages
	else if (signal.candidate) {
		console.log("Received ICECandidate from remote peer.");
		peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
	}
};

//fires when an ice candidate is received from turn server, sends candidate description to remote peer
function onIceCandidateHandler(evt) {
  console.log('received ice candidate');
  if (!evt || !evt.candidate) return;
  console.log('sending ice candidate to remote peer');
  wsc.send(JSON.stringify({"candidate": evt.candidate }));
};

//handles adding video stream from remote peer to video element on webpage
function onAddStreamHandler(evt) { 
	// set remote video stream as source for remote video HTML5 element
	remoteVideo.src = URL.createObjectURL(evt.stream);
};


