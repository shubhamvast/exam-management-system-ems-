const express = require("express");
const { PaperQuestion } = require("../Model/paperQuestionModel");
const {
  StudentAnswer,
  validateStudentAnswer,
} = require("../Model/studentAnswersModel");
const { User } = require("../Model/userModel");
const router = express.Router();
router.use(express.json());

//get all
router.get("/", async (req, res) => {
  const studentAnswer = await StudentAnswer.find({});
  if (studentAnswer && studentAnswer.length === 0) {
    res.status(404).send("studentAnswer not in database...");
    return;
  }
  res.status(200).send(studentAnswer);
});

//by student and paper

router.post("/byStudentAndPaper", async (req, res) => {
  
  const student = req.body.student;
  const paper = req.body.paper;
  const query = {};

  if(student) {
    query["student._id"]=student;
  }

  if(paper){
    query["paper._id"]=paper;
  }
  const studentAnswer = await StudentAnswer.find(query);
 
  res.status(200).send(studentAnswer);

})



//get by id
router.get("/:id", async (req, res) => {
  const studentAnswer = await StudentAnswer.findById(req.params.id);
  if (!studentAnswer) {
    res.status(404).send("studentAnswer not in database with specific id...");
    return;
  }
  res.status(200).send(studentAnswer);
});




//create
router.post("/", async (req, res) => {
  let { error } = validateStudentAnswer(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const student = await User.findById(req.body.student);
  if (!student) return res.status(404).send("student not found");

  const paperQuestion = await PaperQuestion.findById(req.body.paperQuestion);
  if (!paperQuestion) return res.status(404).send("paperQuestion not found");

  const answer = req.body.answer;

  const isCorrect = answer === paperQuestion.question.correctOption.option;

  const studentAnswer = new StudentAnswer({
    student: student,
    paperQuestion: paperQuestion,
    answer: answer,
    isCorrect: isCorrect,
  });
  await studentAnswer.save();
  res.status(200).send(studentAnswer);
});

//update
router.put("/:id", async (req, res) => {
  let { error } = validateStudentAnswer(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const studentAnswer = await StudentAnswer.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        student: req.body.student,
        paperQuestion: req.body.paperQuestion,
        answer: req.body.answer,
        isCorrect: req.body.isCorrect,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!studentAnswer) {
    res.status(404).send("studentAnswer with specific id not found");
    return;
  }

  res.status(200).send(studentAnswer);
});

//delete many
router.delete("/", async (req, res) => {
  const result = await StudentAnswer.deleteMany({});
  if (result.deletedCount == 0)
    res.status(404).send("studentAnswer not found with specific id.....");
  else res.status(200).send([]);
});


//delete
router.delete("/:id", async (req, res) => {
  const studentAnswer = await StudentAnswer.findById(req.params.id);
  const result = await StudentAnswer.deleteOne({ _id: req.params.id });
  if (result.deletedCount == 0)
    res.status(404).send("studentAnswer not found with specific id.....");
  else res.status(200).send(studentAnswer);
});

module.exports = router;
