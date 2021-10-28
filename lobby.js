require('log-timestamp');

const LOBBY = "lobby";
let Player = require('./player');
let Room = require('./room');

const ROOM_ID = ["Hanin", "Naehara", "Kzee"];
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
        ROOM_ID.forEach(roomId => this.rooms[roomId] =new Room(roomId));
        this.io.sockets.on('connection', (socket) => {
            socket.on('register', (data) => this.registerUser(socket, data));
            socket.on('addRoom', (room) => this.addRoom(socket, room));
            socket.on('joinRoom', (room) => this.joinRoom(socket, room));
            socket.on('disconnect', () => this.disconnectUser(socket));
        });
    }

    registerUser (socket, playerName) {
        console.log(`registerUser ${socket.id}`);
        socket.join(LOBBY);

        let player = new Player();
        player.username = playerName;
        player.id = socket.id;
        player.roomId = LOBBY;
        this.clients[player.id] = player;

        this.informUsers(socket, player);
        this.listRooms(socket);
    }

    informUsers (socket, currentPlayer) {
        //const other = this.io.sockets.adapter.rooms.get(currentPlayer.roomId);
        // Renvoie la liste des autres cvlient a celui connecte
        Object.keys(this.clients).filter(clientId => this.clients[clientId].id !== currentPlayer.id)
            .forEach(client=> {
                socket.to(LOBBY).emit('playerConnection', this.clients[client].id);
            });
        setTimeout(()=> {
            socket.broadcast.to(LOBBY).emit('playerConnection', currentPlayer); // for testing, too fast otherwise
        },1000);
    }

    listRooms(socket) {
        socket.emit('roomList', this.rooms);
    }

    getRoomDetails(socket, roomId) {
        //https://stackoverflow.com/questions/19044660/socket-io-get-rooms-which-socket-is-currently-in
        //https://newbedev.com/socket-io-rooms-get-list-of-clients-in-specific-room
        //const clients = io.sockets.adapter.rooms.get('Room Name');
        //const clientSocket = io.sockets.sockets.get(clientId);

        console.log('detailsRoom');

        const clients = this.io.sockets.adapter.rooms[roomId].sockets;
        this.rooms.length = room ? Object.keys(clients).length : 0;
        socket.emit('roomDetail', this.room);
    }

    joinRoom (socket, roomId) {
        console.log(`joinRoom: ${socket.id} => ${roomId}`);

        if(this.rooms.hasOwnProperty(roomId)) {
            socket.join(roomId);//attention room sont automatiquement delete si personne dedans
            socket.leave(LOBBY);

            const clients = this.io.sockets.adapter.rooms[roomId].sockets;
            this.rooms[roomId] = Object.keys(clients).length;
            this.getRoomDetails(socket, this.roomss[roomId]);
        }
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
