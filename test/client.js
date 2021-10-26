const io = require("socket.io-client");

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
    console.log('P1 connected');
    socket1.emit('register','Player1');

    socket1.on('playerConnection', (player) => {
        console.log(`P1: playerConnection: ${player.id}`)

        setTimeout(()=> {
            //ask P1 to start
            socket1.emit('startGame');
        },2000);        
    });

    socket1.on('sendCard', (cards) => {
        console.log('sendCard J1');
        cardsSocket1 = cards.hand;
    });

    socket1.on('token', (data) => {
        if (data.token == socket1.id) {
            console.log("joueur "+socket1.id+" demande carte "+cardsSocket2[0].id);
            socket1.emit('revealCard', cardsSocket2[0].id);
        }
    });
});

socket2.on('connect', () => {
    console.log('P2 connected');
    socket2.emit('register','Player2');
    socket2.on('userConnect', (data) => {
        console.log(`userConnect: ${data}`);
    });

    socket2.on('playerConnection', (player) => {
        console.log(`P2: playerConnection: ${player.id}`)
    });

    socket2.on('connectionEstabilished',({id})=> {
        console.log('connectionEstabilished'+id);
    });

    socket2.on('sendCard', (cards) => {
        console.log('sendCard J2');
        cardsSocket2 = cards.hand;
    });
    socket2.on('token', (data) => {
        if (data.token == socket2.id) {
            console.log("Player "+socket2.id+" demande carte "+cardsSocket1[0].id);
            socket2.emit('revealCard', cardsSocket1[0].id);
        }
    })
})
