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
var sockets = [];
var currentTurn;
var wireLeft;
var emptyLeft;
var bombLeft;
var cardRevealedThisTurn;

// This defines the port that we'll be listening to
server.listen(3000);
console.log ('Server Started');

initServer();

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

        console.log("CURRENT players IN SESSION");
        console.log(players);

        socket.broadcast.emit('playerConnection', player); // previens les autres utilisateurs
        for(let id in players) {
            if (id != socket.id) {                
                socket.emit('playerConnection', players[id]); // envoi la liste des autres utilisateurs
            }
        }
    });
	
    socket.on('disconnect',() => {
        console.log('User disconnected: ' + socket.id);
        delete players[socket.id];
        delete socket[socket.id];
        socket.broadcast.emit('playerDisconnection', {id: socket.id}); 
    });

    socket.on('startGame', function (data) {
        console.log('Game start !')
        startGame();
    });

    socket.on("revealCard", function (data) {
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
    gameType = gameTypeAvailable.get(4);     // utilise type de partie selon nb joueurs
    console.log("Starting game with ", gameType);
    currentTurn = 4;
    cardRevealedThisTurn = 0;
    initDeck();
    initRoles();
    distributeRoles();
    distributeCards( );
}

function endTurn() {
}

function initDeck() {
    wireLeft = gameType.wire;
    emptyLeft = gameType.emptyLeft;
    bombLeft = gameType.bomb;
}

function updateDeck(){
    for (let i = 0; i < wireLeft; i++) {
        deck.push('wire');
    }
    for (let i = 0; i < emptyLeft; i++) {
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
    for(let i=0; i < sockets.length; i++) {
        let role = roles.pop();
        let socket = sockets[player];
        socket.emit('roleAssignement', {role: role});
    }
}

// distribue des cartes differentes a chaque joueur
function distributeCards() {
    for(let player in players) {
        let cards = popCardFromDeck(nbPlayer);
        let socket = sockets[player];
        socket.emit('newHand', {hand: cards});
    }   
}

function popCardFromDeck(nbCard) {
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
