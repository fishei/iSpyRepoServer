
var localVideo = null
	,peerConnection = null
	,localVideoStream = null
	,startButton = null
	,wsc = new WebSocket('wss://ispyrevolution.com/websocket/')
	,peerConnectionConfig = {'iceServers': 
       [{'url': 'stun:stun.services.mozilla.com'}
		, {'url': 'stun:stun.l.google.com:19302'}]
    };

function pageReady(){
	startButton = document.getElementById('startButton');
	localVideo = document.getElementById('localVideo');
	
	// check that the browser supports webRTC
	if(navigator.getUserMedia){
		startButton.addEventListener("click", startStreaming);
	}
	else{
		alert("getUserMedia failure, your browser may not support webRTC");
	}
};

	// set up event handler to handle messages from signaling svr
wsc.onmessage = function(evt){
	var signal = JSON.parse(evt.data);
	if(signal.sdp){
		peerConnection.setRemoteDesription(new RTCSessionDescription(signal.sdp));
	}
	else if(signal.candidate){
		peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
	}
};

function startStreaming(){
	// to do: move getUserMedia options to "static variable" at top of page
	//startButton.addAttribute("disabled");
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
	peerConnection.onicecandidate = onIceCandidateHandler;
	navigator.getUserMedia({"audio": false, "video": true}, function(stream){
		localVideoStream = stream;
		localVideo.src = URL.createObjectURL(localVideoStream);
		peerConnection.addStream(localVideoStream);
		createAndSendOffer();
	}, function(error){console.log(error);});
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

function onIceCandidateHandler(evt) {
  if (!evt || !evt.candidate) return;
  wsc.send(JSON.stringify({"candidate": evt.candidate }));
};


	
		

	
