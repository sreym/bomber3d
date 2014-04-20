var express = require('express')
    , http = require('http')
    , path = require('path')
    , orm = require('orm')
    , connect_mysql = require('connect-mysql')(express)
    , passport = require('passport')
    , flash = require("connect-flash")


var app = express();
var server = http.createServer(app)
var session_store;

app.set('env', 'development');
app.set('cookie_secret', 'sdlfjzzxcahsdflahsdkryahzkhd')
app.set('dbuser', 'root')
app.set('dbpassword', 'root')
app.set('dbhost', 'localhost')
app.set('dbname', 'bomber')

app.configure(function() {
    session_store = new connect_mysql({ config: {
        user: app.get('dbuser'),
        password: app.get('dbpassword'),
        database: app.get('dbname')
    }});

    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.cookieParser());
    app.use(express.session({
        secret: app.get('cookie_secret'),
        key: 'express.sid',
        store: session_store
    }));
    app.use(flash());
    app.use(orm.express("mysql://" + app.get('dbuser') + ":" + app.get('dbpassword') + "@" + app.get('dbhost') + "/" + app.get('dbname'), {
        define: require('./models.js')(passport)
    }));
    app.use(express.favicon());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});


// development only
app.configure('development', function() {
    app.use(express.errorHandler());
    app.use(express.logger('dev'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/', function(req, res) {
    console.log(req.user)
    if (req.user) {
        req.models.Room.find({}, "created_at", function(err, rooms) {
            res.render('index', {rooms: rooms, user: req.user});
        });
    } else {
        res.render('login');
    }
});

var isRoomNameCorrect = function(models, roomName, thenDone, elseDone) {
    if (roomName && roomName.trim && roomName.trim() != "") {
        models.Room.find({name : roomName}, function(err, rooms) {
            if (err) {
                console.error(err);
                elseDone();
            } else {
                if (rooms.length == 0) {
                    thenDone();
                } else {
                    elseDone();
                }
            }
        });
    } else {
        elseDone();
    }
};

app.post('/', function(req, res) {
    if (req.user) {
        isRoomNameCorrect(req.models, req.body.roomName, function() {
            req.models.Room.create([{
                name: req.body.roomName,
                isOpened: true
            }], function(err, items) {
                if (err) {
                    console.error(err);
                } else {
                    res.redirect('/');
                }
            });
        }, function() {
            console.log("Wrong room name: " + req.body.roomName);
            req.models.Room.find({}, ["created_at","Z"], function(err, rooms) {
                res.render('index', {rooms: rooms, user: req.user, error: req.flash('error')});
            });
        });
    } else {
        res.render('login');
    }
});

app.get('/login', function(req, res) {
    res.render('login', {error: req.flash('error')});
});

app.get('/register', function(req, res) {
    res.render('register', {error: req.flash('error')});
});

app.post('/register', function(req,res) {
    if (req.body.password == req.body.passwordagain) {
        req.models.User.create(
            [{username: req.body.username, password: req.body.password}],
            function (err, items) {
                if (err) {
                    console.error(err);
                } else {
                    req.login(items[0], function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect('/');
                        }
                    });
                }
            }
        );

    } else {
        req.flash('error', 'Passwords are not equal.');
        res.redirect('/register');
    }
});

app.get('/room/:id', function(req,res) {
    req.session.roomNumber = req.params.id;
    req.models.Room.get(req.params.id, function(err, room) {
        room.getPlayers(function(err, players) {
            var userIsInRoom = (players.filter(function(player) {return player.id == req.user.id;}).length != 0);
            if (players.length >= 4 && !userIsInRoom) {
                req.flash('error', 'Room is full.');
                res.redirect("/");
            } else {
                if (!userIsInRoom) {
                    room.addPlayers([req.user], function(err) {if (err) console.error(err);});
                }
                res.render('room', {room: room})
            }
        });
    });

});

require('./roomsockets.js')(app, server, session_store);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
