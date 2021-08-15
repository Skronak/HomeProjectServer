var Card = require('./card');

class Deck {
    constructor(empty, wire, bomb) {
        this.empty = empty;
        this.wire = wire;
        this.bomb = bomb;
        this.deck = [];
        this.createDeck();
    }

    createDeck() {
        let idCard = 0;
        for (let i = 0; i < this.empty; i++) {
            this.deck.push(new Card(idCard++, 0));
        }
        for (let i = 0; i < this.wire; i++) {
            this.deck.push(new Card(idCard++, 1));
        }
        for (let i = 0; i < this.bomb; i++) {
            this.deck.push(new Card(idCard++, 2));
        }
        this.shuffle(this.deck);
        console.log("Deck created :");
        console.log(this.deck);
    }

    distributeCard(players) {
        let joueurCourant = 0;
        let list = [];

        for (let player in players)
            list.push(player);
        
        let nbJoueur = list.length;
        for (let card = 0 ; card < this.deck.length ; card++) {
            if (joueurCourant >= nbJoueur) {
                joueurCourant = 0;
            }
            this.deck[card].player = players[list[joueurCourant]].id;
            joueurCourant++;
        }
        return this.deck;
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}
module.exports = Deck
