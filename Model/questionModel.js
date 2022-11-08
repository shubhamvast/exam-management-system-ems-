const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { topicSchema } = require("./topicModel");
const questionsSchema = new Schema({
  questionText: {
    type: String,
    required: true,
    minLength: [5, "Question text minimum 5 characters"],
  },

  topic: topicSchema,

  marks: {
    type: Number,
    min: [1, "Marks should not less than zero"],
    max: [10, "Marks should not greater than hundred"],
    required: true,
  },
  complexityLevel: {
    type: String,
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "{value} value is not supported",
    },
    required: true,
  },

  correctOption: new Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    option: {
      type: String,
      required: true,
      minLength: [1, "option length is greter than  0 characters"],
      maxLength: [1, "option length is less than 1 characters"],
      required: true,
    },
    optionText: {
      type: String,
      minLength: [1, "option text lenght greter than 1 characters"],
      maxLength: [1024, "option text length less than 1024 characters"],
      required: true,
    },
  }),

  optionA: {
    type: String,
    required: true,
  },
  optionB: {
    type: String,
    required: true,
  },
  optionC: {
    type: String,
    required: true,
  },
  optionD: {
    type: String,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: false,
  },
  paper: {
    type:Object,
  },
});

const Question = mongoose.model("question", questionsSchema);

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

function validateQuestion(question) {
  const schema = Joi.object({
    questionText: Joi.string().min(5).required(),
    topic: Joi.objectId(),
    marks: Joi.number().min(1).max(10).required(),
    complexityLevel: Joi.string().required(),
    optionA: Joi.string().required(),
    optionB: Joi.string().required(),
    optionC: Joi.string().required(),
    optionD: Joi.string().required(),
    answer: Joi.array().required(),
    subject: Joi.string(),
    // paper: Joi.array(),
  });

  return schema.validate(question);
}

module.exports = { Question, questionsSchema, validateQuestion };
