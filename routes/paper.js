const express = require("express");
const router = express.Router();
router.use(express.json());

const { Paper, validatePaper } = require("../Model/paperModel");
const { PaperQuestion } = require("../Model/paperQuestionModel");
const { Question } = require("../Model/questionModel");
const { StudentPaper } = require("../Model/studentPaperModel");
const { Subject } = require("../Model/subjectModel");

//get all
router.get("/", async (req, res) => {
  const papers = await Paper.find({});
  if (papers && papers.length === 0) {
    res.status(404).send("papers not in database...");
    return;
  }
  res.status(200).send(papers);
});

//get by id
router.get("/:id", async (req, res) => {
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    res.status(404).send("paper not in database with specific id...");
    return;
  }
  res.status(200).send(paper);
});

//create
router.post("/", async (req, res) => {
  let { error } = validatePaper(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const subject = await Subject.findById(req.body.subject);

  if (!subject) return res.status(404).send("subject not found");

  const paper = new Paper({
    name: req.body.name,
    subject: {
      _id: subject._id,
      name: subject.name,
    },
    totalMarks: req.body.totalMarks,
  });
  await paper.save();
  res.status(200).send(paper);
});

//update
router.put("/:id", async (req, res) => {
  const session = await Paper.startSession();

  session.startTransaction();

  try {
    let { error } = validatePaper(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }

    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).send("paper not found");

    const subject = await Subject.findById(req.body.subject);

    if (!subject) return res.status(404).send("subject not found");

    paper.name = req.body.name;
    paper.subject = {
      _id: subject._id,
      name: subject.name,
    };
    paper.totalMarks = req.body.totalMarks;

    await StudentPaper.updateMany(
      { "paper._id": paper._id },
      { $set: { paper: paper } }
    );
    await paper.save();
    res.status(200).send(paper);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

//delete

router.delete("/:id", async (req, res) => {
  const session = await Paper.startSession();

  session.startTransaction();

  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) return res.status(404).send(paper);

    await StudentPaper.deleteMany({ "paper._id": paper._id });
    await Question.updateMany(
      { "topic.subject._id": paper.subject._id },
      {
        $set: {
          isActive: false,
        },
      }
    );
    await PaperQuestion.deleteMany({ "paper._id": paper._id });
    await Paper.deleteOne({ _id: req.params.id });
    res.status(200).send(paper);
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

module.exports = router;
