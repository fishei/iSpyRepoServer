var remoteVideo = null
	,peerConnection = null
	,remoteVideoStream = null
	,wsc = new WebSocket('wss://ispyrevolution.com/websocket/')
	,peerConnectionConfig = {'iceServers': 
       [{'url': 'stun:stun.services.mozilla.com'}
		, {'url': 'stun:stun.l.google.com:19302'}]
    };

function pageReady(){
	remoteVideo = document.getElementById("remoteVideo");
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
	peerConnection.onicecandidate = onIceCandidateHandler;
	peerConnection.onaddstream = onAddStreamHandler;
};

wsc.onmessage = function(evt){
	peerConnection.createAnswer(
		function(answer){
			var ans = new RTCSessionDescription(answer);
			peerConnection.setLocalDescription(ans, function(){
					wsc.send(JSON.stringify({"sdp": ans}));
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

function onAddStreamHandler(evt) { 
	// set remote video stream as source for remote video HTML5 element
	remoteVideo.src = URL.createObjectURL(evt.stream);
};


