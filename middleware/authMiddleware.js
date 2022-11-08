const jwt = require("jsonwebtoken");
const config = require("config");
require("dotenv").config();
module.exports = function(req,res,next){
    const token =  req.header("x-auth-token")
    console.log(token);
    if(!token) return res.status(401).send("Access denied");

    try{
        const decoded = jwt.verify(token,process.env.jwtPrivateKey);
        
        req.user = decoded
        next();
        
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send("Invalid token")
    }
}