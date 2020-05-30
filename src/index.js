const express = require("express");
const port=process.env.PORT
require("./db/mongoose");
const userRouter = require("./routeElements/user");
const taskRouter = require("./routeElements/task");
const app = express();


app.use(express.json());
app.use(taskRouter);
app.use(userRouter);


app.listen(port, () => {
  console.log("The task app is on "+ port);
});
