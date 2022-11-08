const express = require("express");
const { AnswerOption } = require("../Model/answerOptionModel");
const { PaperQuestion } = require("../Model/paperQuestionModel");
const { Question } = require("../Model/questionModel");
const { Subject } = require("../Model/subjectModel");
const router = express.Router();
router.use(express.json());
const { Topic, validateTopic } = require("../Model/topicModel");

//get all topics
router.get("/", async (req, res) => {
  const topics = await Topic.find({});
  if (topics && topics.length === 0) {
    res.status(404).send(topics);
    return;
  }
  res.status(200).send(topics);
});

//get topics by subjects
router.post("/bySubjectId", async (req, res) => {
  const subjectId = req.body.subjectId;
  const query = {};

  if (subjectId) query["subject._id"] = subjectId;

  const topics = await Topic.find(query);
  res.status(200).send(topics);
});

//get topic by id
router.get("/:id", async (req, res) => {
  const topics = await Topic.findById(req.params.id);
  if (!topics) {
    res.status(404).send("topics not in database with specific id...");
    return;
  }
  res.status(200).send(topics);
});

//create topic
router.post("/", async (req, res) => {
  let { error } = validateTopic(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(404).send("subject not found");
  const topic = new Topic({
    name: req.body.name,
    subject: {
      _id: subject._id,
      name: subject.name,
    },
  });
  await topic.save();
  res.status(200).send(topic);
});


//update topic
router.put("/:id", async (req, res) => {
  let { error } = validateTopic(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const session = await Topic.startSession();

  session.startTransaction();

  try {
    const subject = await Subject.findById(req.body.subject);

    if (!subject) return res.status(404).send("subject not found");

    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          subject: {
            _id: subject._id,
            name: subject.name,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!topic) {
      res.status(404).send("topic with specific id not found");
      return;
    }

    const questions = await Question.find({ "topic._id": topic._id });

    questions.map(async (question) => {
      await PaperQuestion.updateMany(
        { "question._id": question._id },
        {
          $set: {
            "paper.subject.name": subject.name,
            "question.topic": topic,
          },
        }
      );
    });

    await Question.updateMany(
      { "topic._id": topic._id },
      {
        $set: {
          topic: topic,
        },
      }
    );

    res.status(200).send(topic);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});



//delete topic
router.delete("/:id", async (req, res) => {
  const session = await Topic.startSession();

  session.startTransaction();

  try {
    const topic = await Topic.findById(req.params.id);

    const questions = await Question.find({ "topic._id": topic._id });

    questions.map(async (question) => {
      await AnswerOption.deleteMany({ question: question._id });
      await PaperQuestion.deleteMany({ "question._id": question._id });
    });

    await Question.deleteMany({ "topic._id": topic._id });

    await Topic.deleteOne({ _id: req.params.id });

    res.status(200).send(topic);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

module.exports = router;
