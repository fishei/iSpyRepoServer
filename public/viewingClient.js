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


