const express = require("express");
const router = express.Router();
router.use(express.json());
const bcrypt = require("bcrypt");
const { User, userSchema } = require("../Model/userModel");
// const {sendMail} = require("../mail/sendEmail");

router.post("/", async (req, res) => {

 
  const { error } = validateLoginDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ userName: req.body.username });
  if (!user) return res.status(404).send("Invalid Username and Password!");

  const isvalid = await bcrypt.compare(req.body.password, user.password);
  if (!isvalid) {
    res.status(400).send("Invalid Username and Password!");
    return;
  }
  const token = user.getAuthToken();
  res.status(200).send(token);
  //   if(token){
  //     sendMail(req.body.email,"Login on movie rental app...","Logged in successfully...");
  //   }
});

const Joi = require("joi");
function validateLoginDetails(user) {
  const joiSchema = Joi.object({
    username: Joi.string().required("Please enter valid Username").min(5).max(255),
    password: Joi.string().required("Please enter valid Password").min(5).max(1024),
  });
  return joiSchema.validate(user);
}

module.exports = router;
