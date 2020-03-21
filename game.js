var GameType = require('./gametype');

class Game {
    constructor() {
    }

    initGame() {
        console.log("Creating Game ...")

        var gameTypeAvailable = new Map();
        gameTypeAvailable.set(4, new GameType(15,4,1,3,1));
        gameTypeAvailable.set(5, new GameType(19,5,1,3,2));
        gameTypeAvailable.set(6, new GameType(23,6,1,4,2));
        gameTypeAvailable.set(7, new GameType(27,7,1,5,2));
        gameTypeAvailable.set(8, new GameType(31,8,1,5,3));

        return gameTypeAvailable;
    }

    startGame(sockets, players) {
        for(let id in sockets) {                
            sockets[id].emit('playerConnection test'); // envoi la liste des autres utilisateurs
        }
    // nbPlayer = io.engine.clientsCount;
    // // gameType = gameTypeAvailable.get(4);     // utilise type de partie selon nb joueurs
    // console.log("Starting game with ", gameType);
    // currentTurn = 4;
    // cardRevealedThisTurn = 0;

    // initDeck();
    // updateDeck();
    // initRoles();
    // distributeRoles();
    // distributeCards( );
}
    addPlayer(player) {

    }
}
module.exports = Game;
