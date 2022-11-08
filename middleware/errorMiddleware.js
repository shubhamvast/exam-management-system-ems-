const winston = require("winston");
module.exports = function (err,req,res,next){
   winston.error("Something failed.. :"+ err.message);
   return res.status(500).send("Something failed.. :"+ err.message);
}