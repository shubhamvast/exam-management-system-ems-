const mongoose = require("mongoose");

const { userSchema } = require("./userModel");
const { paperSchema } = require("./paperModel");

const studentPaperSchema = new mongoose.Schema({
  student: {
    type: userSchema,
    required:true
  },

  paper: {
    type:paperSchema,
    required:true
  },
  status: {
    type: String,
    enum: {
      values: ["assigned", "inProgress", "submitted", "checked"],
      message: "{values} is not allowed",
    },
    required: true,
  },
  totalAttemptd: {
    type: Number,
    min: [0, "attemptd should be positive"],
    default: 0,
  },
  totalCorrect: {
    type: Number,
    min: [0, "totalCorrect should be positive"],
    default: 0,
  },
  obtainMarks: {
    type: Number,
    min: [0, "obtainMarks should be positive"],
    default: 0,
  },
});

const StudentPaper = mongoose.model("studentPaper", studentPaperSchema);
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

function validateStudentPaper(studentPaper) {
  const schema = new Joi.object({
    student: Joi.objectid(),
    paper: Joi.objectid(),
    status: Joi.string(),
    totalAttemptd: Joi.number().min(0),
    totalCorrect: Joi.number().min(0),
    obtainMarks: Joi.number().min(0),
  });

  return schema.validate(studentPaper);
}

module.exports = { StudentPaper, studentPaperSchema, validateStudentPaper };
