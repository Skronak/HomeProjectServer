var GameType = require('./gametype');
var server = require('http').createServer();
var io = require('socket.io')(server);
var Player = require('./player');

var revealedCard = [];
var deck = [];
var roles = [];
var nbPlayer;
var gameType;
var gameTypeAvailable = new Map();
var playerTurn;
var players = [];

// This defines the port that we'll be listening to
server.listen(3000);
console.log ('Server Started');

initServer();

// "Listens" for client connections
io.sockets.on('connection', function(socket)
{
	console.log('User connected: ' + socket.id);
	socket.emit('connectionEstabilished', {id: socket.id});

    var player = new Player();
    socket.on('playerName', (playerName) => {
        console.log('User logged: ' + socket.id);
        if (players.filter(it => it.id.includes(socket.id)) == 0) {
            players.push({
                id : socket.id,
                playerName : playerName
            });            
        }

        console.log("CURRENT USER IN SESSION");
        console.log(players);

        io.emit('userList',{userList: {players: players}});
    });
	
    socket.on('disconnect',() => {               
        console.log('User disconnected: ' + socket.id);
        for(let i=0; i < players.length; i++) {
            if (players[i].id === socket.id) {
                players.splice(i,1); 
            }
        }
        io.emit('playerDisconnection', {id: socket.id}); 
    });

    socket.on('startGame', function (data) {
        console.log('Game start !')
        startGame();
    });

    socket.on("revealCard", function (data) {
        data.targetPlayer;
        data.targetCard;
    });

    function revealCard(target) {
        io.emit('revealCard', target);
        io.emit('giveToken', target);
    }
});

function initServer() {
    gameTypeAvailable.set(4, new GameType(15,4,1,3,1));
    gameTypeAvailable.set(5, new GameType(19,5,1,3,2));
    gameTypeAvailable.set(6, new GameType(23,6,1,4,2));
    gameTypeAvailable.set(7, new GameType(27,7,1,5,2));
    gameTypeAvailable.set(8, new GameType(31,8,1,5,3));
}

function startGame() {
    nbPlayer = io.engine.clientsCount;
    console.log("Nb players ", nbPlayer);
    // utilise type de partie selon nb joueurs
    gameType = gameTypeAvailable.get(4);
    console.log(gameType);
     
    initDeck();
    initRoles();
    distributeRoles();
    distributeCards(3);

}

function initDeck() {
    for (let i = 0; i < gameType.wire; i++) {
        deck.push('wire');
    }
    for (let i = 0; i < gameType.empty; i++) {
        deck.push('empty');
    }
    for (let i = 0; i < gameType.bomb; i++) {
        deck.push('bomb');
    }
    shuffle(deck);
}

function initRoles() {
    for(let i=0; i < gameType.goodGuys; i++) {
        roles.push('sherlock');
    }
    for(let i=0; i < gameType.badGuys; i++) {
        roles.push('moriarty');
    }
    shuffle(roles);
}

function distributeRoles() {
    for(let i=0; i < nbPlayer; i++) {
        let role = roles.pop();
        io.sockets.emit('roleAssignement', {role: role});
    }
}

function distributeCards(cardPerPlayer) {
    for(let i=0; i < nbPlayer; i++) {
        let cards = getCard(cardPerPlayer);
        io.sockets.emit('newHand', {hand: cards});
    }
}

function getCard(nbCard) {
    let cards = [];
    for (let i = 0; i < nbCard; i++) {
        let card = deck.pop();
        cards.push(card);
    }
    
    return cards;
}

function revealCard() {

}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
