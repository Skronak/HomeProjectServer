var Game = require('./game');
var server = require('http').createServer();
var io = require('socket.io')(server);
var Player = require('./player');
var PlayerHand = require('./playerHand');

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
        
        
        //Envoi des cartes de chaque joueurs. 
		let handPerPlayer = groupBy(deck, playerCards => playerCards.player);
        for (let player in players) {
			otherPlayerHand = [];
			hand = [];

			for (let [key,val] of handPerPlayer) {			
				if (key === player) {
					for (let i=0;i<val.length;i++) {
						hand.push(val[i]);
					}
				} else {
					playerHand = new PlayerHand();
					playerHand.playerId = key;
					
					for (let i=0;i<val.length;i++) {
						playerHand.cardId.push(val[i].id);
					}
					otherPlayerHand.push(playerHand);
				}
			}

            sockets[player].emit('sendCard', { hand });
			sockets[player].emit('otherCard', { otherPlayerHand } );
        }
        
        tour = 0;
        round = 0;
        io.emit('token', { token : game.getFirstPlayer(socket.id)});
    });

    socket.on('cardHover', function (idCard) {
        if (players[socket.id].token === true) {
            console.log("Une carte est en surbrillance : ", idCard);
            socket.broadcast.emit('cardHover', { hover : idCard }); // previens les autres utilisateurs qu'une carte est pre selectionner
        }
    });

    socket.on("revealCard", function (idCard) {
        if (players[socket.id].token === true) {
            console.log("Une carte a reveal : ", idCard);
            card = game.getCardRevealed(idCard);
            console.log("Carte Revelée : ", card);
            io.emit('revealCard', { reveal : card });

            // evenement de reussite
            players[socket.id].token = false;
            players[card.player].token = true;
            io.emit('token', { token : game.getPlayerIdToken() });
        
            round++;
            // Assez de carte on étaient tiré pour le tour de jeu
            if (round >= game.getNbPlayer()) {
                round = 0;
                tour++;
                // Les tours sont terminés car les joueurs n'ont plus qu'une carte
                if (tour >= 4) {
                    io.emit('BadGuysWin');
                    io.emit('FinishedGame');
                } else {
                    round++;
                    io.emit('newTour', { tour : tour });
                    console.log("Distribution en cours :");
                    deck = game.distribute();

                    //Envoi des cartes de chaque joueurs. 
		            let handPerPlayer = groupBy(deck, playerCards => playerCards.player);
                    for (let player in players) {
			            otherPlayerHand = [];
			            hand = [];

			            for (let [key,val] of handPerPlayer) {			
				            if (key === player) {
					            for (let i=0;i<val.length;i++) {
						            hand.push(val[i]);
					            }
				            } else {
					            playerHand = new PlayerHand();
					            playerHand.playerId = key;
					
					            for (let i=0;i<val.length;i++) {
						            playerHand.cardId.push(val[i].id);
				    	        }
					            otherPlayerHand.push(playerHand);
				            }
			            }
                        sockets[player].emit('sendCard', { hand });
                        sockets[player].emit('otherCard', { otherPlayerHand } );
                    }
                }
            } else {
                socket.emit("notyourturn");
            }
        }
    });
});

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}
