
function ClientBase(){
	var self = this;
	this.localVideo = null;
	this.startButton = null;
	this.stopButton = null;
	this.groupIdBox = null;
	this.wsc = new WebSocket('wss://ispyrevolution.com/websocket/');
	this.peerConnectionConfig = {'iceServers': [
		  {'url': 'stun:stun.services.mozilla.com'}
		, {'url': 'stun:stun.l.google.com:19302'}
		, {'url': 'turn:ispyrevolution.com'
		  	  	,'username': 'root'
			 	,'credential': 'a0ec22b8d37003895df189a49af2ac35'
		  }
	]};
	console.log(this.wsc);
	
	this.connectToGroup = function(groupId){
		console.log(this);
		groupIdBox = document.getElementById('connectionBox');
		groupIdString = groupIdBox.value;
		console.log('attempting to connect camera with groupId: ' + groupIdString);
		if(this.wsc == null) console.log("NULL!!!!!");
		console.log(this.wsc);
		this.wsc.onmessage = function(evt){self.onInitialMessage(evt);};
		this.wsc.send(JSON.stringify({"clientType": this.getClientType(),"groupId": groupIdString}));
	};

	this.onConnectionFailure = function(err){
		console.log(err);
		alert(err);
		this.resetUIElements();
	};

	this.resetUIElements = function(){
		this.startbutton.enabled = true;
		this.stopbutton.enabled = false;
		this.groupIdBox.value = '';
		this.localVideo.src = null;
	};

	this.onInitialMessage = function(evt){
		console.log(this);
		console.log('received initial response from server');
		var signal = JSON.parse(evt.data);
		if(signal.connected) this.onAckReceived(signal);
		else if(signal.error) this.onConnectionFailure(signal.error);
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
	
	this.pageReady = function(){
		this.startButton = document.getElementById('startButton');
		this.localVideo = document.getElementById('localVideo');
		this.startButton.addEventListener('click', function(){
			self.connectToGroup();
		});
	};

	this.localDisconnect = function(){
		this.wsc.send(JSON.stringify({"disconnect":"true"}));
		this.resetUIElements();
		this.wsc.onmessage = function(evt){self.onMessageWhileUnconnected(evt);};
	};

	this.onPageExit = function(evt){
		this.localDisconnect();
	};

	this.onAckReceived = function(signal){
		this.wsc.onmessage = function(evt){self.onMessage(evt);};
		window.addEventListener('beforeunload',onPageExit,false);
	};

	this.onMessageWhileUnconnected = function(message){
		console.log('unsolicted message received: ' + message);
	};

};

	//message received with session description
ClientBase.prototype.onSDPMessage = function(message){};

	//disconnect message received
ClientBase.prototype.onDisconnectMessage = function(message){};

		//message received with ice candidate
ClientBase.prototype.onIceMessage = function(message){};


ClientBase.prototype.getClientType = function(){
		return 'viewer';
};

ClientBase.prototype.disconnectReceived = function(message){};



















