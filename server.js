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
	client.send({error: err});
};

var invalidMessage = function(client){
	sendErrorToClient(client, 'invalid initial message');
};

var connectCamera = function(groupId, client){
	if(cameraGroups.has(groupId)) sendErrorToClient(client, ' camera group with id: ' + groupId + ' already exists');
	else{
		cameraGroups.set(groupId, new CameraGroup(groupId, client));
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
	if(!message.groupId || !message.clientType) invalidMesage(client);
	else if(message.clientType == 'camera') connectCamera(message.groupId, client);
	else if(message.clientType == 'viewer') connectViewer(message.groupId, client);
};
