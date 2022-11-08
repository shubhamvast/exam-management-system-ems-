const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, "paper name length must be greater than or equal to 3 "],
    maxLength: [50, "paper name length must be less than or equal to 50 "],
    required: true,
  },

  subject:new mongoose.Schema({
      _id:{
        type: mongoose.Schema.Types.ObjectId,
    required: true,
      },
      name:{
        type: String,
        required: true,
        minLength: [1, "subject's minimum length 1 characters"],
        maxLength: [50, "subject's minimum length 50 characters "],
      }
  }),
  totalMarks: {
    type: Number,
    min: [0, "totalMarks is must be grater than or equal to 0"],
    max: [1000, "totalMarks is less than or equal to 1000"],
    default:0
  },
});

const Paper = mongoose.model("paper", paperSchema);

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

function validatePaper(paper) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    subject: Joi.objectId(),
  });
  
  return schema.validate(paper);
}

module.exports = { Paper, paperSchema, validatePaper };
