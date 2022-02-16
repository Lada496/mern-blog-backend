const express = require("express");
const { check } = require("express-validator");

const postsController = require("../controllers/posts.controller");
const fileUpload = require("../middleware/file-upload");
const { verifyUser } = require("../middleware/authenticate");
const router = express.Router();

router.get("/", postsController.getAllPosts);
// router.get("/user/:uid", postsController.getPostsByUserId);
router.get("/myposts", verifyUser, postsController.getPostsByUserId);

router.post(
  "/",
  verifyUser,
  //   fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("body").isLength({ min: 5 }),
    check("date").not().isEmpty(),
    check("image").not().isEmpty(),
    // check("userId").not().isEmpty(),
  ],
  postsController.postPost
);

module.exports = router;
