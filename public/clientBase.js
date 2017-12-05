
function ClientBase(){
	this.localVideo = null
	this.startButton = null
	this.stopButton = null
	this.groupIdBox = null
	this.wsc = new WebSocket('wss://ispyrevolution.com/websocket/')
	this.peerConnectionConfig = {'iceServers': [
		  {'url': 'stun:stun.services.mozilla.com'}
		, {'url': 'stun:stun.l.google.com:19302'}
		, {'url': 'turn:ispyrevolution.com'
		  	  	,'username': 'root'
			 	,'credential': 'a0ec22b8d37003895df189a49af2ac35'
		  }
	]};
	
	this.connectToGroup = function(groupId){
		groupIdBox = document.getElementById('connectionBox');
		groupIdString = groupIdBox.value;
		console.log('attempting to connect camera with groupId: ' + groupIdString);
		wsc.onmessage = onInitialMessage;
		wsc.send(JSON.stringify({"clientType": getClientType(),"groupId": groupIdString}));
	};

	this.onConnectionFailure = function(err){
		console.log(err);
		alert(err);
		this.resetUIElements();
	};

	this.resetUIElements = function(){
		startbutton.enabled = true;
		stopbutton.enabled = false;
		groupIdBox.value = '';
		localVideo.src = null;
	};

	this.onInitialMessage = function(message){
		console.log('received initial response from server');
		var signal = JSON.parse(evt.data);
		if(signal.connected) onAckReceived(signal);
		else if(signal.error) onConnectionFailure(signal.error);
		else this.onConnectionFailure('invalid initial message:' + signal);
	};

	//message received from server
	this.onMessage = function(evt){
		console.log('received message from server');
		var signal = JSON.parse(evt.data);
		if(signal.sdp) this.onSDPMessage(signal);
		else if(signal.candidate) this.onIceMessage(signal);
		else if(signal.disconnect) this.onDisconnectMessage(signal);
		else console.log('invalid message format: ' + signal);
	};

	//message received with ice candidate
	this.onIceMessage = function(message){};
	
	//message received with session description
	this.onSDPMessage = function(message){};

	//disconnect message received
	this.onDisconnectMessage = function(message){};
	
	this.pageReady() = function(){
		startButton = document.getElementById('startButton');
		localVideo = document.getElementById('localVideo');
		startButton.addEventListener('click', this.connectToGroup);
	};

	this.localDisconnect = function(){
		wsc.send(JSON.stringify({"disconnect":"true"});
		resetUIElements();
		wsc.onmessage = this.onMessageWhileUnconnected;
	};

	this.disconnectReceived = function(message){};

	this.onPageExit = function(evt){
		localDisconnect();
	};

	this.onAckReceived = function(signal){
		wsc.onmessage = this.onMessage();
		window.addEventListener('beforeunload',onPageExit,false);
	};

	this.onMessageWhileUnconnected = function(message){
		console.log('unsolicted message received: ' + message);
	};

};
