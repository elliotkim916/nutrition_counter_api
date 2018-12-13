'use strict';

const mongoose = require('mongoose');
// a mongo-backed persistence layer - the layer of the app designated for maintaining the state of data
// to interact with mongo in our apps, we use Mongoose

// For each Mongoose model we create, we define a schema. A schema specifies how all documents in a particular collection should look. 
const nutritionSchema = mongoose.Schema({
  Calories : {type: Number},
  Total_Fat : {type: Number},
  Saturated_Fat : {type: Number},
  Cholesterol : {type: Number},
  Sodium : {type: Number},
  Potassium : {type: Number},
  Carbohydrates : {type: Number},
  Dietary_Fiber : {type: Number},
  Sugars : {type: Number},
  Protein : {type: Number},
  username : {type: String}
});

// serialize method, which lets us specify how nutrition is represented outside of our application via our API. 
nutritionSchema.methods.serialize = () => {
  return {
    Calories : this.Calories,
    Total_Fat : this.Total_Fat,
    Saturated_Fat : this.Saturated_Fat,
    Cholesterol : this.Cholesterol,
    Sodium : this.Sodium,
    Potassium : this.Potassium,
    Carbohydrates : this.Carbohydrates,
    Dietary_Fiber : this.Dietary_Fiber,
    Sugars : this.Sugars,
    Protein : this.Protein,
    username : this.username,
    id : this._id
  };
};

const NutritionList = mongoose.model('NutritionList', nutritionSchema);
module.exports = {NutritionList};