const express = require("express");
const { check } = require("express-validator");

const postsController = require("../controllers/posts.controller");
const fileUpload = require("../middleware/file-upload");
const { verifyUser } = require("../middleware/authenticate");
const router = express.Router();

router.get("/", postsController.getAllPosts);
// router.get("/user/:uid", postsController.getPostsByUserId);
router.get("/:pid", postsController.getPostById);
router.get("/myposts/posts", verifyUser, postsController.getMyPosts);

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
router.post(
  "/:pid",
  verifyUser,
  [
    check("title").not().isEmpty(),
    check("body").isLength({ min: 5 }),
    check("date").not().isEmpty(),
    check("image").not().isEmpty(),
  ],
  postsController.postEditPost
);
router.patch("/likes/:pid", postsController.updateLikes);

router.delete("/:pid", verifyUser, postsController.deletePost);

module.exports = router;
