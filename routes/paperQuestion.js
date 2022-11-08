const express = require("express");
const { Paper } = require("../Model/paperModel");
const {
  PaperQuestion,
  validatePaperQuestion,
} = require("../Model/paperQuestionModel");
const { Question } = require("../Model/questionModel");
const { StudentPaper } = require("../Model/studentPaperModel");
const router = express.Router();
router.use(express.json());

//get all
router.get("/", async (req, res) => {
  const paperQuestion = await PaperQuestion.find({});
  if (paperQuestion && paperQuestion.length === 0) {
    res.status(404).send("paperQuestion not in database...");
    return;
  }
  res.status(200).send(paperQuestion);
});

//BY PAPER

router.post("/byPaper", async (req, res) => {
  console.log(req.body.paper);
  if (!req.body.paper) return res.status(404).send([]);

  const paperQuestions = await PaperQuestion.find({
    "paper._id": req.body.paper,
  });

  res.status(200).send(paperQuestions);
});

//exam questions

router.post("/examQuestions", async (req, res) => {
  const studentId = req.body.studentId;

  const studentPapers = await StudentPaper.find({
    "student._id": studentId,
  });

  const studentPaper = studentPapers[0];

  if (!studentPaper) return res.status(404).send([]);

  const paperQuestions = await PaperQuestion.find({
    "paper._id": studentPaper.paper._id,
  });

  res.status(200).send(paperQuestions);
});

//get by id
router.get("/:id", async (req, res) => {
  const paperQuestion = await PaperQuestion.findById(req.params.id);
  if (!paperQuestion) {
    res.status(404).send("paperQuestion not in database with specific id...");
    return;
  }
  res.status(200).send(paperQuestion);
});

//create
router.post("/", async (req, res) => {
  let { error } = validatePaperQuestion(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const question = await Question.findById(req.body.question);
  if (!question) return res.status(404).send("question not found");

  question.isActive = !question.isActive;

  const paper = await Paper.findById(req.body.paper);
  if (!paper) return res.status(404).send("paper not found");



  paper.totalMarks = paper.totalMarks + question.marks;

  const paperQuestion = new PaperQuestion({
    paper: paper,
    question: question,
  });

  const session = await PaperQuestion.startSession();

  session.startTransaction();

  try {
    await question.save();
    await paper.save();
    await StudentPaper.updateMany(
      { "paper._id": paper._id },
      { $set: { "paper.totalMarks": paper.totalMarks } }
    );
    await paperQuestion.save();
  } catch (err) {
    session.abortTransaction();
    throw err;
  }

  session.commitTransaction();
  session.endSession();

  res.status(200).send(paperQuestion);
});

//update
router.put("/:id", async (req, res) => {
  let { error } = validatePaperQuestion(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const paperQuestion = await PaperQuestion.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        paper: req.body.paper,
        serialNumber: req.body.serialNumber,
        question: req.body.question,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!paperQuestion) {
    res.status(404).send("paperQuestion with specific id not found");
    return;
  }

  res.status(200).send(paperQuestion);
});

//delete
router.delete("/:id", async (req, res) => {
  const paperQuestions = await PaperQuestion.find({
    "question._id": req.params.id,
  });

  const paperQuestion = paperQuestions[0];

  const question = await Question.findById(paperQuestion.question._id);
  if (!question) return res.status(404).send("question not found");

  question.isActive = !question.isActive;

  const paper = await Paper.findById(paperQuestion.paper._id);
  if (!paper) return res.status(404).send("paper not found");

  paper.totalMarks = paper.totalMarks - question.marks;

  const session = await PaperQuestion.startSession();

  session.startTransaction();

  try {
    await question.save();
    await paper.save();
    await StudentPaper.updateMany(
      { "paper._id": paper._id },
      { $set: { "paper.totalMarks": paper.totalMarks } }
    );
    const result = await PaperQuestion.deleteOne({
      "question._id": req.params.id,
    });
    if (result.deletedCount == 0)
      res.status(404).send("paperQuestion not found with specific id.....");
    else res.status(200).send(paperQuestions[0]);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }

  session.commitTransaction();
  session.endSession();
});

module.exports = router;
