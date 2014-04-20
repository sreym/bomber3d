var socket_io = require('socket.io')
    , cookie = require("cookie")
    , connect = require("connect")
    , orm = require('orm')

var Game = require('./public/js/class/Game.js');

module.exports = function(app, server, session_store) {
    var io = socket_io.listen(server);
    io.set('log level', 1);
    var models = {};
    var rooms = [];

    orm.connect("mysql://" + app.get('dbuser') + ":" + app.get('dbpassword') + "@" + app.get('dbhost') + "/" + app.get('dbname'), function (err, db) {
        require('./models.js').fillModels(db, models);

        io.set('authorization', function (handshakeData, accept) {
            if (handshakeData.headers.cookie) {
                handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
                handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], app.get('cookie_secret'));
                if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
                    return accept('Cookie is invalid.', false);
                }
            } else {
                return accept('No cookie transmitted.', false);
            }
            accept(null, true);
        });

        io.sockets.on('connection', function (socket) {
            var game;
            session_store.get(socket.handshake.sessionID, function (err, sessionData) {
                models.User.get(sessionData.passport.user, function(err, user) {
                    models.Room.get(sessionData.roomNumber, function (err, room) {

                        setTimeout(function() {
                            if (rooms[room.id]) {
                                game = rooms[room.id];
                            } else {
                                game = new Game();
                                rooms[room.id] = game;
                            }

                            if (game.world.players.filter(function(player) {return player.name == user.username;}).length == 0) {
                                game.addPlayer(user.username);
                            }

                            game.playerName = user.username;

                            socket.emit('init game', game);
                        }, 500);

                        socket.on('keys refresh', function (data) {
                            game.world.players[data.playerNum].moveByKeys(data.keys, game);
                            socket.emit('update world', game.world);


                            /*session_store.get(socket.handshake.sessionID, function(err, data) {
                             console.log(data.roomNumber)
                             });*/
                        });
                    });
                });
            });
        });
    });
}