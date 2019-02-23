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
const {NutritionList} = require('../models/nutrition');
const exerciseTestData = require('../test_db/exercise');
const nutritionTestData = require('../test_db/nutrition');

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
  'username': 'test-user',
  'password': 'test-password' 
};

const TEST_TOKEN = createAuthToken(TEST_USER);

describe('Nutrition Counter Server Side API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return NutritionList.insertMany(nutritionTestData) && ExerciseList.insertMany(exerciseTestData);
  });

  afterEach(function() {
    return teardownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint of exercise', function() {
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
            expect(post).to.include.keys('caloriesBurned', 'duration', 'created', 'username', '_id');
          });

          resExercisePost = res.body[0];
          return ExerciseList.findById(resExercisePost._id);
        })
        .then(post => {
          expect(resExercisePost.caloriesBurned).to.equal(post.caloriesBurned);
          expect(resExercisePost.duration).to.equal(post.duration);
          expect(resExercisePost.username).to.equal(post.username);
          expect(resExercisePost._id).to.equal(post.id);
        });
    });
  });

  describe('POST endpoint of exercise', function() {
    it('should add a new exercise entry', function() {
      const newExercise = {
        'caloriesBurned' : 200,
        'duration' : 60,
        'created' : '2019-02-22T06:46:01.287Z',
        'username' : 'exercise-test-user',
        '_id' : '5afb01574c7557177f786879'
      };

      return chai.request(app)
        .post(`/api/exercise/${newExercise.username}`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send(newExercise)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('caloriesBurned', 'duration', 'created', 'username');
          expect(res.body.username).to.equal(newExercise.username);
          expect(res.body.caloriesBurned).to.equal(newExercise.caloriesBurned);
          expect(res.body.duration).to.equal(newExercise.duration);
          expect(res.body.created).to.equal(newExercise.created);
          expect(res.body._id).to.not.be.null;
          return ExerciseList.findById(res.body._id);
        })
        .then(post => {
          expect(post.caloriesBurned).to.equal(newExercise.caloriesBurned);
          expect(post.duration).to.equal(newExercise.duration);
          expect(post.username).to.equal(newExercise.username);
        });
    });
  });

  describe('DELETE endpoint of exercise', function() {
    it('should delete an exercise entry', function() {
      return ExerciseList
        .findOne()
        .then(entry => {
          return chai.request(app)
            .delete(`/api/exercise/${entry.id}`)
            .set('Authorization', `Bearer ${TEST_TOKEN}`)
            .then(res => {
              expect(res).to.have.status(204);
              return ExerciseList.findById(entry.id);
            })
            .then(_exercise => {
              expect(_exercise).to.be.null;
            });
        }); 
    });
  });

  describe('GET endpoint of nutrition', function() {
    it('should return all of users nutrition information', function() {
      let res;
      return chai.request(app)
        .get(`/api/nutrition/${TEST_USER.username}`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .then(_res => {
          res = _res;
          expect(res).to.be.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          return NutritionList.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    let resNutritionEntry;
    it('should return all of users nutrition information with the right fields', function() {
      return chai.request(app)
        .get(`/api/nutrition/${TEST_USER.username}`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .then(res => {
          expect(res).to.be.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(post => {
            expect(post).to.be.a('object');
            expect(post).to.include.keys(
              'calories',
              'fat',
              'carbs',
              'protein',
              'sugar',
              'sodium',
              'created',
              'username');
          });

          resNutritionEntry = res.body[0];
          return NutritionList.findById(resNutritionEntry._id);
        })
        .then(post => {
          expect(resNutritionEntry.calories).to.equal(post.calories);
          expect(resNutritionEntry.fat).to.equal(post.fat);
          expect(resNutritionEntry.carbs).to.equal(post.carbs);
          expect(resNutritionEntry.protein).to.equal(post.protein);
          expect(resNutritionEntry.sugar).to.equal(post.sugar);
          expect(resNutritionEntry.sodium).to.equal(post.sodium);
          expect(resNutritionEntry.username).to.equal(post.username);
        });
    });
  });

  describe('POST endpoint of nutrition', function() {
    it('should add a new nutrition entry', function() {
      const newNutrition = {
        'calories' : 401,
        'fat' : 19,
        'carbs' : 36,
        'protein' : 31,
        'sugar' : 11,
        'sodium' : 126,
        'created' : '2019-02-22T06:46:01.287Z',
        'username' : 'test-user',
        '_id' : '5afb01574c7557177f786872'
      };

      return chai.request(app)
        .post(`/api/nutrition/${newNutrition.username}`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send(newNutrition)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'calories',
            'fat',
            'carbs',
            'protein',
            'sugar',
            'sodium',
            'created',
            'username');
          expect(res.body.calories).to.equal(newNutrition.calories);
          expect(res.body.fat).to.equal(newNutrition.fat);
          expect(res.body.carbs).to.equal(newNutrition.carbs);
          expect(res.body.protein).to.equal(newNutrition.protein);
          expect(res.body.sugar).to.equal(newNutrition.sugar);
          expect(res.body.sodium).to.equal(newNutrition.sodium);
          expect(res.body.created).to.equal(newNutrition.created);
          expect(res.body.username).to.equal(newNutrition.username);
          expect(res.body.id).to.not.be.null;
          return NutritionList.findById(res.body._id);
        })
        .then(post => {
          expect(newNutrition.calories).to.equal(post.calories);
          expect(newNutrition.fat).to.equal(post.fat);
          expect(newNutrition.carbs).to.equal(post.carbs);
          expect(newNutrition.protein).to.equal(post.protein);
          expect(newNutrition.sugar).to.equal(post.sugar);
          expect(newNutrition.sodium).to.equal(post.sodium);
          expect(newNutrition.username).to.equal(post.username);
        });
    });
  });

  describe('Delete endpoint for nutrition', function() {
    it('should delete a nutrition entry', function() {
      return NutritionList
        .findOne()
        .then(nutrition => {
          return chai.request(app)
            .delete(`/api/nutrition/${nutrition.id}`)
            .set('Authorization', `Bearer ${TEST_TOKEN}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return NutritionList.findById(res.body.id);
        })
        .then(post => {
          expect(post).to.be.null;
        });
    });
  });
});