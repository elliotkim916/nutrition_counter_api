'use strict';

const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const {User} = require('../users/models');
const {JWT_SECRET} = require('../config');

// the strategy retrieves the username & password from the req.body & passes them to a callback function
// we create a callback function that checks the credentials against the values stored in the DB
const localStrategy = new LocalStrategy((username, password, callback) => {
  let user;
  User.findOne({username: username})
    .then(_user => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return callback(null, user);
      // accepts 3 parameters
      // if no error, 1st parameter is null & 2nd parameter is the user
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return callback(err, false, err.message);
      }
      // if error, 1st parameter is the err & 2nd parameter is false
      return callback(err, false);
    });
});

const jwtStrategy = new JwtStrategy({
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  algorithms: ['HS256']
}, 
(payload, done) => {
  done(null, payload.user);
});

module.exports = {localStrategy, jwtStrategy};