const LOBBY = "lobby";
var Player = require('./player');

class Lobby {

    constructor(socketIO) {
        this.io = socketIO;
        this.rooms = ["Hanin", "Naehara", "Kzee"];
        this.players = [];

        this.listen();
    }

    listen() {
        this.io.sockets.on('connection', this.handleConnection);
    }
    
    handleConnection = (socket) => {
        socket.emit('connect');
        socket.on('register', (data) => this.registerUser(socket, data));
        socket.on('addRoom', (room) => this.addRoom(socket, room));
        socket.on('joinRoom', (room) => this.joinRoom(socket, room));
    }

    registerUser = (socket, playerName) => {
        let player = new Player();
        player.username = playerName;
        player.id = socket.id;
        this.players[player.id] = player;
        socket.join(LOBBY);
        socket.emit(rooms);

        this.informUsers(socket, player);
        this.getRooms(socket);
    }

    informUsers = (socket, currentPlayer) => {
        console.log(this.players.filter(player => player.id != currentPlayer.id ));
        this.players.filter(player => player.id != currentPlayer.id )
               .map(player => {
                    socket.to(LOBBY).emit('playerConnection', player);
                });
        socket.broadcast.to(LOBBY).emit('playerConnection', currentPlayer);
        // lister membre du lobby
    }

    joinRoom = (socket, room) => {
        socket.emit('joinRoom', room); // client must ask game serv room
        socket.leave(LOBBY);
        this.players = this.players.filter(player => player.id != socket.id);

    }
    
    addRoom = (socket, room) => {
            rooms.push(room);
            socket.emit('updaterooms', rooms, socket.room);
    }

    getRooms = (socket) => {
        socket.emit('rooms', { listRoom : this.rooms });
    }
}

module.exports = Lobby;