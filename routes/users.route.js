const express = require("express");
const { check } = require("express-validator");
const usersController = require("../controllers/users.controller");
const passport = require("passport");
const router = express.Router();
const { verifyUser } = require("../middleware/authenticate");

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("username").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", passport.authenticate("local"), usersController.login);

router.post("/refreshtoken", usersController.refreshToken);

router.get("/me", verifyUser, usersController.getMyData);

router.get("/logout", verifyUser, usersController.logout);

module.exports = router;
