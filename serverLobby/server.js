var server = require('http').createServer();
var io = require('socket.io')(server);

// This defines the port that we'll be listening to
server.listen(3000);
console.log ('Server Started');

// "Listens" for client connections
io.on('connection', function(socket)
{
	console.log('User connected: ' + socket.id);
	socket.emit('connectionEstabilished', {id: socket.id}); // retourn l'id de cette session
    socket.emit('RoomList', { listRoom : listeRoom }); //TODO 
    // socket.join("lobby"); Leave Room etc 

    socket.on('register', (data) => {
        console.log('User logged: ' + socket.id);
        console.log('User Room: ' + data.roomName);
        console.log('Player Name :', data.playerName);
        
        //socket.leave lobby
        socket.join(data.roomName);

        // {
        //     playerName : 'playerName',
        //     roomName : 'RoomName'
        // }
        io.sockets.in(data.roomName).emit('connectToRoom', data.roomName);// Joueur X connected to Room X
        //TO DO 
        // for(let id in players) {
        //     if (id != socket.id) {                
        //         socket.emit('playerConnection', players[id]); // envoi la liste des autres utilisateurs
        //     }
        // }
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
