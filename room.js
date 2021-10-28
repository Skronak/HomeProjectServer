const ROOM_STATUTS = {
    PENDING: 'pending',
    READY: 'ready',
    BUSY: 'busy'
};

class Room {
    constructor(id) {
        this.id = id;
        this.status=ROOM_STATUTS.PENDING;
        this.nbClients=0;
        this.clientIds=[];
        this.game = null;
    }
}

module.exports = Room
