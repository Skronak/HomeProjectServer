var GameType = require('./gametype');
var Deck = require('./deck');
var Roles = require('./roles');

class Game {
    constructor() {
        this.players = [];
        this.gameTypeAvailable = new Map();
    }

    initGame() {
        console.log("Creating Game ...")

        this.gameTypeAvailable.set(4, new GameType(15,4,1,3,1));
        this.gameTypeAvailable.set(5, new GameType(19,5,1,3,2));
        this.gameTypeAvailable.set(6, new GameType(23,6,1,4,2));
        this.gameTypeAvailable.set(7, new GameType(27,7,1,5,2));
        this.gameTypeAvailable.set(8, new GameType(31,8,1,5,3));

        return this.gameTypeAvailable;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    startGame() {
        console.log('Game start !');
        this.nbPlayer = this.players.lenght;
        console.log("Number of players: ", this.nbPlayer);
        for (let player in this.players){
            this.players[player].socket.emit('gameStart'); // envoi d'un message de début de game.
        }
    // currentTurn = 4;
    // cardRevealedThisTurn = 0;
    
        this.gameType = this.gameTypeAvailable.get(4);     // utilise type de partie selon nb joueurs
        this.initDeck(this.gameType);
        this.initAndsendRoles();
        console.log(this.players);
        // this.updateDeck();
    // initRoles();
    // distributeRoles();
    // distributeCards( );
    }

    initDeck() {
        this.deck = new Deck(this.gameType.wire, this.gameType.empty, this.gameType.bomb);
    }

    initAndsendRoles() {
        this.roles = new Roles(this.gameType.goodGuys, this.gameType.badGuys);
        let i = 0;
        for (let player in this.players){
            this.players[player].setRole(this.roles[i++]);
            this.players[player].socket.emit('role'); // envoi d'un message de début de game.
            console.log("player :", this.players[player].username, " is ", this.players[player].role);
        }
    }

    // updateDeck() {
	//     this.deck = [];
    //     for (let i = 0; i < wireLeft; i++) {
    //         this.deck.push('wire');
    //     }
    //     for (let i = 0; i < emptyLeft; i++) {
    //         this.deck.push('empty');
    //     }
    //     for (let i = 0; i < bombLeft; i++) {
    //         this.deck.push('bomb');
    //     }
    //     shuffle(this.deck);
    // }

//     initRoles() {
//     for(let i=0; i < gameType.goodGuys; i++) {
//         roles.push('sherlock');
//     }
//     for(let i=0; i < gameType.badGuys; i++) {
//         roles.push('moriarty');
//     }
//     shuffle(roles);
// }

//     distributeRoles() {
//     for(let player in players) {	
//         let role = roles.pop();
//         let socket = sockets[player];
//         socket.emit('roleAssignement', {role: role});
//     }
// }

// // distribue des cartes differentes a chaque joueur
//     distributeCards() {
//     for(let player in players) {
//         let cards = popCardFromDeck(currentTurn);
//         let socket = sockets[player];
//         socket.emit('newHand', {hand: cards});
//     }   
// }

//     popCardFromDeck(nbCard) {
//     let cards = [];
//     for (let i = 0; i < nbCard; i++) {
//         let card = deck.pop();
//         cards.push(card);
//     }
    
//     return cards;
// }
}
module.exports = Game;
