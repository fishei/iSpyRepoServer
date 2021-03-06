
const 	 https = require('https')
	,WebSocketServer = require('ws').Server
	,fs = require('fs')
	,express = require('express')
	,app = express()
	,sslPort = 443
	,ptPort = 80
	,http = require('http')

// load certificate and key files for ssl
var sslopt = {
	key:fs.readFileSync('keys/private.key'),
	cert: fs.readFileSync('keys/certificate.crt'),
	ca: fs.readFileSync('keys/ca_bundle.crt')
};

// serve content from the public directory
app.use(express.static('public'));

var sslServer = https.createServer(sslopt,app).listen(sslPort);

//options for web socket server
var webSocketServerOpts = {
	server: sslServer,
	clientTracking: true
}

/*
	uncomment to run server on localhost without an ssl
	certificate	
	
	var ptServer = http.createServer(app).listen(ptPort);
*/

// create web socket server to relay signaling messages between webrtc peers
var wss = new WebSocketServer(webSocketServerOpts);
console.log("WebSocketServer started");

/** successful connection */
wss.on('connection', function (client) {
  console.log("A new WebSocket client was connected.");
  /** incomming message */
  client.on('message', function (message) {
    console.log('Received message from client');
    //console.log(wss);
    /** broadcast message to all clients */
    broadcast(message, client, wss.clients);
  });
});

// broadcasting the message to all WebSocket clients.
var broadcast = function (data, exclude, clients) {
  var i = 0, n = clients ? clients.size : 0, client = null;
  if (n < 1) return;
  console.log("Broadcasting message to all " + n + " WebSocket clients.");
  for (let client of clients) {
    // don't send the message to the sender...
    if (client === exclude) continue;
    if (client.readyState === client.OPEN){
         console.log('sending message to client');
	 client.send(data);
    }
    else console.error('Error: the client state is ' + client.readyState);
  }
};


