var server = require('http').createServer();
var io = require('socket.io')(server);
var Connection = require('./modeles/connection');

const LOBBY = "lobby";
var rooms = [LOBBY];
var connectionsList = [];

// This defines the port that we'll be listening to
server.listen(3000);
console.log ('Server Started');

// "Listens" for client connections
io.sockets.on('connection', function(socket)
{
	console.log('User : ' + socket.id, " connected to the lobby.");
	socket.emit('connectionEstabilished', { id: socket.id }); // retourn l'id de cette session
    socket.emit('rooms', { listRoom : rooms }); //TODO 

    socket.join(LOBBY);
    io.to(LOBBY).emit('connectToLobby', "Welcome in the lobby");// Joueur X connected to Room X

    socket.on('register', (data) => {
        console.log('User logged: ' + socket.id);
        console.log('User Room: ' + data.roomName);
        console.log('Player Name :', data.playerName);

        rooms.indexOf(data.roomName) === -1 ? rooms.push(data.roomName) : console.log("This room already exists");
        connectionsList.push(new Connection(socket, data.playerName, data.roomName));

        console.log('Votre joueur a quitté le lobby et à join la room : ', data.roomName);
        socket.leave(LOBBY);
        socket.join(data.roomName);

        socket.broadcast.to(data.roomName).emit('playerConnection', data.playerName);
        for(let id in connectionsList) { 
            if (connectionsList[id].player.room === data.roomName &&
                connectionsList[id].socket.id != socket.id) {            
                socket.emit('playerConnection', connectionsList[id].player.name); // envoi la liste des autres utilisateurs
            }
        }
    });

    socket.on('startGame', function (data) {
        // if (listGame[roomName]) {
        //     console.log(game already start)
        // }
        // else {
        // listGame[roomName] = new Game(joueurs, roomName);
        //io.sockets.emit(GAME STARTED);
        // }
    });

    // disconnect

    // log


});

	joinLobby(socket) {
		socket.join(LOBBY);
		io.to(LOBBY).emit('connectToLobby', "Welcome in the lobby");// Joueur X connected to Room X
	}
	
	