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
        $("#enterUsername").click(function () {

            userName = $('#inputUserName').val();
            console.log(userName);
            $("#showUserName").html("Hello " + userName);
            $('#myModal').modal('hide');
            startCommunication();
        });

    });

    $('#myModal').on('shown.bs.modal', function () {
        $('#inputUserName').focus();
    });

    $('#selectPlayerButton').click(function () {
        var oppositePlayer = get_opposite_player();
        socket.emit('contact_user', {
            "from": userName,
            "to": oppositePlayer
        });

    });


    $('#exit').click(function () {
        $('#tic-tac-toe').hide();
        // trebuie sa adaug si chestiile legate socket-uri
    });


    function get_opposite_player() {
        var room = $('select[name=selector]').val();
        console.log("Player selected", room);
        return room;
    }


    function startCommunication() {

        socket = io.connect("http://localhost:3000");
        socket.emit('add_user', userName);

        socket.on('log_in', function (data) {
            console.log('log_in');
            $("#numberOfUsers").html("Number of users:" + data.numberOfUsers);
            console.log("Users:", data.onlineUsers);
            $('#selector')
                .find('option')
                .remove()
                .end();
            var onlineUsers = data.onlineUsers;
            for (let user of onlineUsers) {
                if (user !== userName) {
                    $('#selector').append($('<option>', {
                        value: user,
                        text: user
                    }));
                }
            }

        });

        socket.on("user_joined", function (data) {
            console.log("User_joined");
            $("#numberOfUsers").html("Number of users:" + data.numberOfUsers);
            var newUser = data.username;
            $('#selector').append($('<option>', {
                value: newUser,
                text: newUser
            }));
            console.log(data);
        });

        socket.on('user_left', function (data) {
            console.log('user_left');

        });

        socket.on('invitation', function (data) {
            var oppositePlayer = data.from;
            console.log("Invitation received from:", oppositePlayer);

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
        });

        //Configure the first player, the one who send the invitation
        socket.on('invitation_answer', function (data) {
            console.log("[Invitation Answer] Received answer:", data);
            if (data.answer) {
                startGame(data.from);
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
            }


        });

        //configure the second player( the one who received the invitation)
        socket.on('start_game', function (data) {
            console.log('start_game', data);
            yourTurn = false;
            socket.emit('entered_into_game', {
                "from": userName
            });
            piece = "X";
            $('#tic-tac-toe').show();
            $("#opponentScoreLabel").html(data.from);
            $('#yourScoreLabel').html(userName);
            $('#turnStatus').html("Your turn:" + yourTurn);
            $('#typeOfPiece').html("You are with:" + piece);
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


        socket.on('end_game', function (data) {
            var score;
            gameEnded = true;
            if (data.win === true) {
                score = parseInt($('#you_win').text());
                score++;
                $("#you_win").text(score);
                alert('You won');
            } else {
                yourTurn = true;
                $('#' + data.move).text(data.piece);
                $('#' + data.move).addClass("disable x btn-info");
                $('#turnStatus').html("Your turn:" + yourTurn);
                score = parseInt($('#opponent_win').text());
                score++;
                $("#opponent_win").text(score);
                alert("Sorry :((( You lost");
            }
        });

        socket.on('restart_game', function () {
            console.log('[Restart Game]');
            restoreTable();
        });

        function startGame(opponent) {
            $('#tic-tac-toe').show();
            $("#yourScoreLabel").html(userName);
            $('#opponentScoreLabel').html(opponent);
            piece = "O";
            yourTurn = true;
            $('#turnStatus').html("Your turn:" + yourTurn)
            $('#typeOfPiece').html("You are with:" + piece);
        }


        function test() {
            // JavaScript Document
            $(document).ready(function () {
                var x = "x"
                var o = "o"
                var count = 0;
                var o_win = 0;
                var x_win = 0;
                $('#game li').click(function () {

                    if ($("#one").hasClass('o') && $("#two").hasClass('o') && $("#three").hasClass('o') || $("#four").hasClass('o') && $("#five").hasClass('o') && $("#six").hasClass('o') || $("#seven").hasClass('o') && $("#eight").hasClass('o') && $("#nine").hasClass('o') || $("#one").hasClass('o') && $("#four").hasClass('o') && $("#seven").hasClass('o') || $("#two").hasClass('o') && $("#five").hasClass('o') && $("#eight").hasClass('o') || $("#three").hasClass('o') && $("#six").hasClass('o') && $("#nine").hasClass('o') || $("#one").hasClass('o') && $("#five").hasClass('o') && $("#nine").hasClass('o') || $("#three").hasClass('o') && $("#five").hasClass('o') && $("#seven").hasClass('o')) {
                        alert('O has won the game. Start a new game')
                        $("#game li").text("+");
                        $("#game li").removeClass('disable')
                        $("#game li").removeClass('o')
                        $("#game li").removeClass('x')
                        $("#game li").removeClass('btn-primary')
                        $("#game li").removeClass('btn-info')
                    } else if ($("#one").hasClass('x') && $("#two").hasClass('x') && $("#three").hasClass('x') || $("#four").hasClass('x') && $("#five").hasClass('x') && $("#six").hasClass('x') || $("#seven").hasClass('x') && $("#eight").hasClass('x') && $("#nine").hasClass('x') || $("#one").hasClass('x') && $("#four").hasClass('x') && $("#seven").hasClass('x') || $("#two").hasClass('x') && $("#five").hasClass('x') && $("#eight").hasClass('x') || $("#three").hasClass('x') && $("#six").hasClass('x') && $("#nine").hasClass('x') || $("#one").hasClass('x') && $("#five").hasClass('x') && $("#nine").hasClass('x') || $("#three").hasClass('x') && $("#five").hasClass('x') && $("#seven").hasClass('x')) {
                        alert('X wins has won the game. Start a new game')
                        $("#game li").text("+");
                        $("#game li").removeClass('disable')
                        $("#game li").removeClass('o')
                        $("#game li").removeClass('x')
                        $("#game li").removeClass('btn-primary')
                        $("#game li").removeClass('btn-info')
                    } else if (count == 9) {
                        alert('Its a tie. It will restart.')
                        $("#game li").text("+");
                        $("#game li").removeClass('disable')
                        $("#game li").removeClass('o')
                        $("#game li").removeClass('x')
                        $("#game li").removeClass('btn-primary')
                        $("#game li").removeClass('btn-info')
                        count = 0
                    } else if ($(this).hasClass('disable')) {
                        alert('Already selected')
                    } else if (count % 2 == 0) {
                        count++
                        $(this).text(o)
                        $(this).addClass('disable o btn-primary')
                        if ($("#one").hasClass('o') && $("#two").hasClass('o') && $("#three").hasClass('o') || $("#four").hasClass('o') && $("#five").hasClass('o') && $("#six").hasClass('o') || $("#seven").hasClass('o') && $("#eight").hasClass('o') && $("#nine").hasClass('o') || $("#one").hasClass('o') && $("#four").hasClass('o') && $("#seven").hasClass('o') || $("#two").hasClass('o') && $("#five").hasClass('o') && $("#eight").hasClass('o') || $("#three").hasClass('o') && $("#six").hasClass('o') && $("#nine").hasClass('o') || $("#one").hasClass('o') && $("#five").hasClass('o') && $("#nine").hasClass('o') || $("#three").hasClass('o') && $("#five").hasClass('o') && $("#seven").hasClass('o')) {
                            alert('O wins')
                            count = 0
                            o_win++
                            $('#o_win').text(o_win)
                        }
                    } else {
                        count++
                        $(this).text(x)
                        $(this).addClass('disable x btn-info')
                        if ($("#one").hasClass('x') && $("#two").hasClass('x') && $("#three").hasClass('x') || $("#four").hasClass('x') && $("#five").hasClass('x') && $("#six").hasClass('x') || $("#seven").hasClass('x') && $("#eight").hasClass('x') && $("#nine").hasClass('x') || $("#one").hasClass('x') && $("#four").hasClass('x') && $("#seven").hasClass('x') || $("#two").hasClass('x') && $("#five").hasClass('x') && $("#eight").hasClass('x') || $("#three").hasClass('x') && $("#six").hasClass('x') && $("#nine").hasClass('x') || $("#one").hasClass('x') && $("#five").hasClass('x') && $("#nine").hasClass('x') || $("#three").hasClass('x') && $("#five").hasClass('x') && $("#seven").hasClass('x')) {
                            alert('X wins')
                            count = 0
                            x_win++
                            $('#x_win').text(x_win)
                        }
                    }

                });
                $("#reset").click(function () {
                    $("#game li").text("+");
                    $("#game li").removeClass('disable')
                    $("#game li").removeClass('o')
                    $("#game li").removeClass('x')
                    $("#game li").removeClass('btn-primary')
                    $("#game li").removeClass('btn-info')
                    count = 0

                });
            });


        }

    }


    $('#game li').click(function () {
        console.log("Initial piece value:", $(this).text());
        if (yourTurn && $(this).text() === "+") {
            console.log("Clicked a tile");
            console.log(this);
            $(this).text(piece);
            $(this).addClass("disable x btn-info");
            yourTurn = false;
            $('#turnStatus').html("Your turn:" + yourTurn)
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
    }

});