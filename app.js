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
    if (req.user) {
        //res.render('index');
        res.redirect('/game/1');
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

app.get('/game/:id', function(req,res) {
    res.render('game', {room: req.params.id})
});

require('./gamesockets.js')(app, server, session_store);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
