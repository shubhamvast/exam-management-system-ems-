const express = require("express");
const { Paper } = require("../Model/paperModel");
const { StudentAnswer } = require("../Model/studentAnswersModel");
const {
  StudentPaper,
  validateStudentPaper,
} = require("../Model/studentPaperModel");
const { User } = require("../Model/userModel");
const router = express.Router();

router.use(express.json());

//get all studentPapers
router.get("/", async (req, res) => {
  const studentPaper = await StudentPaper.find({});
 
  res.status(200).send(studentPaper);
});

//result
router.post("/result", async (req, res) => { 

const studentPapers = await StudentPaper.find({"student._id":req.body.studentId})  ;
const studentPaper = studentPapers[0];
const studentAnswers = await StudentAnswer.find({"student._id":req.body.studentId});
let totalCorrect=0;
let totalAttemptd=0;
let obtainMarks=0;

totalAttemptd= studentAnswers.length;

studentAnswers.map((studentAnswer)=>{
  if(studentAnswer.isCorrect){
    totalCorrect += 1 ;
    obtainMarks += studentAnswer.paperQuestion.question.marks;
  }
})

studentPaper.totalCorrect=totalCorrect;
studentPaper.totalAttemptd=totalAttemptd;
studentPaper.obtainMarks=obtainMarks;

const session = await StudentPaper.startSession();

session.startTransaction();

try {

await studentPaper.save();
await StudentAnswer.deleteMany({"student._id":req.body.studentId});

res.status(200).send(studentPaper);
} catch (err) {
  session.abortTransaction();
  throw err;
}
session.commitTransaction();
session.endSession();

})


//by student
router.post("/byStudent", async (req, res) => {
  const studentPapers = await StudentPaper.find({
    "student._id": req.body.studentId,
  });
  if (!studentPapers && studentPapers.length === 0) {
    res.status(404).send("studentPapers not in database...");
    return;
  }

  res.status(200).send(studentPapers);
});

//get by id
router.get("/:id", async (req, res) => {
  const studentPaper = await StudentPaper.findById(req.params.id);
  if (!studentPaper) {
    res.status(404).send("studentPaper not in database with specific id...");
    return;
  }
  res.status(200).send(studentPaper);
});

//create
router.post("/", async (req, res) => {
  let { error } = validateStudentPaper(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const student = await User.findById(req.body.student);
  if (!student) return res.status(404).send("student not found");
  const paper = await Paper.findById(req.body.paper);
  if (!paper) return res.status(404).send("paper not found");

  

  const studentPaper = new StudentPaper({
    student: student,
    paper: paper,
    status: "assigned",
  });

  await studentPaper.save();

  res.status(200).send(studentPaper);
});

//update
router.put("/:id", async (req, res) => {
  let { error } = validateStudentPaper(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const studentPaper = await StudentPaper.findById(req.params.id);
  const student = await User.findById(req.body.student);
  if (!student) return res.status(404).send("student not found");
  const paper = await Paper.findById(req.body.paper);
  if (!paper) return res.status(404).send("paper not found");

  (studentPaper.student = student),
    (studentPaper.paper = paper),
    (studentPaper.status = "assigned"),
    await studentPaper.save();

  res.status(200).send(studentPaper);
});

//delete

router.delete("/:id", async (req, res) => {
  const studentPaper = await StudentPaper.findById(req.params.id);
  const result = await StudentPaper.deleteOne({ _id: req.params.id });
  if (result.deletedCount == 0)
    res.status(404).send("studentPaper not found with specific id.....");
  else res.status(200).send(studentPaper);
});

module.exports = router;
