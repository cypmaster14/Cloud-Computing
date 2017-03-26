const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;
const path = require('path');

let numberOfUsers = 0;
let onlineUsers = {};
let games = {};
let playersEnrolledInAGame = {};

app.use(express.static(path.resolve("./public")));

server.listen(PORT, function () {
    console.log(`Server waiting at: http://localhost:${PORT}`);
});

const tiles = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});


io.on('connection', function (socket) {

    //every player will be placed in a room that has his socket id
    console.log(socket.id);
    var nameOfUser = "";
    console.log("User connected");
    socket.on('add_user', function (username) {

        if (onlineUsers[username] !== undefined) {
            socket.emit('username_already_used');
        } else {

            socket.username = username;
            nameOfUser = username;
            //pentru a ii afisa celul nou conectat cati utilizatori sunt logati
            socket.emit('log_in', {
                numberOfUsers: numberOfUsers,
                onlineUsers: Object.keys(onlineUsers)
            });

            //broadcast to all other client that a person has connected
            socket.broadcast.emit("user_joined", {
                username: username,
                numberOfUsers: numberOfUsers
            });

            console.log("Adaung un user:", nameOfUser);
            onlineUsers[username] = socket.id;
            numberOfUsers++;
            console.log("Numarul de useri log_in:", numberOfUsers);
        }


    });

    socket.on('disconnect', function () {
        console.log("Client disconnected:", nameOfUser);
        delete onlineUsers[nameOfUser];
        console.log("Am eliminat user-ul", nameOfUser);

        console.log(Object.keys(onlineUsers));
        numberOfUsers--;
        console.log("Au mai ramas:", numberOfUsers, " activi");

        socket.broadcast.emit('log_in', {
            numberOfUsers: numberOfUsers - 1 >= 0 ? numberOfUsers - 1 : 0,
            onlineUsers: Object.keys(onlineUsers)
        });


    });


    socket.on('contact_user', function (data) {
        console.log(`[Contact_User] ${data}`);
        const from = data.from;
        const to = data.to;

        // .to -> specifies a room to broadcast a message
        socket.broadcast.to(onlineUsers[to]).emit('invitation', {
            "from": from,
        });

    });


    socket.on('invitation_answer', function (data) {
        console.log('[Invitation]', data);
        matrix = {};
        for (let tile of tiles) {
            matrix[tile] = "";
        }
        games[data.to] = matrix;
        console.log("All Games:", games);
        socket.broadcast.to(onlineUsers[data.to]).emit("invitation_answer", {
            "answer": data.answer,
            "from": data.from
        });
    });

    // During this event I want to remove the two players that starts a new game 
    //from the list of online users
    socket.on('entered_into_game', function (data) {
        console.log("Client entered into a game", data.from);
        playerEnteredIntoAGame(data.from);
        delete onlineUsers[data.from];

        console.log(Object.keys(onlineUsers));
        numberOfUsers--;
        console.log("Au mai ramas:", numberOfUsers, " activi");

        socket.broadcast.emit('log_in', {
            numberOfUsers: numberOfUsers - 1 >= 0 ? numberOfUsers - 1 : 0,
            onlineUsers: Object.keys(onlineUsers)
        });

    });

    function playerEnteredIntoAGame(player) {
        playersEnrolledInAGame[player] = onlineUsers[player]; //player_name => player_socket
    }

    socket.on("start_game", function (data) {
        console.log("[Start_Game]", data);
        socket.broadcast.to(onlineUsers[data.to]).emit('start_game', {
            from: data.from
        });
    });

    socket.on('change_turn', function (data) {
        console.log("[Change turn]", data);
        games[data.gameHost][data.move] = data.piece;
        //Know i have to check if it is a winner move
        const winningMove = userWon(data.piece, data.gameHost);
        if (!winningMove) {
            socket.broadcast.to(playersEnrolledInAGame[data.to]).emit('opponent_move', {
                "move": data.move,
                "piece": data.piece,
            });
        } else {

            //I send to the user who realised the last move that he won
            socket.emit('end_game', {
                'win': true
            });

            //I send to the opponent that he/she lost
            socket.broadcast.to(playersEnrolledInAGame[data.to]).emit('end_game', {
                "move": data.move,
                "piece": data.piece,
                'win': false
            });

        }

    });

    socket.on('restart_game', function (data) {
        console.log("[Restart game]", data);
        restoreTable(data.gameHost);
        socket.broadcast.to(playersEnrolledInAGame[data.to]).emit('restart_game');
    });


    socket.on('player_pressed_exit', function (data) {
        //A player pressed exit button
        //I have to remove him from the playersEnrolledInAGame
        //I have to add him to online players
        //Delete the games from the list of games ( dict games)
        //I have to tell the other player that his opponent exit the game
        onlineUsers[nameOfUser] = playersEnrolledInAGame[nameOfUser];
        delete playersEnrolledInAGame[nameOfUser];

        socket.emit('log_in', {
            numberOfUsers: numberOfUsers,
            onlineUsers: Object.keys(onlineUsers)
        });

        numberOfUsers++;

        socket.broadcast.emit('user_joined', {
            numberOfUsers: numberOfUsers,
            username: nameOfUser
        });



        delete games[data.gameHost];
        socket.broadcast.to(playersEnrolledInAGame[data.to]).emit('player_pressed_exit');

        console.log('I sent the opponent that I exit the game');

        console.log('I delete all the record of the game');

    });

    socket.on('opponent_exits', function () {
        onlineUsers[nameOfUser] = playersEnrolledInAGame[nameOfUser];
        delete playersEnrolledInAGame[nameOfUser];

        console.log('I delete the second player of the game');

        socket.emit('log_in', {
            numberOfUsers: numberOfUsers,
            onlineUsers: Object.keys(onlineUsers)
        });

        numberOfUsers++;

        socket.broadcast.emit('user_joined', {
            numberOfUsers: numberOfUsers,
            username: nameOfUser
        });


    });

});


function checkEmailAvailability(email) {
    for (let i of onlineUsers) {
        if (email === onlineUsers[i])
            return false;
    }

    return true;
}


function userWon(piece, gameHost) {
    const table = games[gameHost];
    console.log(table);
    console.log(piece);

    for (let i = 1, j = 1; i < 9 && j < 4; i += 3, j++) {
        let first = table[convertToPosition(i)];
        let second = table[convertToPosition(i + 1)];
        let third = table[convertToPosition(i + 2)];

        // check every line
        if (first === piece && second === piece && third === piece) {
            return true;
        }

        first = table[convertToPosition(j)];
        second = table[convertToPosition(j + 3)];
        third = table[convertToPosition(j + 6)];

        //Check every column
        if (first === piece && second === piece && third === piece) {
            return true;
        }
    }

    //Know we check the two diagonals

    let first = table[convertToPosition(1)];
    let second = table[convertToPosition(5)];
    let third = table[convertToPosition(9)];

    if (first === piece && second === piece && third === piece) {
        return true;
    }

    first = table[convertToPosition[3]];
    second = table[convertToPosition[5]];
    third = table[convertToPosition[7]];

    if (first === piece && second === piece && third === piece) {
        return true;
    }

    return false;


}

function convertToPosition(position) {
    switch (position) {
        case 1:
            return "one";
        case 2:
            return "two";
        case 3:
            return "three";
        case 4:
            return "four";
        case 5:
            return "five";
        case 6:
            return "six";
        case 7:
            return "seven";
        case 8:
            return "eight";
        case 9:
            return "nine";
    }
}

function restoreTable(gameHost) {
    for (let tile of tiles) {
        games[gameHost][tile] = "";
    }
    console.log(games[gameHost]);
}