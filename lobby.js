require('log-timestamp');

let Player = require('./player');
let Room = require('./room');

const ROOM_ID = ["Lobby", "Hanin", "Naehara", "Kzee"];
const ROOM_STATUTS = {
    PENDING: 'pending',
    READY: 'ready',
    BUSY: 'busy'
};

class Lobby {

    constructor(socketIO) {
        this.io = socketIO;
        this.rooms = {};
        this.clients = {};

        this.listen();
    }

    listen() {
        ROOM_ID.forEach(roomId => this.rooms[roomId] = new Room(roomId, ROOM_STATUTS.PENDING, 0, []));
        this.io.sockets.on('connection', (socket) => {
            socket.on('register', (data) => this.registerUser(socket, data));
            socket.on('addRoom', (room) => this.addRoom(socket, room));
            socket.on('joinRoom', (room) => this.joinRoom(socket, room));
            socket.on('disconnect', () => this.disconnectUser(socket));
            socket.on('chat', () => this.chat(socket));
        });
    }
    chat(socket) {
        console.log('trying to chat to'+socket.rooms[0]);
        this.io.to(socket.rooms[0]).emit('chat', 'hello');
    }
    registerUser (socket, playerName) {
        console.log(`registerUser ${socket.id}`);
        socket.join("Lobby");

        let player = new Player(socket.id, playerName, "Lobby");
        this.clients[player.id] = player;

        this.informUsers(socket, player);
        this.listRooms(socket);
    }

    // inform utilisateur d'une nouvelle connexion
    informUsers (socket, currentPlayer) {
        //const other = this.io.sockets.adapter.rooms.get(currentPlayer.roomId);
        // Renvoie la liste des autres client a celui connecte
        Object.keys(this.clients).filter(clientId => this.clients[clientId].id !== currentPlayer.id)
            .forEach(client=> {
                socket.emit('playerConnection', this.clients[client]);
            });
            socket.broadcast.to("Lobby").emit('playerConnection', currentPlayer); // for testing, too fast otherwise
    }

    listRooms(socket) {
        socket.emit('roomList', Object.values(this.rooms).map(room => ({
            id: room.id,
            status: room.status,
            nbClients: this.getNbClientsInRoom(room.id)})));
    }

    getNbClientsInRoom(roomId) {
        const clients = this.io.sockets.adapter.rooms[roomId];
        return clients? clients.length : 0;
    }

    sendRoomInfos(socket, rooms) {
        //https://stackoverflow.com/questions/19044660/socket-io-get-rooms-which-socket-is-currently-in
        //https://newbedev.com/socket-io-rooms-get-list-of-clients-in-specific-room
        //const clients = io.sockets.adapter.rooms.get('Room Name');cle
        //const clientSocket = io.sockets.sockets.get(clientId);

        let resultRoom = Object.values(rooms).map(room => ({
            id:room.id,
            status: room.status,
            nbClientss: room.nbClientss,
            clientIds: room.clientIds}));

        socket.emit('roomInfos', resultRoom);
    }

    joinRoom(socket, roomId) {
        console.log(`joinRoom: ${socket.id} => ${roomId}`);
        socket.leaveAll();
        socket.join(roomId);
        console.log(socket.rooms);

        this.sendRoomInfos(socket, this.rooms);
    }
    
    addRoom (socket, room) {
            rooms.push(room);
            socket.emit('updaterooms', rooms, socket.room);
    }

    disconnectUser(socket) {
        console.log(`disconnectUser ${socket.id}`);
        delete this.clients[socket.id];
        socket.broadcast.emit('playerDisconnection', {id: socket.id});
    }

}

module.exports = Lobby;
