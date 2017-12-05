const http = require('http')
const port = 440
const express = require('express')

const app = express()

var fs = require('fs')

var https = require('https');

var ws = require('ws');

var sslopt = {
	key:fs.readFileSync('keys/private.key'),
	cert: fs.readFileSync('keys/certificate.crt'),
	ca: fs.readFileSync('keys/ca_bundle.crt')
};

app.use(express.static('public'))

var server = https.createServer(sslopt,app).listen(443);


//credit to stack overflow user jake for http forwarding https://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express

// set up plain http server
var http = express.createServer();

// set up a route to redirect http to https
http.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);

    // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
    // res.redirect('https://example.com' + req.url);
})

// have it listen on 80
http.listen(80);
