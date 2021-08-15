let server = require('http').createServer();
let io = require('socket.io')(server);
let Lobby = require('./lobby');

let serverPort = process.argv[2] ? process.argv[2]:3000;
server.listen(serverPort);
console.log("Lobby started on port " + serverPort);

let lobby = new Lobby(io);