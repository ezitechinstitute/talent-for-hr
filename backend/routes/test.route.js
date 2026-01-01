const testRouter = require("express").Router();

testRouter.get("/test", (req, res) => {
  res.send("Hello from Testing Express");
});


module.exports = testRouter