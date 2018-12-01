'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const exerciseRouter = require('./routes/exercise.js');
const nutritionRouter = require('./routes/nutrition.js');

const {PORT, DATABASE_URL} = require('./config');
//const PORT = process.env.PORT || 3000;

// app.get('/api/*', (req, res) => {
//   res.json({ok: true});
// });

//app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

app.use('/api/exercise', exerciseRouter);
app.use('/api/nutrition', nutritionRouter);

let server;

function runServer (databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    return mongoose.connect(databaseUrl, err => {
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
  return mongoose.disconnect.then(() => {
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

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => err);
}

module.exports = {app, runServer, closeServer};