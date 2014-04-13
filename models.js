var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
    return function(db, models, next) {
        db.settings.set('instance.cache', false);

        module.exports.fillModels(db, models);

        models.User.sync();


        if (passport) {
            passport.use(new LocalStrategy(
                function (username, password, done) {
                    models.User.find({ username: username }, function (err, user) {
                        if (err) {
                            return done(err);
                        }
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

            passport.serializeUser(function (user, done) {
                done(null, user.id);
            });

            passport.deserializeUser(function (id, done) {
                models.User.get(id, function (err, user) {
                    done(err, user);
                });
            });
        }

        if (typeof next === "function") next();
    }
}

module.exports.fillModels = function(db, models) {
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
}