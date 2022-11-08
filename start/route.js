require("express-async-errors");

const subjectRouter = require("../routes/subject");
const topicRouter = require("../routes/topics");
const userRouter = require("../routes/user");
const questionRouter = require("../routes/question");
const answerOptionRouter = require("../routes/answerOption");
const paperRouter = require("../routes/paper");
const paperQuestionRouter = require("../routes/paperQuestion");
const studentPaper = require("../routes/studentPaper");
const studentAnswer = require("../routes/studentAnswers");
const error = require("../middleware/errorMiddleware");
const login = require("../routes/login");
module.exports = function (app) {
  //subjects routers
  app.use("/api/subjects", subjectRouter);

  //topics routers
  app.use("/api/topics", topicRouter);

  //users routers
  app.use("/api/users",userRouter);

  //questions routers
  app.use("/api/questions",questionRouter)

  //answerOption routers
  app.use("/api/answerOptions",answerOptionRouter)

  //paper routers
  app.use("/api/papers",paperRouter)

  //paperQuestion routers
  app.use("/api/paperQuestions",paperQuestionRouter)

  //studentPaper routers
  app.use("/api/studentPapers",studentPaper);

  //studentAnswer routers
  app.use("/api/studentAnswers",studentAnswer)

  //login routes
  app.use("/api/login",login)


  //handling errors 
  app.use(error)
};
