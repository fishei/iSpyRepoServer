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
  	client.on('message', function (message) {
		console.log('received message');
   		onFirstClientMessage(message, client);
  	});
});

var sendErrorToClient = function(client, err){
	client.send(JSON.stringify({error: err, connected: false}));
};

var invalidMessage = function(client){
	sendErrorToClient(client, 'invalid initial message format');
};

var connectCamera = function(groupId, client){
	if(groupId == ' ' || groupId == ''){
		sendErrorToClient(client, 'invalid groupId');
	}else if(cameraGroups.has(groupId)){
		sendErrorToClient(client, ' camera group with id: ' + groupId + ' already exists');
	}else{
		cameraGroups.set(groupId, new CameraGroup(groupId, client));
		cameraGroups.get(groupId).on('discon',function()
			{console.log('sonny');}
		);
	}
};

var connectViewer = function(groupId, client){
	if(cameraGroups.has(groupId))
		cameraGroups.get(groupId).addViewer(client);
	else
		sendErrorToClient(client, ' camera group with id: ' + groupId + ' does not exist');
};

var onFirstClientMessage = function(message, client){
	console.log('Initial message received from client');
	var signal = JSON.parse(message);
	console.log(signal);
	console.log(signal.groupId);
	console.log(signal.clientType);
	if((!signal.groupId) || (!signal.clientType)) invalidMessage(client);
	else if(signal.clientType == 'camera') connectCamera(signal.groupId, client);
	else if(signal.clientType == 'viewer') connectViewer(signal.groupId, client);
};
