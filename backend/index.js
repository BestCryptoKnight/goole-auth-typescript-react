const express = require('express');
const path = require('path');
const expressSession = require('express-session');
require('dotenv').config();

const app = express();

const port = process.env.PORT || '3000';

app.set('view engine', 'ejs');

const session = {
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: {}
}

if(app.get('env') === 'production') {
  session.cookie.secure = true;
}


app.use(expressSession(session));

app.get('/', (req, res) => {
  //res.status(200).send("Hello");
  res.render('pages/auth');
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

/* PASSPORT SETUP */

const passport = require('passport');
const { ppid } = require('process');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => {
  res.send(userProfile);
});

app.get('/error', (req, res) => {
  res.send('error logging in');
});

passport.serializeUser(function (user, cb) {
  cb(null, user);
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

/* Google AUTH */

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '637870408143-9rh4k945lfur8ptpv5q3n5h54gvfr6oh.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function (accessToken, refreshToken, profile, done) {
    userProfile = profile;
    return done(null, userProfile);
  }
));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function (req, res) {
    res.redirect('/success');
  });
