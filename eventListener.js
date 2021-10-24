var Player = require('./player');
var PlayerHand = require('./playerHand');
const gameStatus = require('./constants/gameStatus');
const { disconnect } = require('process');
const Game = require('./game');

class EventListener {

    constructor(io) {
        this.players = [];
        this.sockets = [];
        this.rooms = [];
        this.io = io;
        io.sockets.on('connection',	this.handleConnection);
    }

    handleConnection = (socket)=> {
            console.log('User connected: ' + socket.id);
            socket.emit('connectionEstabilished', {id: socket.id});

            socket.on('register', (data) => this.registerPlayer(socket, data)); // todo on join avec name + room
            socket.on('logUser', this.logUser);
            socket.on('disconnect', () => this.disconnectPlayer(socket));
            socket.on("revealCard", (data) => this.revealCard(socket, data));
            socket.on("newTurn", () => this.handleNewTurn);
            socket.on("flipHand", () => this.handleFlipHand(socket));
            socket.on('cardHover', (data) => this.handleHoverCard(socket, data));
            socket.on('startGame',  () => this.startGame(socket));
    }
    
    registerPlayer = (socket, data) => {
        console.log('User registered: ' + socket.id);
        let player = new Player();
        player.username = data.playerName;
        player.id = socket.id;
        player.roomId = data.roomId;
        this.players[socket.id] = player;
        this.sockets[socket.id] = socket;
        socket.join(data.roomId);

        socket.broadcast.to(data.roomId).emit('playerConnection', player); // previens les autres utilisateurs
        for(let id in this.players) {
            if (id !== socket.id) {
                socket.to(data.roomId).emit('playerConnection', this.players[id]); // envoi la liste des autres utilisateurs
            }
        }
    };
    
    logUser = () => {
        console.log("INFO: list players");
        console.log(this.players);
    };
    
    disconnectPlayer = (socket) => {
        console.log('User disconnected: ' + socket.id);
        let player = this.players[socket.id];
        socket.broadcast.to(player.roomId).emit('playerDisconnection', {id: socket.id}); 
        delete this.players[socket.id];
    };
    
    startGame = (socket) => {
        let player = this.players[socket.id];
        let game = new Game();
        let room = new Room(player.roomId, game);
        this.rooms.push(room);
        
        room.game.startGame(this.players);

        this.io.emit('gameStarted', { maxDefusingWire: room.game.getMaxDifusingWire(), 
                                 maxSecureWire: room.game.getMaxSecureWire()} );
    
        room.game.initDeck();
       
        for (let player in this.players) {
            let role = room.game.pickRole(player);

            this.sockets[player].emit('roleAssigment', { role : role });
            console.log("player :", this.players[player].username, " is ", this.players[player].role);
        }
    
        console.log("Distribution en cours");
        this.deck = room.game.distribute();
              
        //Envoi des cartes de chaque joueurs. 
        let handPerPlayer = this.groupBy(this.deck, playerCards => playerCards.player);
        for (let player in this.players) {
            let hands = room.game.fillPlayerHands();
            this.sockets[player].emit('sendCard', { hand: hands.hand });
            this.sockets[player].emit('otherCard', { otherPlayerHand: hands.otherPlayerHand } );
        }
        
        setTimeout(()=> {
            this.io.emit('token', { token : room.game.getFirstPlayer(socket.id)});
        },2000);
    };
    
    handleHoverCard = (socket, idCard) => {
        let player = this.players[socket.id]; 
        if ( player.token === true ) {
            console.log("Une carte est en surbrillance : ", idCard);
            socket.broadcast.to(socket.roomId).emit('cardHover', { hover : idCard }); // previens les autres utilisateurs qu'une carte est pre selectionnee
        }
    };
    
    revealCard = (socket, idCard) => {
        let player = this.players[socket.id];
        if (player && player.token == true) {
            console.log("Une carte a reveal : ", idCard);
            this.rooms[player.roomId]
            let card = this.game.getCardRevealed(idCard);
            console.log("Carte Revelée : ", card);
            this.io.emit('revealCard', card );
    
            this.game.nbCardRevealed++;
    
            // evenement de reussite
            this.players[socket.id].token = false;
            this.players[card.player].token = true;
            this.io.emit('token', { token : this.game.getPlayerIdToken() });
        
            // vérifie l'etat du jeu
            this.gameStatus = this.game.evaluateCard(card);
            this.io.emit('defausse', { defusingWire : this.game.getDifusingWireFound(), secureWire : this.game.getSecureWireFound() });
            
            if (this.gameStatus === 1 ) {
                this.io.emit('GoodGuysWin', {});
            } else if (this.gameStatus === 0) {
                this.io.emit('BadGuysWin', {});
            } else {
        
                // Assez de carte ont été tiré pour le tour de jeu
                if (this.game.nbCardRevealed >= this.game.getNbPlayer()) {
                    
                    // Les tours sont terminés car les joueurs n'ont plus qu'une carte
                    if (this.game.turn >= 4) {
                        this.io.emit('BadGuysWin', {});
                        this.io.emit('Finishedthis.game', {});
                    } else {
                        this.io.emit('endTurn', {});
                        socket.emit('newTurnAvailable', {});
                    }
                } else {
                    socket.emit("notyourturn", {});
                }
            }
        }
    }
    
    
    handleNewTurn = () => {
        this.game.turn++;
        this.game.nbCardRevealed = 0;
        
        this.io.emit('newTurn', { turn : this.game.turn });
        console.log("Distribution en cours");
        deck = this.game.distribute();
    
        //Envoi des cartes de chaque joueurs. 
        let handPerPlayer = this.groupBy(deck, playerCards => playerCards.player);
        for (let player in this.players) {
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
            
            player.handFlipped = false;
            this.sockets[player].emit('sendCard', { hand });
            this.sockets[player].emit('otherCard', { otherPlayerHand } );
        }
    };
    
    handleFlipHand = (socket) => {
        this.players[socket.id].handFlipped = true;
        let player = this.players[socket.id];
        socket.broadcast.to(player.roomId).emit('handFlip', {id: socket.id} );

        if (this.game.evaluatethis.playersReady()) {
            this.io.emit("allHandFlipped", {});
        }
    };

    groupBy = (list, keyGetter) => {
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
}

    module.exports = EventListener;