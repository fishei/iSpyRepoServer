
var localVideo = null
	,peerConnection = null
	,localVideoStream = null
	,hasSentAnswer = false
	,startButton = null
	,wsc = new WebSocket('wss://ispyrevolution.com/websocket/')
	,peerConnectionConfig = {'iceServers': 
                         [{'url': 'turn:ispyrevolution.com'
		  	  ,'username': 'root'
			  ,'credential': 'a0ec22b8d37003895df189a49af2ac35'
		  }
	]};

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
	console.log('received message');
	if(!peerConnection) {
		return;
	}
	var signal = JSON.parse(evt.data);
	if(signal.sdp){
		console.log('received SDP from remote peer');
		peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
	}
	else if(signal.candidate){
		console.log("Received ICECandidate from remote peer.");
		peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
	}
	if(!hasSentAnswer) createAndSendAnswer();
};

function startStreaming(){
	// to do: move getUserMedia options to "static variable" at top of page
	console.log('starting stream upload');
	//startButton.addAttribute("disabled");
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
	peerConnection.onicecandidate = onIceCandidateHandler;
	navigator.getUserMedia({"audio": false, "video": true}, function(stream){
		console.log('retrieved local video stream');
		localVideoStream = stream;
		localVideo.src = URL.createObjectURL(localVideoStream);
		peerConnection.addStream(localVideoStream);
	}, function(error){console.log(error);});
		console.log('added local video stream');
};

function createAndSendAnswer(){
	peerConnection.createAnswer(
		function(answer){
			var ans = new RTCSessionDescription(answer);
			peerConnection.setLocalDescription(new RTCSessionDescription(ans), 
				function(){
					wsc.send(JSON.stringify({"sdp":ans}));
				},
				function(error){console.log(error);}
			);
		},
		function(error){console.log(error);}
	);
	hasSentAnswer = true;
};

function onIceCandidateHandler(evt) {
  console.log('received ice candidate');
  if (!evt || !evt.candidate) return;
  console.log('sending ice candidate to remote peer');
  wsc.send(JSON.stringify({"candidate": evt.candidate }));
};

