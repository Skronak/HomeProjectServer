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
        for (let i = 0; i < this.empty; i++) {
            this.deck.push(new Card(i, 0));
        }
        for (let i = 0; i < this.wire; i++) {
            this.deck.push(new Card(i, 1));
        }
        for (let i = 0; i < this.bomb; i++) {
            this.deck.push(new Card(i, 2));
        }
        this.shuffle(this.deck);
        console.log("Deck created :");
        console.log(this.deck);
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
