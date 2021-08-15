let Game = require('./game');
let server = require('http').createServer();
let io = require('socket.io')(server);
let Player = require('./player');
let PlayerHand = require('./playerHand');
let GameStatus = require('./constants/gameStatus');
let { disconnect } = require('process');
let EventListener = require ('./eventListener');
let Lobby = require ('./lobby');

let serverPort = process.argv[2] ? process.argv[2]:3000;
server.listen(serverPort);

let gameEventListener = new EventListener(io);
console.log ('Server Started: ' + serverPort); 
