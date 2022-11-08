const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { userSchema } = require("./userModel");
const { paperquestionSchema } = require("./paperQuestionModel");

const studentanswerSchema = new Schema({
  student: {
    type: new mongoose.Schema({
      firstName: {
        type: String,
        minLength: [
          3,
          "firstName length is must be greater than or equal to 3 character",
        ],
        maxLength: [
          50,
          "firstName length is must be less than or equal to 50 character",
        ],
        required: true,
      },
      lastName: {
        type: String,
        minLength: [
          3,
          "lastName length is must be greater than or equal to 3 character",
        ],
        maxLength: [
          50,
          "lastName length is must be less than or equal to 50 character",
        ],
        required: true,
      },
      email: {
        type: String,
        minLength: [
          5,
          "email length is must be greater than or equal to 5 character",
        ],
        maxLength: [
          255,
          "email length is must be less than or equal to 255 character",
        ],
        required: true,
      },
      phone: {
        type: String,
        minLength: [10, "user phone length must be 10"],
        maxLength: [10, "user phone length must be 10"],

        required: true,
      },
      userName: {
        type: String,
        minLength: [
          5,
          "userName length is must be greater than or equal to 5 character",
        ],
        maxLength: [
          255,
          "userName length is must be less than or equal to 255 character",
        ],
        required: true,
      },
    }),
    required: true,
  },
  paperQuestion: {
    type: paperquestionSchema,
    required: true,
  },
  answer: {
    type: String,
    maxLength: [1, "answer must be 1 character long"],
    default: "",
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const StudentAnswer = mongoose.model("studentAnswer", studentanswerSchema);
const Joi = require("joi");

Joi.objectid = require("joi-objectid")(Joi);

function validateStudentAnswer(studentAnswer) {
  const schema = Joi.object({
    student: Joi.objectId(),
    paperQuestion: Joi.objectId(),
    answer: Joi.string().min(1).max(1).required(),
    isCorrect: Joi.boolean(),
  });
  return schema.validate(studentAnswer);
}

module.exports = { StudentAnswer, studentanswerSchema, validateStudentAnswer };
