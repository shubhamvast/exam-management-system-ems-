const express = require("express");
const router = express.Router();
router.use(express.json());


const { AnswerOption, validateAnswerOption } = require("../Model/answerOptionModel");
//get all
router.get("/", async (req, res) => {
    const answerOption = await AnswerOption.find({});
    if (answerOption && answerOption.length === 0) {
      res.status(404).send("answerOption not in database...");
      return;
    }
    res.status(200).send(answerOption);
  });


  router.post("/byQuestionId", async (req, res) => {
    const questionId = req.body.questionId;
    const answerOptions = await AnswerOption.find({questionId:questionId});
    if (!answerOptions && answerOptions.length === 0) {
      res.status(404).send("answerOption not in database...");
      return;
    }
    res.status(200).send(answerOptions);
  });


  //get by id
router.get("/:id", async (req, res) => {
    const answerOption = await AnswerOption.findById(req.params.id);
    if (!answerOption) {
      res.status(404).send("answerOption not in database with specific id...");
      return;
    }
    res.status(200).send(answerOption);
  });
  


  //create
router.post("/", async (req, res) => {
    let { error } = validateAnswerOption(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    const answerOption = new AnswerOption({
        option: req.body.option,
        optionText :req.body.optionText,
        question: req.body.question,
        isCorrect:req.body.isCorrect
    });
    await answerOption.save();
    res.status(200).send(answerOption);
  });
  
  //update
router.put("/:id", async (req, res) => {
    let { error } = validateAnswerOption(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    const answerOption = await AnswerOption.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
            option: req.body.option,
            optionText :req.body.optionText,
            question: req.body.question,
            isCorrect:req.body.isCorrect
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!answerOption) {
      res.status(404).send("answerOption with specific id not found");
      return;
    }
  
    res.status(200).send(answerOption);
  });
  


  
//delete

router.delete("/:id", async (req, res) => {
    const answerOption = await AnswerOption.findById(req.params.id);
    const result = await AnswerOption.deleteOne({ _id: req.params.id });
    if (result.deletedCount == 0)
      res.status(404).send("answerOption not found with specific id.....");
    else res.status(200).send(answerOption);
  });
  


module.exports = router;