'use strict';

const mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
  CaloriesBurned: {type: Number},
  MET: {type: Number},
  Duration: {type: Number}
});

exerciseSchema.methods.serialize = () => {
  return {
    CaloriesBurned: this.CaloriesBurned,
    MET: this.MET,
    Duration: this.Duration
  };
};

const ExerciseList = mongoose.model('ExerciseList', exerciseSchema);
module.exports = {ExerciseList};
