const express = require("express");
const { check } = require("express-validator");

const commentController = require("../controllers/comment.controller");

const { verifyUser } = require("../middleware/authenticate");

const router = express.Router();

router.get("/:pid", commentController.getCommentByPostId);

router.post(
  "/:pid",
  verifyUser,
  [check("comment").not().isEmpty(), check("date").not().isEmpty()],
  commentController.postComment
);

module.exports = router;
