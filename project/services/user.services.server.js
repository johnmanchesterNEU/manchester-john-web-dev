var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bcrypt = require("bcrypt-nodejs");
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
//var GoogleStrategy = require('passport-google-oauth20').Strategy;
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FlickrStrategy = require('passport-flickr').Strategy;
//var session = require('express-session');
//app.use(passport.initialize());
//var GoogleStrategy2 = require('passport-google').Strategy;


//var GoogleStrategy2 = require('passport-google-oauth').OAuth2Strategy;

// maps api key AIzaSyCBKNUZMB4rHw4NOz2-3XyV_6MkWnfZHBQ

module.exports = function (app, models) {
    var userModel = models.userModel;


    var localConfig = {
        userNameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    }

// process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup' // redirect back to the signup page if there is an error
    }));


  




    app.post('/project/register', register);


    function register(req, res) {
        console.log(req.body);


        req.body.password = bcrypt.hashSync(req.body.password);
        var user = {"local" : req.body};
        console.log(user);

        userModel.register(user).then(
            function (newUser) {
                req.login(newUser, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(newUser);
                    }
                })
            },
            function (error) {
                res.status(400).send("Can register user");
            })

    }


    var googleConfig = {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    };

    app.get('/project/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
    app.get('/project/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        }));


    //flickr configuration
    var flickrConfig = {
        consumerKey: process.env.FLICKR_CONSUMER_KEY,
        consumerSecret: process.env.FLICKR_CONSUMER_SECRET,
        callbackURL: process.env.FLICKR_CALLBACK_URL,
        passReqToCallback: true
    }


    var facebookConfig = {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOKP_CALLBACK_URL
    }

    passport.use('facebook', new FacebookStrategy(facebookConfig, facebookLogin));

    app.get("/project/auth/facebook", passport.authenticate('facebook'));
    app.get("/project/auth/facebook/callback", passport.authenticate('facebook', {
        successRedirect: '/project/#/profile',
        failureRedirect: '/project/#/login'
    }));


    passport.use(new GoogleStrategy(googleConfig, googleStrategy));


    function facebookLogin(token, refreshToken, profile, done) {
        console.log(profile);
        userModel
            .findFacebookUser(profile.id)
            .then(
                function (facebookUser) {
                    if (facebookUser) {
                        return done(null, facebookUser);
                    } else {
                        facebookUser = {
                            username: profile.displayName.replace(/ /g, ''),
                            facebook: {
                                token: token,
                                id: profile.id,
                                displayName: profile.displayName
                            }
                        };
                        userModel
                            .createUser(facebookUser)
                            .then(
                                function (user) {
                                    done(null, user);
                                }
                            );
                    }
                }
            );
    }


    function googleStrategy(request, token, refreshToken, profile, done) {
        //console.log(request);
        //console.log(profile);
        // if the user is not already logged in
        if (!request.user) {
            userModel
                .findUserByGoogleId(profile.id)
                .then(function (googleUser) {
                        if (googleUser) {
                            console.log("found google");
                            return done(null, googleUser);
                        } else {
                            console.log("no google");
                            // grab the json object for easy parsing
                            var pro = profile._json;

                            googleUser = {
                                google: {
                                    token: token,
                                    id: profile.id,
                                    email: profile.emails[0].value
                                }
                            }

                            if (!googleUser.local) {
                                googleUser.local = {
                                    username: profile.emails[0].value,
                                    firstName: pro.name.givenName,
                                    lastName: pro.name.familyName,
                                    email: profile.emails[0].value
                                }
                            }

                            userModel
                                .updateGoogle(googleUser)
                                .then(function (user) {
                                        return done(null, user);
                                    },
                                    function (error) {
                                        return done(error);
                                    })

                        }
                    },
                    function (error) {
                        return done(error);
                    })
        } else {
            // user already exists and is logged in
            var user = request.user;

            user.google.id = profile.id;
            user.google.token = token;
            user.google.email = profile.emails[0].value;

            userModel
                .updateGoogle(user)
                .then(function (user) {
                    return done(null, user);
                }, function (error) {
                    return done(error, user);
                })
        }


        //var pro = profile._json;

        //  console.log(profile.id);
        // console.log(pro.id);
        // console.log(pro.name.givenName);
        // console.log(pro.name.familyName);
        // console.log(pro.gender);
        // console.log(profile.emails[0].value);


        //return done(null, profile);
    }


    /*  app.get('/project/auth/flickr/',
     passport.authenticate('flickr'));*/

    app.get("/project/auth/flickr/username/:uid/password/:pid", function (req, res, next) {

        // console.log(req.params.uid);
        // console.log(req.params.pid);

        var state = {
            username: req.params.uid,
            password: req.params.pid
        }

        req.session.state = state;
        // in Oauth2, its more like : args.scope = reqId, and args as authenticate() second params
        passport.authenticate('flickr')(req, res, next);
    }, function () {
    });


    app.get('/project/auth/flickr/callback/',
        passport.authenticate('flickr', {
            successRedirect: '/project/#/profile',
            failureRedirect: '/project/#/login'
        }));


    // If we are already logged in and not connected to flickr
    app.get('/project/connect/flickr', passport.authorize('flickr'));
    app.get('/project/connect/flickr/callback',
        passport.authorize('flickr', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    passport.use(new FlickrStrategy(flickrConfig, FlickrLogin));
    function FlickrLogin(req, token, tokenSecret, profile, done) {
        //console.log(req);

        // var flickrUser = new userModel();


        var fullName = profile.fullName.split(" ");
        var newUser = {
            "local": {
                "username": req.session.state.username,
                "password": bcrypt.hashSync(req.session.state.password),
                "firstName": fullName[0],
                "lastName": fullName[1]
            },
            "flickr": {
                "id": profile.id,
                "token": token,
                "displayName": profile.displayName
            }
        };


        userModel.saveFlickr(newUser).then(
            function (flickrUser) {
                console.log("saved: " + flickrUser);
                return done(null, flickrUser);
            }, function (error) {
                console.log(error);
                //You can not override another user name
                return done(error);
            });
        ///console.log(flickrUser);
    }

    //To test if your username exists
    app.get("/unique/:user", findUniqueUsername);


    function findUniqueUsername(req, res) {
        var username = req.params.user;  //req.query['username'];
        // console.log("hey " + username);
        // console.log(username);
        userModel
            .findUserByUsername(username)
            .then(
                function (user) {
                    if (user === null) {
                        console.log("unique");
                        return res.send(true);
                    } else {
                        console.log("not");
                        return res.send(false);
                    }

                    //   console.log("wassup");
                    //console.log(user);
                    //return res.json(user);
                },
                function (err) {
                    console.log(err);
                    return res.send(false);
                }
            )
    }


    function serializeUser(user, done) {
        console.log("serialize: " + user);
        done(null, user);
    }

    function deserializeUser(user, done) {
        console.log("deserialize: " + user);
        userModel
            .findUserById(user._id)
            .then(
                function (user) {
                    done(null, user);
                },
                function (err) {
                    done(err, null);
                }
            );
    }


    function authenticate(req, res, next) {
        console.log(req.user);
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            next();
        } else {
            res.send(403);
        }
    }



    function logout(req, res) {
        req.logout();
        res.send(200);
    }

    function loggedin(req, res) {
        if(req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.send('0');
        }
    }

};


