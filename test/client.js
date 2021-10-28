const io = require("socket.io-client");
require('log-timestamp');

let serverPort = 3000;
var p_port = process.argv[2];
if (p_port) {
	serverPort = p_port;
}
const socket1 = io('http://localhost:' + serverPort);
const socket2 = io('http://localhost:' + serverPort);
console.log('Started on port '+ serverPort);

let cardsSocket1, cardsSocket2;

socket1.on('connect', () => {
    console.log('P1: connected');
    socket1.emit('register','Player1');

    socket1.on('playerConnection', (player) => {
        console.log(`P1: playerConnection: ${player.id}`)

        setTimeout(()=> {
            socket1.emit('startGame');
        },2000);        
    });

    socket1.on('sendCard', (cards) => {
        console.log('P1: sendCard');
        cardsSocket1 = cards.hand;
    });

    socket1.on('token', (data) => {
        if (data.token === socket1.id) {
            console.log(`P1: emit reveal card ${cardsSocket2[0].id}`);
            socket1.emit('revealCard', cardsSocket2[0].id);
        }
    });

    socket1.on('roomList', (data) => {
        console.log(`P1: RoomList ${JSON.stringify(Object.keys(data))}`);
        socket1.emit('joinRoom', data[Object.keys(data)[0]].id);
    });

    socket1.on('roomDetail', (data)=> {
        console.log(data);
        console.log(JSON.stringify(data));
    })
});

socket2.on('connect', () => {
    console.log('P2: connected');
    socket2.emit('register','Player2');

    socket2.on('playerConnection', (player) => {
        console.log(`P2: playerConnection: ${player.id}`)
    });

    socket2.on('connectionEstabilished',({id})=> {
        console.log('P2: connectionEstabilished'+id);
    });

    socket2.on('sendCard', (cards) => {
        console.log('P2: sendCard');
        cardsSocket2 = cards.hand;
    });

    socket2.on('token', (data) => {
        if (data.token === socket2.id) {
            console.log(`P2: emit reveal card ${cardsSocket1[0].id}`);
            socket2.emit('revealCard', cardsSocket1[0].id);
        }
    })

    socket2.on('roomList', (data) => {
        console.log(`P2: RoomList ${JSON.stringify(data)}`);
    })
})
