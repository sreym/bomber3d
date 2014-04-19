var socket_io = require('socket.io')
    , cookie = require("cookie")
    , connect = require("connect")
    , orm = require('orm')

var Game = require('./public/js/class/Game.js');

module.exports = function(app, server, session_store) {
    var io = socket_io.listen(server);
    var models = {};

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

    orm.connect("mysql://" + app.get('dbuser') + ":" + app.get('dbpassword') + "@" + app.get('dbhost') + "/" + app.get('dbname'), function (err, db) {
        require('./models.js').fillModels(db, models);
    });

    io.sockets.on('connection', function (socket) {
        var game = new Game();

        socket.emit('init game', game);

        /*session_store.get(socket.handshake.sessionID, function(err, data) {
            models.User.get(data.passport.user, function(err, user) {
                console.log(user);
            });
        });*/

        socket.on('keys refresh', function (data) {
            game.player.moveByKeys(data, game);
            socket.emit('update world', game.world);

            session_store.get(socket.handshake.sessionID, function(err, data) {
                console.log(data.roomNumber)
            });
        });
    });
}