var GameType = require('./gametype');
var Deck = require('./deck');
var Roles = require('./roles');

class Game {
    constructor() {
        this.players = [];
        this.deck = [];
        this.defausse = [];
        this.gameTypeAvailable = new Map();
		this.secureWireFound = 0;
		this.difusingWireFound = 0;
    }

    initGame() {
        console.log("Creating Game ...")

        this.gameTypeAvailable.set(1, new GameType(3,1,1,0,1));
        this.gameTypeAvailable.set(2, new GameType(7,2,1,1,1));
// debug        this.gameTypeAvailable.set(2, new GameType(2,7,1,1,1));
        this.gameTypeAvailable.set(3, new GameType(11,3,1,2,1));
        this.gameTypeAvailable.set(4, new GameType(15,4,1,3,1));
        this.gameTypeAvailable.set(5, new GameType(19,5,1,3,2));
        this.gameTypeAvailable.set(6, new GameType(23,6,1,4,2));
        this.gameTypeAvailable.set(7, new GameType(27,7,1,5,2));
        this.gameTypeAvailable.set(8, new GameType(31,8,1,5,3));

        return this.gameTypeAvailable;
    }

    startGame(players) {
        this.players = players;
        console.log('Game start !');
        this.nbPlayer = 0;
        for (let player in players) {
            this.nbPlayer++;
        }
        console.log("Number of players: ", this.nbPlayer);
        this.gameType = this.gameTypeAvailable.get(this.nbPlayer);     // utilise type de partie selon nb joueurs
		
        this.roles = new Roles(this.gameType.goodGuys, this.gameType.badGuys);
    }

    initDeck() {
        this.deck = new Deck(this.gameType.wire, this.gameType.empty, this.gameType.bomb);
        console.log(this.deck);

        return this.deck;
    }

    pickRole(id) {	
        let role = this.roles.pop();
        this.players[id].role = role;

        return role;
    }

    distribute() {
        return this.deck.distributeCard(this.players);
    }

	// return 0: /
	// return -1: bomb found
	// return 1: all wires found
	evaluateCard(card) {
		if (card.value === 0) { // wire
			this.difusingWireFound++;
			if (this.difusingWireFound === this.nbPlayer) {
				return 1;
			}
		} else if (card.value === 1) { // secure
			this.secureWireFound++;
			return -1;
		} else { // bigben
			return 0;
		}
	}
	
	evaluatePlayersReady() {
		let ready = false;
        for (let player in this.players) {
			ready = this.players[player].handFlipped;
		}
		return ready;
	}
	
    getFirstPlayer(socketId) {
        this.players[socketId].token = true;
        return socketId;
    }

    getCardRevealed(idCard) {
        for (let card in this.deck.deck) {
            if (this.deck.deck[card].id === parseInt(idCard)) {
                let carteSupp = this.deck.deck[card];
                this.defausse.push(carteSupp);
                this.deck.deck = this.arrayRemove(this.deck.deck, parseInt(idCard));

                console.log("Defausse :", this.defausse);
                console.log("Nouveau deck :", this.deck);
                return carteSupp;
            }
        }
        return null;
    }
	
    getDefausse() {
        return this.defausse;
    }

    getNbPlayer() {
        return this.nbPlayer;
    }
	
	getDifusingWireFound() {
		return this.difusingWireFound;
	}
	
	getSecureWireFound() {
		return this.secureWireFound;
	}
	
	getMaxDifusingWire(){
		return this.gameType.wire;
	}
	
	getMaxSecureWire(){
		return this.gameType.empty;
	}

    getPlayerIdToken() {
        for (let player in this.players) {
            if (this.players[player].token === true) {
                return this.players[player].id;
            }
        }
    }

    arrayRemove(arr, value) {
        arr = Object.values(arr).filter(function(returnableObjects){
            return returnableObjects.id !== value;
        });
        return arr;
    }

}
module.exports = Game;
