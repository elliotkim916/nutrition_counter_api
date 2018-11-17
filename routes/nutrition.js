'use strict';

const router = require('express').Router();
const jsonParser = require('express').json();
const { NutritionList } = require('../models/nutrition');

router.get('/', (req, res) => {
  res.json(NutritionList.get()); 
});

router.post('/', jsonParser, (req, res) => {
  NutritionList
    .create({
      Calories : req.body.Calories,
      Total_Fat : req.body.Total_Fat,
      Saturated_Fat : req.body.Saturated_Fat,
      Cholesterol : req.body.Cholesterol,
      Sodium : req.body.Sodium,
      Potassium : req.body.Potassium,
      Carbohydrates : req.body.Carbohydrates,
      Dietary_Fiber : req.body.Dietary_Fiber,
      Sugars : req.body.Sugars,
      Protein : req.body.Protein 
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