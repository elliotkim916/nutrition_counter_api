'use strict';

const mongoose = require('mongoose');
// a mongo-backed persistence layer - the layer of the app designated for maintaining the state of data
// to interact with mongo in our apps, we use Mongoose

// For each Mongoose model we create, we define a schema. A schema specifies how all documents in a particular collection should look. 
const nutritionSchema = mongoose.Schema({
  food_name : {type : String},
  calories : {type : Number},
  fat : {type : Number},
  carbs : {type : Number},
  protein : {type : Number},
  sugar : {type : Number},
  sodium : {type : Number},
  created : {type : Date, default: Date.now},
  username : {type : String}
});

// serialize method, which lets us specify how nutrition is represented outside of our application via our API. 
nutritionSchema.methods.serialize = () => {
  return {
    food_name : this.food_name,
    calories : this.calories,
    fat : this.fat,
    carbs : this.carbs,
    protein : this.protein,
    sugar : this.sugar,
    sodium : this.sodium,
    created : this.created,
    username : this.username,
    id : this._id
  };
};

const NutritionList = mongoose.model('NutritionList', nutritionSchema);
module.exports = {NutritionList};