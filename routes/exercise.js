'use strict';

const router = require('express').Router();
const jsonParser = require('express').json();
const { ExerciseList } = require('../models/exercise');

router.get('/', (req, res) => {
  res.json(ExerciseList.get());
});

router.post('/', jsonParser, (req, res) => {
  ExerciseList
    .create({
      CaloriesBurned : req.params.CaloriesBurned,
      MET : req.params.MET,
      Duration : req.params.Duration 
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