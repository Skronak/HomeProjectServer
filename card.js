class Card {
    // Value :
    // 1 : Empty
    // 0 : Wire
    // 2 : Big Ben
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.player = "";
    }
}
module.exports = Card
