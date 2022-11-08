const express = require("express");
const { default: mongoose } = require("mongoose");
const { AnswerOption } = require("../Model/answerOptionModel");
const { Paper } = require("../Model/paperModel");
const { PaperQuestion } = require("../Model/paperQuestionModel");
const router = express.Router();
router.use(express.json());

const { Question, validateQuestion } = require("../Model/questionModel");
const { Topic } = require("../Model/topicModel");

//get all
router.get("/", async (req, res) => {
  const questions = await Question.find({});
  if (questions && questions.length === 0) {
    res.status(404).send("questions not in database...");
    return;
  }
  res.status(200).send(questions);
});

//get questions by subject
router.post("/bySubject", async (req, res) => {
  // const paperId = mongoose.Types.ObjectId(req.body.subject);
  let paperId = req.body.paper;
  if (!paperId) paperId = mongoose.Types.ObjectId(1);
  const paper = await Paper.findById(paperId);
  if (!paper) return res.status(200).send([]);
  const questions = await Question.find({ "topic.subject": paper.subject });

  res.status(200).send(questions);
});

//filter

router.post("/filterQuestions", async (req, res) => {
  const { searchSubject, searchTopic } = req.body;

  let query = {};

  if (searchSubject) query["topic.subject._id"] = searchSubject;

  if (searchTopic) query["topic._id"] = searchTopic;
  const questions = await Question.find(query);

  res.status(200).send(questions);
});

//get by id
router.get("/:id", async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    res.status(404).send("question not in database with specific id...");
    return;
  }
  res.status(200).send(question);
});

//create
router.post("/", async (req, res) => {
  let { error } = validateQuestion(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const topic = await Topic.findById(req.body.topic);
  if (!topic) return res.status(404).send("topic not found");

  const question = new Question({
    questionText: req.body.questionText,
    topic: topic,
    marks: req.body.marks,
    complexityLevel: req.body.complexityLevel,
  });

  const answerOptionA = await new AnswerOption({
    option: "A",
    optionText: req.body.optionA,
    question: question._id,
  });
  const answerOptionB = await new AnswerOption({
    option: "B",
    optionText: req.body.optionB,
    question: question._id,
  });
  const answerOptionC = await new AnswerOption({
    option: "C",
    optionText: req.body.optionC,
    question: question._id,
  });
  const answerOptionD = await new AnswerOption({
    option: "D",
    optionText: req.body.optionD,
    question: question._id,
  });

  const session = await Question.startSession();

  session.startTransaction();

  try {
    await answerOptionA.save();
    await answerOptionB.save();
    await answerOptionC.save();
    await answerOptionD.save();

    const answers = await AnswerOption.find({
      option: req.body.answer[0],
      question: question._id,
    });
    if (!answers || answers.length == 0)
      return res.status(404).send("answerOption not found");

    const answer = answers[0];
    answer.isCorrect = true;

    await answer.save();

    question.optionA = req.body.optionA;
    question.optionB = req.body.optionB;
    question.optionC = req.body.optionC;
    question.optionD = req.body.optionD;

    // question.correctOption = {
    //   _id: answer._id,
    //   optionText: answer.optionText,
    // };

    question.correctOption = {
      _id: answer._id,
      option: answer.option,
      optionText: answer.optionText,
    };

    await question.save();
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();

  //patch to set correct answer in question
  //patch to set isCorrect in answerOption
  //save question
  //save options

  res.status(200).send(question);
});

//update
router.put("/:id", async (req, res) => {
  let { error } = validateQuestion(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const topic = await Topic.findById(req.body.topic);
  if (!topic) return res.status(404).send("topic not found");
  const question = await Question.findById(req.params.id);
  question.questionText = req.body.questionText;
  question.topic = topic;
  question.marks = req.body.marks;
  question.complexityLevel = req.body.complexityLevel;

  let answerOptionArray = await AnswerOption.find({
    question: req.params.id,
    option: "A",
  });
  const answerOptionA = answerOptionArray[0];
  answerOptionA.optionText = req.body.optionA;

  answerOptionArray = await AnswerOption.find({
    question: req.params.id,
    option: "B",
  });
  const answerOptionB = answerOptionArray[0];
  answerOptionB.optionText = req.body.optionB;

  answerOptionArray = await AnswerOption.find({
    question: req.params.id,
    option: "C",
  });
  const answerOptionC = answerOptionArray[0];
  answerOptionC.optionText = req.body.optionC;

  answerOptionArray = await AnswerOption.find({
    question: req.params.id,
    option: "D",
  });
  const answerOptionD = answerOptionArray[0];
  answerOptionD.optionText = req.body.optionD;

  const session = await Question.startSession();

  session.startTransaction();

  try {
    await answerOptionA.save();
    await answerOptionB.save();
    await answerOptionC.save();
    await answerOptionD.save();

    const answers = await AnswerOption.find({
      option: req.body.answer[0],
      question: question._id,
    });
    if (!answers || answers.length == 0)
      return res.status(404).send("answerOption not found");

    const answer = answers[0];
    answer.isCorrect = true;
    await answer.save();

    question.optionA = req.body.optionA;
    question.optionB = req.body.optionB;
    question.optionC = req.body.optionC;
    question.optionD = req.body.optionD;
    question._id = req.params.id;
    question.correctOption = {
      _id: answer._id,
      option: answer.option,

      optionText: answer.optionText,
    };
    await question.save();

    await PaperQuestion.updateMany(
      { "question._id": question._id },
      { $set: { question: question } }
    );
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();

  //patch to set correct answer in question
  //patch to set isCorrect in answerOption
  //save question
  //save options

  res.status(200).send(question);
});

//is Active question
router.patch("/:id", async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).send("question not found");
  question.isActive = !question.isActive;
  let result = await question.save();
  res.status(200).send(result);
});


//delete
router.delete("/:id", async (req, res) => {
  const session = await Question.startSession();

  session.startTransaction();

  try {
    const question = await Question.findById(req.params.id);

    await PaperQuestion.deleteMany({ "question._id": question._id });

    await AnswerOption.deleteMany({ question: question._id });

    result = await Question.deleteOne({ _id: req.params.id });

    if (result.deletedCount == 0)
      res.status(404).send("question not found with specific id.....");
    else res.status(200).send(question);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

module.exports = router;
