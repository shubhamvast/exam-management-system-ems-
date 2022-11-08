const winston = require("winston");
require("winston-mongodb");
require("dotenv").config();
const config = require("config");

module.exports = function () {
  winston.configure({
    transports: [
      new winston.transports.File({ filename: "logfile.log" }),
      new winston.transports.Console(),
      new winston.transports.MongoDB({
        db: config.get("database_url"),
        options: { useUnifiedTopology: true },
      }),
    ],
  });

  process.on("uncaughtException", (err) => {
    winston.error("we have got an uncaught exception");
    console.log(err.message);
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  process.on("unhandledRejection", (err) => {
    winston.error("we have got an unhandled promise rejection");
    console.log(err.message);
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });
};