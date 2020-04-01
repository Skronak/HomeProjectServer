class Player {
    constructor(name, room) {
        this.name = name;
        this.room = room;
        this.username;
        this.role;
        this.socket;
        this.hand = [];
        this.token = false;
    }

    setRole(role) {
        this.role = role;
    }
}
module.exports = Player
