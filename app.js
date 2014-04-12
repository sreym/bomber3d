var express = require('express')
    , http = require('http')
    , path = require('path')
    , orm = require('orm')
    , connect_mysql = require('connect-mysql')(express)
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , flash = require("connect-flash")
    , socket_io = require('socket.io')

var app = express();
var server = http.createServer(app)
var io = socket_io.listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.cookieParser());
app.use(express.session({
    secret: 'sdlfjzzxcahsdflahsdkryahzkhd',
    store: new connect_mysql({ config: {
        user: 'root',
        password: 'root',
        database: 'bomber'
    }})
}));
app.use(flash());
app.use(orm.express("mysql://root:root@localhost/bomber", {
    define: function (db, models, next) {
        db.settings.set('instance.cache', false);

        models.User = db.define('user', {
            username: String,
            password: String
        }, {
            methods: {
                validPassword: function(password) {
                    return this.password == password;
                }
            }
        });

        models.User.sync();


        passport.use(new LocalStrategy(
            function(username, password, done) {
                models.User.find({ username: username }, function (err, user) {
                    if (err) { return done(err); }
                    if (!user[0]) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    if (!user[0].validPassword(password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, user[0]);
                });
            }
        ));

        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
            models.User.get(id, function (err, user) {
                done(err, user);
            });
        });

        next();
    }
}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/', function(req, res) {
    if (req.user) {
        res.render('index');
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
})

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
