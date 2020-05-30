const Task = require("../mode/task");
const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");

router.post("/task", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get("/task", auth, async (req, res) => {
  const match = {};
  const sort={}
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if(req.query.sortBy){
    const part=req.query.sortBy.split(':');
    sort[part[0]]=sort[part[1]]==="desc"?1:-1
  }
  try {
    // const tasks = await Task.find({owner:req.user._id});
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort 
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({ _id, owner: req.body._id });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.patch("/task/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedProperties = ["description", "completed"];
  const isValidOperation = updates.every((update) => {
    return allowedProperties.includes(update);
  });
  if (!isValidOperation) {
    return res.status(404).send();
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
