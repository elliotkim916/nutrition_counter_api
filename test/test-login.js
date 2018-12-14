'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const mongoose = require('mongoose');
const {User} = require('../users/models');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const testCredentials = {
  'username': 'testUsername',
  'password': 'testPassword'
};

function teardownDb() {
  return mongoose.connection.dropDatabase();
}

describe('Create account, login, & refresh jwt', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return User.create(testCredentials);
  });

  afterEach(function() {
    return teardownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('POST request to register a new user', function() {
    it('should create a new account', function() {
      chai.request(app)
        .post('/api/users')
        .send(testCredentials)
        .then(res => {
          expect(res).to.be.status(201);
          expect(res.body.state).to.be.true;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('username', 'password');
        });
    });
  });

  let authToken;
  describe('POST to request a JWT', function() {
    it('should give a token in exchange for valid username & password', function() {
      chai.request(app)
        .post('/api/auth/login')
        .send(testCredentials)
        .then(res => {
          expect(res).to.be.status(200);
          expect(res.body.state).to.be.true;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('username', 'password');
          expect(res.body).to.have.property('authToken');
          authToken = res.body.authToken;
        });
    });
  });

  describe('GET to request for a protected API endpoint', function() {
    it('should allow user to make requests to API', function() {
      chai.request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${authToken}`)
        .then(res => {
          expect(res).to.be.status(200);
          expect(res.body.state).to.be.true;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('username', 'password');
        });
    });
  });

  describe('POST to request a new JWT with a later expiry date', function() {
    it('should provide a new JWT', function() {
      chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .then(res => {
          expect(res).to.be.status(200);
          expect(res.body.state).to.be.true;
          expect(res.body).to.have.property('authToken');
        });
    });
  });
});