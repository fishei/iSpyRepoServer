
function ClientBase(){
	var self = this;
	this.localVideo = document.getElementById("localVideo");
	this.startButton = document.getElementById("startButton");
	this.stopButton = document.getElementById("stopButton");
	this.groupIdBox = document.getElementById("connectionBox");
	this.wsc = new WebSocket('wss://ispyrevolution.com/websocket/');
	this.peerConnectionConfig = {'iceServers': [
		  {'url': 'stun:stun.services.mozilla.com'}
		, {'url': 'stun:stun.l.google.com:19302'}
		, {'url': 'turn:ispyrevolution.com'
		  	  	,'username': 'duncan'
			 	,'credential': 'thisisduncan'
		  }
	]};
	
	this.connectToGroup = function(groupId){
		groupIdBox = document.getElementById('connectionBox');
		groupIdString = groupIdBox.value;
		console.log('attempting to connect camera with groupId: ' + groupIdString);
		this.wsc.onmessage = function(evt){self.onInitialMessage(evt);};
		this.wsc.send(JSON.stringify({"clientType": this.getClientType(),"groupId": groupIdString}));
	};

	this.onConnectionFailure = function(err){
		console.log(err);
		alert(err);
		this.resetUIElements();
	};
	
	this.onInitialMessage = function(evt){
		var signal = JSON.parse(evt.data);
		if(signal.connected) this.onAckReceived(signal);
		else if(signal.err) this.onConnectionFailure(signal.err);
		else this.onConnectionFailure(signal.err);
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

	this.localDisconnect = function(){
		this.wsc.send(JSON.stringify({"disconnect":"true"}));
		this.resetUIElements();
		this.wsc.onmessage = function(evt){self.onMessageWhileUnconnected(evt);};
	};

	this.onPageExit = function(evt){
		this.localDisconnect();
	};

	this.onMessageWhileUnconnected = function(message){
		console.log('unsolicted message received: ' + message);
	};
	
	startButton.addEventListener("click",function(){
		var gid = self.groupIdBox.value;
		self.connectToGroup(gid);
	});
};

	//message received with session description
ClientBase.prototype.onSDPMessage = function(message){console.log('error on sdp');};

	//disconnect message received
ClientBase.prototype.onDisconnectMessage = function(message){console.log('disconnect');};

		//message received with ice candidate
ClientBase.prototype.onIceMessage = function(message){console.log('error on ice');};


ClientBase.prototype.getClientType = function(){
		return 'viewer';
};

ClientBase.prototype.disconnectReceived = function(message){};

ClientBase.prototype.resetUIElements = function(){
		this.startbutton.enabled = true;
		this.stopbutton.enabled = false;
		this.groupIdBox.value = '';
		this.localVideo.src = null;
};

ClientBase.prototype.onAckReceived = function(signal){
		console.log('received ack from server');
		self = this;
		this.wsc.onmessage = function(evt){self.onMessage(evt);};
		window.addEventListener('beforeunload',this.onPageExit,false);
};














