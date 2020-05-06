class Card {
    // Value :
    // 0 : Empty
    // 1 : Wire
    // 2 : Big Ben
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.player = "";
    }
}
module.exports = Card
