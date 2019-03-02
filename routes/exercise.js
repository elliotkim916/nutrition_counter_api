'use strict';

const router = require('express').Router();
const jsonParser = require('express').json();
const { ExerciseList } = require('../models/exercise');
const passport = require('passport');

router.use(passport.authenticate('jwt', {session: false}));

router.get('/:username', (req, res) => {
  ExerciseList
  // .find returns an array, .findOne returns an object
    .find({username: req.params.username})
    .then(exercise => {
      res.status(200).json(exercise);
    });
});

router.post('/:username', jsonParser, (req, res) => {
  ExerciseList
    .create({
      exerciseName : req.body.exerciseName,
      caloriesBurned : req.body.caloriesBurned,
      duration : req.body.duration,
      username : req.body.username,
      created : req.body.created 
    })
    .then(exercise => res.status(201).json(exercise))
    .catch(() => res.status(500).json({error : 'Something went wrong'}));
});

router.delete('/:id', (req, res) => {
  ExerciseList
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message : 'Successfully deleted'});
    })
    .catch(() => {
      res.status(500).json({error : 'Something went wrong' });
    });
});

module.exports = router;