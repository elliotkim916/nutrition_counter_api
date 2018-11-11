'use strict';

const chai = require('chai');
const chaihttp = require('chai-http');

const {app} = require('../server');

const should = chai.should();
chai.use(chaihttp);

describe('API', function() {
  it('should 200 on GET requests', () => {
    return chai.request(app)
      .get('/api/fooooo')
      .then(res => {
        res.should.have.status(200);
        res.should.be.json;
      });
  });
});