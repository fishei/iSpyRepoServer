
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
};

