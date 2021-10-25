const LOBBY = "lobby";
let Player = require('./player');

class Lobby {

    constructor(socketIO) {
        this.io = socketIO;
        this.rooms = ["Hanin", "Naehara", "Kzee"];
        this.clients = [];

        this.listen();
    }

    listen() {
        this.io.sockets.on('connection', (socket) => {
            socket.on('register', (data) => this.registerUser(socket, data));
            socket.on('addRoom', (room) => this.addRoom(socket, room));
            socket.on('joinRoom', (room) => this.joinRoom(socket, room));
        });
    }

    registerUser (socket, playerName) {
        console.log('registerUser' + socket.id);
        socket.join(LOBBY);

        let player = new Player();
        player.username = playerName;
        player.id = socket.id;
        player.roomId = LOBBY;
        this.clients[player.id] = player;

        this.informUsers(socket, player);
        this.getRooms(socket);
    }

    informUsers (socket, currentPlayer) {
        const other = this.io.sockets.adapter.rooms.get(currentPlayer.roomId);
        // Renvoie la liste des autres player a celui connecte
        //console.log(this.clients.filter(player => player.id != currentPlayer.id ));
        this.clients.filter(player => player.id != currentPlayer.id )
               .map(player => {
                    socket.to(LOBBY).emit('playerConnection', player);
                });

        socket.broadcast.to(LOBBY).emit('playerConnection', currentPlayer);
    }

    joinRoom (socket, room) {
        socket.emit('joinRoom', room); // client must ask game serv room
        socket.leave(LOBBY);
        this.clients = this.clients.filter(player => player.id != socket.id);
    }
    
    addRoom (socket, room) {
            rooms.push(room);
            socket.emit('updaterooms', rooms, socket.room);
    }

    getRooms (socket) {
        socket.emit('rooms', { listRoom : this.rooms });
    }
}

module.exports = Lobby;
