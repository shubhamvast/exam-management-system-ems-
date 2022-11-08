require("dotenv").config();

const express = require("express");
const app = express();

//import logging
const log = require("./start/logging");
log();

//configuring cors
require("./start/cors")(app);

//checked jwt key is present or not
const checkJwt = require("./start/config");
checkJwt();


//connecting to database
require("./start/db")()

//dynamically adding Admin
require("./start/addAdmin")(app)

//importing routes
require("./start/route")(app);


//setting port 
require("./start/port")(app);