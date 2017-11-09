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
