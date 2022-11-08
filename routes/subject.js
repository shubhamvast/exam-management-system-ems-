const express = require("express");
const { AnswerOption } = require("../Model/answerOptionModel");
const { Paper } = require("../Model/paperModel");
const { PaperQuestion } = require("../Model/paperQuestionModel");
const { Question } = require("../Model/questionModel");
const { StudentPaper } = require("../Model/studentPaperModel");
const router = express.Router();
router.use(express.json());

const { Subject, validateSubject } = require("../Model/subjectModel");
const { Topic } = require("../Model/topicModel");

//get all subjects
router.get("/", async (req, res) => {
  const subjects = await Subject.find({});
  res.status(200).send(subjects);
});

//read specific item
router.get("/:id", async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404).send("subject with given id not found....");
    return;
  }
  res.status(200).send(subject);
});

//create
router.post("/", async (req, res) => {
  let { error } = validateSubject(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const subject = new Subject({
    name: req.body.name,
  });
  await subject.save();
  res.status(200).send(subject);
});

//update
router.put("/:id", async (req, res) => {
  let { error } = validateSubject(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const session = await Subject.startSession();

  session.startTransaction();

  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: req.body.name },
      },
      {
        new: true,
        runvalidators: true,
      }
    );

    await Topic.updateMany(
      { "subject._id": subject._id },
      { $set: { "subject.name": req.body.name } }
    );

    await Question.updateMany(
      { "topic.subject._id": subject._id },
      { $set: { "topic.subject.name": req.body.name } }
    );

    await PaperQuestion.updateMany(
      { "paper.subject._id": subject._id },
      { $set: { "paper.subject._id": req.body.name } }
    );

    await Paper.updateMany(
      { "subject._id": subject._id },
      { $set: { "subject.name": req.body.name } }
    );

    await StudentPaper.updateMany(
      { "paper.subject._id": subject._id },
      { $set: { "paper.subject.name": req.body.name } }
    );

    if (!subject) return res.status(404).send(subject);
    res.status(200).send(subject);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

//delete specific item
router.delete("/:id", async (req, res) => {
  const session = await Subject.startSession();

  session.startTransaction();

  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      res.status(404).send(subject);
      return;
    }

    await Topic.deleteMany({ "subject._id": subject._id });

    const questions = await Question.find({ "topic.subject._id": subject._id });

    questions.map(async (question) => {
      await AnswerOption.deleteMany({ question: question._id });
    });

    await Question.deleteMany({ "topic.subject._id": subject._id });

    await PaperQuestion.deleteMany({ "paper.subject._id": subject._id });

    await Paper.deleteMany({ "subject._id": subject._id });

    await StudentPaper.deleteMany({ "paper.subject._id": subject._id });

    await Subject.deleteOne({ _id: req.params.id });

    res.status(200).send(subject);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

module.exports = router;
