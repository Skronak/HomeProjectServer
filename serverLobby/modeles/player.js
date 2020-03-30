class Player {
    constructor(name) {
        this.id;
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
