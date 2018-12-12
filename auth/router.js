'use strict';

const express = require('express');
const router = express.Router();

const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('../config');

const createAuthToken = function(user) {
  // we place user in an object just in case if its not an object
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false}); 
// returns a middleware function
// store a reference to the middleware function as a variable and pass it as a argument to the post endpoint
// session is set to false to stop Passport from adding session cookies which identify the user to the response
// instead of using cookies to authenticate, user supplies their JWT in request header
router.use(bodyParser.json());
// need to be able to accept json data, checking/enforcing that its json data

router.post('/login', localAuth, (req, res) => {
  // req.user is coming from database, needs to be serialized, gets saved into the token
  const authToken = createAuthToken(req.user.serialize());
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});
router.post('/refresh', jwtAuth, (req, res) => {
  // user inside the token thats already been serialized, doesnt need .serialize()
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = {router};