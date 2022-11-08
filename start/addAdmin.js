const { User } = require("../Model/userModel");

const AdminDetails = {
  firstName: "shubham",
  lastName: "mangore",
  email: "shubham@gmail.com",
  phone: "1234567890",
  userName: "_shubham_mangore",
  password: "12345678",
  role: "admin",
};

module.exports = async function addAdmin(app) {
  const admin = await User.find({ userName: AdminDetails.userName });
  if (admin.length == 0) {
    User.insertMany([AdminDetails]);
  } 
};
