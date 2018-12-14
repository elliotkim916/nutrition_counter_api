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

  describe('POST endpoint of exercise', function() {
    it('should add a new exercise entry', function() {
      const newExercise = {
        'CaloriesBurned' : 200,
        'MET' : 100,
        'Duration' : '1 hour',
        'username' : 'exercise-test-user',
        'id' : '5afb01574c7557177f786879'
      };

      return chai.request(app)
        .post(`/api/exercise`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send(newExercise)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('CaloriesBurned', 'MET', 'Duration', 'username');
          expect(res.body.username).to.equal(newExercise.username);
          expect(res.body.CaloriesBurned).to.equal(newExercise.CaloriesBurned);
          expect(res.body.MET).to.equal(newExercise.MET);
          expect(res.body.Duration).to.equal(newExercise.Duration);
          expect(res.body.id).to.not.be.null;
          return ExerciseList.findById(res.body._id);
        })
        .then(post => {
          expect(post.CaloriesBurned).to.equal(newExercise.CaloriesBurned);
          expect(post.MET).to.equal(newExercise.MET);
          expect(post.Duration).to.equal(newExercise.Duration);
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
              'Calories',
              'Total_Fat',
              'Saturated_Fat',
              'Cholesterol',
              'Sodium',
              'Potassium',
              'Carbohydrates',
              'Dietary_Fiber',
              'Sugars',
              'Protein',
              'username');
          });

          resNutritionEntry = res.body[0];
          return NutritionList.findById(resNutritionEntry._id);
        })
        .then(post => {
          expect(resNutritionEntry.Calories).to.equal(post.Calories);
          expect(resNutritionEntry.Total_Fat).to.equal(post.Total_Fat);
          expect(resNutritionEntry.Saturated_Fat).to.equal(post.Saturated_Fat);
          expect(resNutritionEntry.Cholesterol).to.equal(post.Cholesterol);
          expect(resNutritionEntry.Sodium).to.equal(post.Sodium);
          expect(resNutritionEntry.Potassium).to.equal(post.Potassium);
          expect(resNutritionEntry.Carbohydrates).to.equal(post.Carbohydrates);
          expect(resNutritionEntry.Dietary_Fiber).to.equal(post.Dietary_Fiber);
          expect(resNutritionEntry.Sugars).to.equal(post.Sugars);
          expect(resNutritionEntry.Protein).to.equal(post.Protein);
          expect(resNutritionEntry.username).to.equal(post.username);
        });
    });
  });

  describe('POST endpoint of nutrition', function() {
    it('should add a new nutrition entry', function() {
      const newNutrition = {
        'Calories' : 401,
        'Total_Fat' : 19,
        'Saturated_Fat' : 16,
        'Cholesterol' : 26,
        'Sodium' : 126,
        'Potassium' : 46,
        'Carbohydrates' : 36,
        'Dietary_Fiber' : 16,
        'Sugars' : 11,
        'Protein' : 31,
        'username' : 'test-user',
        '_id' : '5afb01574c7557177f786872'
      };

      return chai.request(app)
        .post(`/api/nutrition`)
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send(newNutrition)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'Calories',
            'Total_Fat',
            'Saturated_Fat',
            'Cholesterol',
            'Sodium',
            'Potassium',
            'Carbohydrates',
            'Dietary_Fiber',
            'Sugars',
            'Protein',
            'username');
          expect(res.body.Calories).to.equal(newNutrition.Calories);
          expect(res.body.Total_Fat).to.equal(newNutrition.Total_Fat);
          expect(res.body.Saturated_Fat).to.equal(newNutrition.Saturated_Fat);
          expect(res.body.Cholesterol).to.equal(newNutrition.Cholesterol);
          expect(res.body.Sodium).to.equal(newNutrition.Sodium);
          expect(res.body.Potassium).to.equal(newNutrition.Potassium);
          expect(res.body.Carbohydrates).to.equal(newNutrition.Carbohydrates);
          expect(res.body.Dietary_Fiber).to.equal(newNutrition.Dietary_Fiber);
          expect(res.body.Sugars).to.equal(newNutrition.Sugars);
          expect(res.body.Protein).to.equal(newNutrition.Protein);
          expect(res.body.username).to.equal(newNutrition.username);
          expect(res.body.id).to.not.be.null;
          return NutritionList.findById(res.body._id);
        })
        .then(post => {
          expect(newNutrition.Calories).to.equal(post.Calories);
          expect(newNutrition.Total_Fat).to.equal(post.Total_Fat);
          expect(newNutrition.Saturated_Fat).to.equal(post.Saturated_Fat);
          expect(newNutrition.Cholesterol).to.equal(post.Cholesterol);
          expect(newNutrition.Sodium).to.equal(post.Sodium);
          expect(newNutrition.Potassium).to.equal(post.Potassium);
          expect(newNutrition.Carbohydrates).to.equal(post.Carbohydrates);
          expect(newNutrition.Dietary_Fiber).to.equal(post.Dietary_Fiber);
          expect(newNutrition.Sugars).to.equal(post.Sugars);
          expect(newNutrition.Protein).to.equal(post.Protein);
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