var shortID = require('shortid');

class Player {
    constructor() {
        this.id = shortID.generate();
        this.username = '';
        this.hand = [];
    }
}
module.exports = Player