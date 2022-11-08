const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const { questionsSchema } = require("./questionModel");
const { paperSchema } = require("./paperModel");

const paperquestionSchema = new Schema({
  paper:{
    type: paperSchema,
    required:true
  },
  
  question: {
    type:questionsSchema,
    required:true
  },
});

const PaperQuestion = mongoose.model("paperquestion", paperquestionSchema);

const Joi = require("joi");
Joi.objectid = require("joi-objectid")(Joi);

function validatePaperQuestion(paperquestion) {
  const schema = Joi.object({
    paper: Joi.objectId(),
    question: Joi.objectId(),
  });

  return schema.validate(paperquestion);
}

module.exports = { PaperQuestion, paperquestionSchema, validatePaperQuestion };
