class Player {
    constructor(name, socket) {
        this.id = socket.id;
        this.username = name;
        this.hand = [];
        this.token = false;
        this.socket = socket;
        this.role;
    }

    setRole(role) {
        this.role = role;
    }
}
module.exports = Player
