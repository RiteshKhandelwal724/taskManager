const express = require("express");
const User = require("../mode/user");
const auth = require("../middleware/auth");
const router = new express.Router();
const multer = require("multer");
const {sendWelcomeMail}=require('../emails/account');
const {sendExitMail}=require('../emails/account')


const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("file is not of a correct format"));
    }
    cb(undefined, true);
  },
});

router.post("/user", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    sendWelcomeMail(user.email,user.name)

    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    await user.save();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.post("/user/logout/all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/user/me", auth,async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedProperties = ["name", "email", "age", "password"];
  const isValidOperation = updates.every((update) => {
    return allowedProperties.includes(update);
  });

  if (!isValidOperation) {
    throw res.status(400).send({ Error: "Invalid Updates" });
  }

  try {
    req.user.forEach((update) => {
      return (req.user[update] = req.body[update]);
    });
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.delete("/user/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendExitMail(req.user.email,req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer=sharp(req.user.avatar).resize({width:250,height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
router.delete("user/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await user.save();
  res.send();
});
router.get("user/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send(e);
  }
});

module.exports = router;
