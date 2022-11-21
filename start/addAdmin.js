const { User } = require("../Model/userModel");
const bcrypt = require("bcrypt");

module.exports = async function addAdmin(app) {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("12345678", salt);

  const AdminDetails = {
    firstName: "shubham",
    lastName: "mangore",
    email: "shubhamm@valueaddsofttech.com",
    phone: "1234567890",
    userName: "_shubham_mangore",
    password: password,
    role: "admin",
  };
  const admin = await User.find({ userName: AdminDetails.userName });
  if (admin.length == 0) {
    User.insertMany([AdminDetails]);
  }
  const ExaminerDetails = {
    firstName: "dinkar",
    lastName: "nichal",
    email: "dinkarn@valueaddsofttech.com",
    phone: "1234567890",
    userName: "_dinkar_nichal",
    password: password,
    role: "examiner",
  };

  const examiner = await User.find({ userName: ExaminerDetails.userName });
  if (examiner.length == 0) {
    User.insertMany([ExaminerDetails]);
  }

  const PaperSetterDetails = {
    firstName: "prashant",
    lastName: "sabale",
    email: "prashants@valueaddsofttech.com",
    phone: "1234567890",
    userName: "_prashant_sabale",
    password: password,
    role: "paperSetter",
  };

  const paperSetter = await User.find({
    userName: PaperSetterDetails.userName,
  });
  if (paperSetter.length == 0) {
    User.insertMany([PaperSetterDetails]);
  }

  const StudentDetails = {
    firstName: "nitin",
    lastName: "nimangare",
    email: "nitinn@valueaddsofttech.com",
    phone: "1234567890",
    userName: "_nitin_nimangare",
    password: password,
    role: "student",
  };

  const student = await User.find({ userName: StudentDetails.userName });
  if (student.length == 0) {
    User.insertMany([StudentDetails]);
  }
};
