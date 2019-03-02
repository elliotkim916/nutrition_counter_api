'use strict';

const mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
  exerciseName : {type : String},
  caloriesBurned : {type: Number},
  duration : {type: Number},
  created : {type: Date, default: Date.now},
  username : {type: String}
});

exerciseSchema.methods.serialize = () => {
  return {
    exerciseName : this.exerciseName,
    caloriesBurned : this.caloriesBurned,
    duration : this.duration,
    created : this.created,
    username : this.username,
    id : this._id
  };
};

const ExerciseList = mongoose.model('ExerciseList', exerciseSchema);
module.exports = {ExerciseList};
