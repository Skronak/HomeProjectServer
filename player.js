class Player {
    constructor(name) {
        this.id = "";
        this.username = "";
        this.hand = [];
        this.token = false;
        this.role = "";
        this.handFlipped = false;
        this.roomId = "";
    }

    setRole(role) {
        this.role = role;
    }
}
module.exports = Player
