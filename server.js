const 	 
	 https = require('https')
	,WebSocketServer = require('ws').Server
	,fs = require('fs')
	,express = require('express')
	,app = express()
	,sslPort = 443
	,ptPort = 80
	,http = require('http')
	,CameraGroup = require('./CameraGroup')

var sslopt = {
	key:	fs.readFileSync('keys/private.key'),
	cert: fs.readFileSync('keys/certificate.crt'),
	ca: 	fs.readFileSync('keys/ca_bundle.crt')
};

app.use(express.static('public'));

var sslServer = https.createServer(sslopt,app).listen(sslPort);

var webSocketServerOpts = {
	server: sslServer,
	clientTracking: true
}

/*
	uncomment to run server on localhost without an ssl
	certificate	
	
	var ptServer = http.createServer(app).listen(ptPort);
*/

var cameraGroups = new Map();

var wss = new WebSocketServer(webSocketServerOpts);
console.log("WebSocketServer started");

/** successful connection */
wss.on('connection', function (client) {
  	console.log("A new WebSocket client was connected.");
  	/** incomming message */
  	client.on('message', onFirstClientMessage);
});

var sendErrorToClient = function(client, err){
	client.send(JSON.stringify({error: err, connected: false}));
};

var invalidMessage = function(client){
	sendErrorToClient(client, 'invalid initial message format');
};

var connectCamera = function(groupId, client){
	console.log('attempting to connect camera');
	if(groupId == ' ' || groupId == ''){
		console.log('blank groupId');
		sendErrorToClient(client, 'invalid groupId');
	}else if(cameraGroups.has(groupId)){
		console.log('groupId exists');
		sendErrorToClient(client, ' camera group with id: ' + groupId + ' already exists');
	}else{
		client.removeEventListener('message', onFirstClientMessage);
		cameraGroups.set(groupId, new CameraGroup(groupId, client));
		cameraGroups.get(groupId).on('disconnect',function()
			{console.log('sonny');}
		);
	}
};

var connectViewer = function(groupId, client){
	if(cameraGroups.has(groupId)){
		client.removeEventListener('message', onFirstClientMessage);
		cameraGroups.get(groupId).addViewer(client);
	}
	else
		sendErrorToClient(client, ' camera group with id: ' + groupId + ' does not exist');
};

var onFirstClientMessage = function(message){
	console.log('Initial message received from client');
	var signal = JSON.parse(message);
	console.log(this);
	if((!signal.groupId) || (!signal.clientType)) invalidMessage(this);
	else if(signal.clientType == 'camera')connectCamera(signal.groupId, this);
	else if(signal.clientType == 'viewer') connectViewer(signal.groupId, client);
	else sendErrorToClient(this, 'invalid client type');
};
