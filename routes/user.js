const express = require("express");
const router = express.Router();
router.use(express.json());
const jwt = require("jsonwebtoken");

//formating passed string
function printText(str) {
  if (!str) return;
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toUpperCase() : word.toUpperCase();
    })
    .replace(/\s+/g, " ");
}

const { User, validateUser } = require("../Model/userModel");

const validateObjectIdMiddleware = require("../middleware/validateObjectIdMiddleware");

//get students
router.get("/getAllStudents", async (req, res) => {
  const users = await User.find({ role: "student" });

  if (users && users.length === 0) {
    res.status(404).send("users not found with given condition ");
    return;
  }
  res.status(200).send(users);
});

//get users
router.get("/", async (req, res) => {
  const users = await User.find({});

  if (users && users.length === 0) {
    res.status(404).send("users not found with given condition ");
    return;
  }
  res.status(200).send(users);
});

//read specific item
router.get("/:id", validateObjectIdMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(200).send([]);
    return;
  }
  res.status(200).send(user);
});

const bcrypt = require("bcrypt");
const lodash = require("lodash");
const { StudentPaper } = require("../Model/studentPaperModel");
const { AnswerOption } = require("../Model/answerOptionModel");
const { StudentAnswer } = require("../Model/studentAnswersModel");
const c = require("config");

const sendEmail = require("../sendEmail");

