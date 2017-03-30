$(function () {

    var tiles = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    var socket;
    var userName;
    var onlineUsers;
    var piece;
    var yourTurn;
    var opponent;
    var gameHost;
    var gameEnded = false;

    $(document).ready(function () {
        $('#tic-tac-toe').hide();
        console.log("Ready function");
        $("#userNameButton").trigger('click');

    });

    $('#myModal').on('shown.bs.modal', function () {
        $('#inputUserName').focus();
    });


    function get_opposite_player() {
        var room = $('select[name=selector]').val();
        console.log("Player selected", room);
        return room;
    }


    function startCommunication() {

        socket = io.connect("http://localhost:3000");
        socket.emit('add_user', userName);

        socket.on('username_already_used', function () {
            var message = `${userName} is already used`;
            eModal.alert(message);
        });

        socket.on('log_in', function (data) {
            console.log('log_in');
            console.log("Users:", data.onlineUsers);
            $('#selector')
                .find('option')
                .remove()
                .end();
            var onlineUsers = data.onlineUsers;
            var numberOfUsers = 0;
            for (let user of onlineUsers) {
                if (user !== userName) {
                    $('#selector').append($('<option>', {
                        value: user,
                        text: user
                    }));
                    numberOfUsers++;
                }
            }
            $("#numberOfUsers").html("Number of users:" + numberOfUsers);
            displayPlayerInfo();
        });

        socket.on("user_joined", function (data) {
            console.log("User_joined");
            var newUser = data.username;
            $('#selector').append($('<option>', {
                value: newUser,
                text: newUser
            }));
            var numberOfUsers = $('#selector > option').length;
            console.log(numberOfUsers);
            $('#numberOfUsers').text("Number of users:" + numberOfUsers);
            console.log(data);
        });

        socket.on('user_left', function (data) {
            console.log('user_left');

        });

        socket.on('invitation', function (data) {
            var oppositePlayer = data.from;
            console.log("Invitation received from:", oppositePlayer);
            sendInvitation(oppositePlayer);

        });

        //Configure the first player, the one who send the invitation
        socket.on('invitation_answer', function (data) {
            console.log("[Invitation Answer] Received answer:", data);
            if (data.answer) {
                startGame(data.from, true, "O");
                opponent = data.from;
                gameHost = userName;

                socket.emit('entered_into_game', {
                    "from": userName
                });

                console.log("Oponent", opponent);
                socket.emit('start_game', {
                    "to": data.from,
                    "from": userName
                });
            } else {
                var message = `${data.from} refused your invitation`;
                eModal.alert(message);
            }

        });

        //configure the second player( the one who received the invitation)
        // as putea sa apelez metoda start_game deoarece am cod redundant
        socket.on('start_game', function (data) {
            console.log('start_game', data);
            socket.emit('entered_into_game', {
                "from": userName
            });

            startGame(data.from, false, "X");

            opponent = data.from;
            console.log("Oponent", opponent);
            gameHost = opponent;
        });

        socket.on('opponent_move', function (data) {
            console.log("[Opponent move]", data);
            yourTurn = true;
            $('#' + data.move).text(data.piece);
            $('#' + data.move).addClass("disable x btn-info");
            $('#turnStatus').html("Your turn:" + yourTurn);
        });

        socket.on('isATie', function (data) {
            gameEnded = true;
            yourTurn = data.yourTurn;
            $('#turnStatus').html("Your turn:" + yourTurn);
            if (data.move !== undefined) {
                $('#' + data.move).text(data.piece);
                $('#' + data.move).addClass("disable x btn-info");
            }
            console.log("Is a tie");
            eModal.alert("Is a tie");
        });


        socket.on('end_game', function (data) {
            var score;
            gameEnded = true;
            if (data.win === true) {
                score = parseInt($('#you_win').text());
                score++;
                $("#you_win").text(score);
                eModal.alert("You won");
            } else {
                yourTurn = true;
                $('#' + data.move).text(data.piece);
                $('#' + data.move).addClass("disable x btn-info");
                $('#turnStatus').html("Your turn:" + yourTurn);
                score = parseInt($('#opponent_win').text());
                score++;
                $("#opponent_win").text(score);
                eModal.alert("Sorry :((( You lost");
            }
        });

        socket.on('restart_game', function () {
            console.log('[Restart Game]');
            restoreTable();
        });


        socket.on('player_pressed_exit', function () {
            hideTicTacToeGame();
            showGameOptions();
            socket.emit('opponent_exits');
        });

        socket.on('opponent_left_game', function () {
            hideTicTacToeGame();
            showGameOptions();
            socket.emit('ack_opponent_left_game');
        });


        function displayPlayerInfo() {
            $("#showUserName").html("Hello " + userName);
            $('#myModal').modal('hide');
        }

        function startGame(opponent, turn, playerPiece) {
            yourTurn = turn;
            piece = playerPiece;
            $('#tic-tac-toe').show();
            $("#yourScoreLabel").html(userName);
            $('#opponentScoreLabel').html(opponent);
            $('#turnStatus').html("Your turn:" + yourTurn);
            $('#typeOfPiece').html("You are with:" + piece);
            $('#opponent_win').html('0');
            $('#you_win').html('0');
            $('#gameOptions').hide();
            restoreTable();
        }
    }

    $("#enterUsername").click(function () {
        userName = $('#inputUserName').val();
        console.log(userName);
        startCommunication();
    });

    $('#selectPlayerButton').click(function () {
        var oppositePlayer = get_opposite_player();
        socket.emit('contact_user', {
            "from": userName,
            "to": oppositePlayer
        });

    });

    $('#game li').click(function () {
        if (gameEnded) {
            eModal.alert("Game has ended.Reset to continue");
            return;
        }
        console.log("Initial piece value:", $(this).text());
        if (yourTurn && $(this).text() === "+") {
            console.log("Clicked a tile");
            console.log(this);
            $(this).text(piece);
            $(this).addClass("disable x btn-info");
            yourTurn = false;
            $('#turnStatus').html("Your turn:" + yourTurn);
            socket.emit('change_turn', {
                "move": event.target.id,
                "piece": piece,
                "gameHost": gameHost,
                "to": opponent
            });
        } else {
            alert("It is not your turn");
        }

    });

    $("#exit").click(function () {
        console.log("Exit button");
        playerExitTheGame();
    });

    $("#reset").click(function () {
        if (gameEnded) {
            restoreTable();
            gameEnded = false;
            socket.emit('restart_game', {
                "gameHost": gameHost,
                "to": opponent
            });
        } else {
            alert("Game is in role");
        }

    });

    function restoreTable() {
        for (let tile of tiles) {
            $('#' + tile).text('+');
            $('#' + tile).removeClass("disable x btn-info");
        }
        gameEnded = false;
    }

    function playerExitTheGame() {
        //I have to hide the game
        hideTicTacToeGame();
        showGameOptions();
        //I have to tell the other opponent that I exit the game
        socket.emit('player_pressed_exit', {
            "gameHost": gameHost,
            "to": opponent
        });
    }

    function hideTicTacToeGame() {
        $('#tic-tac-toe').hide();
        $('#turnStatus').html("");
        $('#typeOfPiece').html("");
    }

    function showGameOptions() {
        $('#gameOptions').show();
    }

    function sendInvitation(oppositePlayer) {

        bootbox.confirm({
            title: "Invitation received",
            message: `Player ${oppositePlayer} wants to play with you`,
            buttons: {
                cancel: {
                    label: '<i class="fa fa-times"></i>Cancel'
                },
                confirm: {
                    label: '<i class="fa fa-check"></i> Confirm'
                }
            },
            callback: function (result) {
                console.log("Answer:", result);
                socket.emit('invitation_answer', {
                    "from": userName,
                    "to": oppositePlayer,
                    "answer": result
                });
            }
        });
    }

});