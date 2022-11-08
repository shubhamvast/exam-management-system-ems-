const config = require("config");

const mongoose = require("mongoose");
require("dotenv").config();

module.exports = async function () {
  await mongoose.connect(config.get("database_url"));
  console.log("connected to " + config.get("database_url"));
};
