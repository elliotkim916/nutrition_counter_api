'use strict';

require('dotenv').config();
// for env files
// takes env file & pushes into process.env

const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // use built in ES6 promises
const passport = require('passport');

const {router: usersRouter} = require('./users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const exerciseRouter = require('./routes/exercise.js');
const nutritionRouter = require('./routes/nutrition.js');

const {CLIENT_ORIGIN, PORT, DATABASE_URL} = require('./config');
const cors = require('cors');

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// to register our strategies with passport
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/exercise', exerciseRouter);
app.use('/api/nutrition', nutritionRouter);

let server;

function runServer (databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    return mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer () {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if script is run directly, then runServer function will be called
// but if the file is included from somewhere else, then the function wont be called
// allowing the server to be started at a different point (such as for testing)
if (require.main === module) {
  // if I run from command line node server.js, line 68 is read
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};