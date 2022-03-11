const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");

const Post = require("../models/post");
const Comment = require("../models/comment");

exports.getCommentByPostId = async (req, res, next) => {
  const postId = req.params.pid;
  let postWithComments;
  try {
    postWithComments = await Post.findById(postId).populate({
      path: "comments",
      options: {
        sort: { _id: -1 },
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Fetching comments failed, please try again later.",
      500
    );
    return next(error);
  }
  if (!postWithComments) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }
  res.json({
    comments: postWithComments.comments.map((comment) =>
      comment.toObject({ getters: true })
    ),
  });
};

exports.postComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const postId = req.params.pid;
  const { comment, date } = req.body;
  const { name, _id: userId } = req.user;
  const createdComment = new Comment({
    comment,
    date,
    name,
    userId,
    postId,
  });
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Creating comment failed, please try again.",
      500
    );
    return next(error);
  }
  if (!post) {
    const error = new HttpError("Could not find post for provided id.", 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdComment.save({ session: sess });
    post.comments.push(createdComment);
    await post.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating comment failed, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ comment: createdComment.toObject({ getters: true }) });
};
