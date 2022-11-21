"use strict";
const nodemailer = require("nodemailer");
require("dotenv").config();


module.exports = function (to, subject, html) {
  // async..await is not allowed in global scope, must use a wrapper

  async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.email, // generated ethereal user
        pass: process.env.password, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Exam Management System" <shubhamm@valueaddsofttech.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line

      html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  }

  main().catch(console.error);
};
