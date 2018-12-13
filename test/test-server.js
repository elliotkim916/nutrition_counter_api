'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaihttp = require('chai-http');
chai.use(chaihttp);
// const should = chai.should();
const expect = chai.expect;

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const jwt = require('jsonwebtoken');
const config = require('../config');

const {ExerciseList} = require('../models/exercise');
const testData = require('../test_db/exercise');

function teardownDb() {
  return mongoose.connection.dropDatabase();
}

const createAuthToken = user => {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const TEST_USER = {
  'username': 'exercise-test-user',
  'password': 'exercise-test-password' 
};

const TEST_TOKEN = createAuthToken(TEST_USER);

describe('Nutrition Counter Server Side API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return ExerciseList.insertMany(testData);
  });

  afterEach(function() {
    return teardownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {
    // important to note: this test and the other tests return a promise
    // when using Mocha to run async tests, we need to either pass a done callback to the it block and call done()
    // or have the test return a promise
    it('should return all of users exercise information', function() {
      let res;
      return chai.request(app)
        .get(`/api/exercise/${TEST_USER.username}`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .then(_res => {
          res = _res;
          expect(res).to.be.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          return ExerciseList.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    let resExercisePost;
    it('should return users exercise post with all of the right fields', function() {
      return chai.request(app)
        .get(`/api/exercise/${TEST_USER.username}`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(post => {
            expect(post).to.be.a('object');
            expect(post).to.include.keys('CaloriesBurned', 'MET', 'Duration', 'username');
          });

          resExercisePost = res.body[0];
          return ExerciseList.findById(resExercisePost._id);
        })
        .then(post => {
          expect(resExercisePost.CaloriesBurned).to.equal(post.CaloriesBurned);
          expect(resExercisePost.MET).to.equal(post.MET);
          expect(resExercisePost.Duration).to.equal(post.Duration);
          expect(resExercisePost.username).to.equal(post.username);
        });
    });
  });

});