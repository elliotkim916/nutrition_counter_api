'use strict';

const express = require('express');
const router = express.Router();

const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('../config');

const createAuthToken = function(user) {
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

router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.seralize());
  res.json({authToken});
});

