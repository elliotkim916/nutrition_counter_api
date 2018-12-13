'use strict';

const mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
  CaloriesBurned: {type: Number},
  MET: {type: Number},
  Duration: {type: String},
  username: {type: String}
});

exerciseSchema.methods.serialize = () => {
  return {
    CaloriesBurned: this.CaloriesBurned,
    MET: this.MET,
    Duration: this.Duration,
    username: this.username,
    id: this._id
  };
};

const ExerciseList = mongoose.model('ExerciseList', exerciseSchema);
module.exports = {ExerciseList};
