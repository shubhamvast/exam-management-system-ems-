module.exports = function(){
    //check for jwtPrivateKey
if (!process.env.jwtPrivateKey) {
    console.log("jwt key is not defined..");
    process.exit(1);
  }
}