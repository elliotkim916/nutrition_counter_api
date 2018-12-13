'use strict';

const router = require('express').Router();
const jsonParser = require('express').json();
const { ExerciseList } = require('../models/exercise');
const passport = require('passport');

router.use(passport.authenticate('jwt', {session: false}));

router.get('/:username', (req, res) => {
  ExerciseList
    .find({username: req.params.username})
    .then(exercise => {
      res.status(200).json(exercise);
    });
});

router.post('/', jsonParser, (req, res) => {
  ExerciseList
    .create({
      CaloriesBurned : req.body.CaloriesBurned,
      MET : req.body.MET,
      Duration : req.body.Duration,
      username : req.body.username 
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