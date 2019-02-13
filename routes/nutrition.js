'use strict';

const router = require('express').Router();
const jsonParser = require('express').json();
const { NutritionList } = require('../models/nutrition');
const passport = require('passport');

router.use(passport.authenticate('jwt', {session: false}));

router.get('/:username', (req, res) => {
  NutritionList
    .find({username: req.params.username})
    .then(nutrition => {
      res.status(200).json(nutrition);
    });
});

router.post('/:username', jsonParser, (req, res) => {
  NutritionList
    .create({
      calories : req.body.calories,
      fat : req.body.fat,
      carbs : req.body.carbs,
      protein : req.body.protein,
      sugar : req.body.sugar,
      sodium : req.body.sodium,
      username : req.body.username  
    })
    .then(nutrition => res.status(201).json(nutrition))
    .catch(() => res.status(500).json({error: 'Something went wrong'}));
});

router.delete('/:id', (req, res) => {
  NutritionList
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'Successfully deleted'});
    })
    .catch(() => {
      res.status(500).json({error: 'Something went wrong'});
    });
});

module.exports = router;