//create user
router.post("/", async (req, res) => {
  let { error } = validateUser(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  let userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    res.status(400).send("User already Registered..");
    return;
  }
  const user = new User({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    phone: req.body.phone,
    userName: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  await user.save();
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body style="display: flex;justify-content: center;">
<div style="width:100%; padding: 20px; background-color:#F5F7F7">
        <p>
            Hello ${printText(user.firstName) + " " + printText(user.lastName)},
        </p>
        <p>
            Congratulation 🎉, You have been successfully registered on Exam Management System (EMS) portal.
        </p>
        <br/>
        <p>
            Regards,<br/>admin@ems.com
        </p>

</div>
</body>
</html>    

`;
  sendEmail(user.email, "Registration Successful - EMS", html);

  res
    .status(200)
    .send(
      lodash.pick(user, [
        "firstName",
        "lastName",
        "_id",
        "email",
        "phone",
        "userName",
        "role",
      ])
    );
});

//change password
router.patch("/:id", async (req, res) => {
  const session = await User.startSession();

  session.startTransaction();

  try {

    const user = await User.findById(req.body.id);

    if (!user) {
      res.status(404).send("user with specific id not found");
      return;
    }

    const isvalid = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isvalid) {
      res.status(400).send("Invalid old password!");
      return;
    }

    if(req.body.oldPassword === req.body.newPassword){
      res.status(400).send("New password cannot be the same as your old password");
      return;
    
    }


    const salt = await bcrypt.genSalt(10);
    encryptedPassword = await bcrypt.hash(req.body.newPassword, salt);

    user.password= encryptedPassword;
    
    await user.save();

    if (user.role == "student") {
      await StudentPaper.updateMany(
        { "student._id": user._id },
        { $set: { student: user } }
      );
    }

    res
      .status(200)
      .send(
        lodash.pick(user, [
          "_id",
          "firstName",
          "lastName",
          "email",
          "phone",
          "userName",
          "role",
        ])
      );
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

//edit profile
router.post("/editProfile", async (req, res) => {
  // let { error } = validateUser(req.body);
  // if (error) {
  //   res.status(400).send(error.details[0].message);
  //   return;
  // }

  const session = await User.startSession();

  session.startTransaction();

  try {
    const user = await User.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          firstName: req.body.firstname,
          lastName: req.body.lastname,
          email: req.body.email,
          phone: req.body.phone,
          userName: req.body.username,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!user) {
      res.status(404).send("user with specific id not found");
      return;
    }

    if (user.role == "student") {
      await StudentPaper.updateMany(
        { "student._id": user._id },
        { $set: { student: user } }
      );
      await StudentAnswer.updateMany(
        { "student._id": user._id },
        {
          $set: {
            "student.firstName": user.firstName,
            "student.lastName": user.lastName,
            "student.email": user.email,
            "student.phone": user.phone,
            "student.userName": user.userName,
          },
        }
      );
    }

    res
      .status(200)
      .send(
        lodash.pick(user, [
          "_id",
          "firstName",
          "lastName",
          "email",
          "phone",
          "userName",
          "role",
        ])
      );
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

//update user
router.put("/:id", async (req, res) => {
  // let { error } = validateUser(req.body);
  // if (error) {
  //   res.status(400).send(error.details[0].message);
  //   return;
  // }

  const session = await User.startSession();

  session.startTransaction();

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          firstName: req.body.firstname,
          lastName: req.body.lastname,
          email: req.body.email,
          phone: req.body.phone,
          userName: req.body.username,
          role: req.body.role,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!user) {
      res.status(404).send("user with specific id not found");
      return;
    }

    if (user.role == "student") {
      await StudentPaper.updateMany(
        { "student._id": user._id },
        { $set: { student: user } }
      );
      await StudentAnswer.updateMany(
        { "student._id": user._id },
        {
          $set: {
            "student.firstName": user.firstName,
            "student.lastName": user.lastName,
            "student.email": user.email,
            "student.phone": user.phone,
            "student.userName": user.userName,
          },
        }
      );
    }

    res
      .status(200)
      .send(
        lodash.pick(user, [
          "_id",
          "firstName",
          "lastName",
          "email",
          "phone",
          "userName",
          "role",
        ])
      );
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

//delete user
router.delete("/:id", async (req, res) => {
  const session = await User.startSession();

  session.startTransaction();

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send("User not exist....");
      return;
    }

    if (user.role == "student") {
      await StudentPaper.deleteMany({ "student._id": user._id });
    }
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(400).send("User not deleted..");
      return;
    }

    res
      .status(200)
      .send(
        lodash.pick(user, [
          "firstName",
          "lastName",
          "_id",
          "email",
          "phone",
          "userName",
          "role",
        ])
      );
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
});

//soft delete user
router.post("/softDeleteUser", async (req, res) => {
  const user = await User.findById(req.body.userId);

  if (!user) {
    res.status(404).send("user with specific id not found");
    return;
  }
  user.isActive = !user.isActive;

  await user.save();

  res
    .status(200)
    .send(
      lodash.pick(user, [
        "_id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "userName",
        "role",
        "isActive",
      ])
    );
});

//forget password
router.post("/forgotPassword", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(404).send("user not found with given email id");

  const token = jwt.sign({ _id: user._id }, "$/$/$/hdgf$GDJGSJBGFh#oNMJBJKF", {
    expiresIn: "20m",
  });
  const html = `
  <body>
  <div style="width: 100%; padding: 20px;">

      <p>
          Hello ${printText(user.firstName + " " + user.lastName)},

      </p>
      <p>
          Kindly find the password reset link below :

      </p>
      <br/>
      <div>
         
              <a style="text-decoration:none;border:1px solid #333; padding:10px 10px;" href="http://localhost:3000/resetPassword/${token}">Reset Password Link</a>
         
      </div>

  </div>
</body>
  
  
  `;

  sendEmail(user.email, "Forgot Password - EMS", html);

  user.resetPasswordLink = token;

  await user.save();

  res.status(200).send();
});



//reset password
router.post("/resetPassword", async (req, res) => {
  const { password, token } = req.body;

  try {
    const decode = jwt.verify(token, "$/$/$/hdgf$GDJGSJBGFh#oNMJBJKF");
    
    const user = await User.findById(decode._id);
    if (!user) return res.status(404).send("user not found");

    const salt = await bcrypt.genSalt(10);
    if (token && token.toString() === user.resetPasswordLink.toString()) {
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordLink = "";
      await user.save();

      const html = `
    <body>
      <div>
          <p>
              Dear ${printText(user.firstName + " " + user.lastName)},
          </p>
          <p>
              Your password reset request is implemented successfully...!
          </p>
          <p>
              Please login with your newly set password.
          </p>
          <br/>
          <div>
           
              <a style="text-decoration:none;border:1px solid #333; padding:10px 10px;" href="http://localhost:3000/login">Login</a>
         
      </div>
      </div>
  </body>
  
    
    
    `;

      sendEmail(user.email, "Reset Password Success - EMS", html);
      res.status(200).send("Password reset successfully...");
    } else {
      res.status(400).send("Invalid reset token or It is expired");
    }
  } catch (error) {
    res.status(400).send("Invalid reset token or It is expired");
  }

  // return;
});

module.exports = router;
