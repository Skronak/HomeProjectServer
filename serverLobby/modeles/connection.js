var Player = require('./player');

class Connection {
    constructor(socket, playerName, room) {
        this.socket = socket;
        this.player = new Player(playerName, room);
    }
}
module.exports = Connection
