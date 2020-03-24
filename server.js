var Game = require('./game');
var server = require('http').createServer();
var io = require('socket.io')(server);
var Player = require('./player');

var gameTypeAvailable = new Map();
var players = [];
var sockets = [];
var token;

// This defines the port that we'll be listening to
server.listen(3000);
console.log ('Server Started');

let game = new Game();
var gameTypeAvailable = game.initGame();
console.log("Game created");
console.log("Gametype avalaible : ", gameTypeAvailable);

// "Listens" for client connections
io.sockets.on('connection', function(socket)
{
	console.log('User connected: ' + socket.id);
	socket.emit('connectionEstabilished', {id: socket.id}); // retourn l'id de cette session

    socket.on('register', (playerName) => {
        console.log('User logged: ' + socket.id);
        let player = new Player();
        player.username = playerName;
        player.id = socket.id;
        players[socket.id] = player;
        sockets[socket.id] = socket;
        socket.broadcast.emit('playerConnection', player); // previens les autres utilisateurs
        for(let id in players) {
            if (id != socket.id) {                
                socket.emit('playerConnection', players[id]); // envoi la liste des autres utilisateurs
            }
        }
    });
    
    socket.on('logUser', () => {
        console.log("CURRENT PLAYERS REGISTERED");
        console.log(players);
    })

    socket.on('disconnect',() => {
        console.log('User disconnected: ' + socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnection', {id: socket.id}); 
    });

    socket.on('startGame', function (data) {
        game.startGame(players);
        socket.emit('gameStarted');

        game.initDeck();

        for (let player in players){
            let role = game.pickRole(player);
            sockets[player].emit('roleAssigment', { role : role }); // envoi d'un message de début de game.
            console.log("player :", players[player].username, " is ", players[player].role);
        }

        console.log("Distribution en cours :");
        deck = game.distribute();
        for (let player in players) {
            hand = [];
            mapPlayer = new Map();
            for (let card in deck) {
                if (deck[card].player === players[player].id) {
                    hand.push(deck[card])
                }
                else {
                    if (!mapPlayer[deck[card].player]) {
                        mapPlayer[deck[card].player] = [];
                        mapPlayer[deck[card].player].push(deck[card].id);
                    } 
                    else {
                        mapPlayer[deck[card].player].push(deck[card].id);
                    }
                }
            }
            console.log("Main du joueur ", players[player]);
            console.log(hand);
            console.log("Main des autres:", mapPlayer);
            sockets[player].emit('sendCard', { hand });
            sockets[player].emit('otherCard', { mapPlayer });
            // players: [
            //     playerId: "",
            //     playerHand: [1,2,3]
            //  ]
        }

        // io.emit('token', game.getFirstPlayer(socket.id));
    });


    socket.on('cardHover', function (idCard) {
        console.log("Une carte est en surbrillance : ", idCard);
        socket.broadcast.emit('cardHover', { hover : idCard }); // previens les autres utilisateurs qu'une carte est pre selectionner
    });

    socket.on("revealCard", function (idCard) {
        console.log("Une carte a reveal : ", idCard);
        card = game.getCardRevealed(idCard);
        io.emit('revealCard', { reveal : card.id });
    });
});
