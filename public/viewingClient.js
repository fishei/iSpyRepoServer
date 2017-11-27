var remoteVideo = null
	,peerConnection = null
	,remoteVideoStream = null
	,wsc = new WebSocket('wss://ispyrevolution.com/websocket/')
	,peerConnectionConfig = {'iceServers': 
       [{	'url': 'turn:ispyrevolution.com'
		  	  ,'username': 'root'
			  ,'credential': 'a0ec22b8d37003895df189a49af2ac35'
		  }
	]};

function pageReady(){
	remoteVideo = document.getElementById("remoteVideo");
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
	peerConnection.onicecandidate = onIceCandidateHandler;
	peerConnection.onaddstream = onAddStreamHandler;
	wsc.onopen = createAndSendOffer;
};

function createAndSendOffer(){
	peerConnection.createOffer(
		function(offer){
			var off = new RTCSessionDescription(offer);
			peerConnection.setLocalDescription(new RTCSessionDescription(off),
				function(){
					wsc.send(JSON.stringify({"sdp":off}));
				},
				function(error){console.log(error);}
			);
		},
		function(error){console.log(error);}
	);
};

wsc.onmessage = function(evt){
	var signal = JSON.parse(evt.data);
	if(signal.sdp){
		console.log("Received SDP from remote peer.");
		peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
	}
	else if (signal.candidate) {
		console.log("Received ICECandidate from remote peer.");
		peerConn.addIceCandidate(new RTCIceCandidate(signal.candidate));
	}
};

function onIceCandidateHandler(evt) {
  console.log('received ice candidate');
  if (!evt || !evt.candidate) return;
  console.log('sending ice candidate to remote peer');
  wsc.send(JSON.stringify({"candidate": evt.candidate }));
};

function onAddStreamHandler(evt) { 
	// set remote video stream as source for remote video HTML5 element
	remoteVideo.src = URL.createObjectURL(evt.stream);
};


