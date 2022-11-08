const express = require("express");
const router = express.Router();
router.use(express.json());

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
  // let { error } = validateUser(req.body);
  // if (error) {
  //   res.status(400).send(error.details[0].message);
  //   return;
  // }

  const session = await User.startSession();

  session.startTransaction();

  try {
    const salt = await bcrypt.genSalt(10);
    encryptedPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          password: encryptedPassword,
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
          "isActive"
        ])
      );
 
});

module.exports = router;
