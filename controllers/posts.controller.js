const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Post = require("../models/post");
const User = require("../models/user");

exports.getAllPosts = (req, res, next) => {
  Post.find()
    .sort({ _id: -1 })
    .find((err, data) => {
      if (err) {
        const error = new HttpError(
          "Something went wrong, could not find posts.",
          500
        );
        return next(error);
      }
      // console.log(data);
      res.json({ posts: data.map((post) => post.toObject({ getters: true })) });
    });
};

exports.getPostById = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a post.",
      500
    );
    return next(error);
  }
  if (!post) {
    const error = new HttpError(
      "Could not find post for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ post: post.toObject({ getters: true }) });
};

exports.getMyPosts = async (req, res, next) => {
  //   const userId = req.params.uid;
  const { _id: userId } = req.user;
  let userWithPosts;
  try {
    userWithPosts = await User.findById(userId).populate({
      path: "posts",
      options: {
        sort: { _id: -1 },
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }
  if (!userWithPosts || userWithPosts.posts.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }
  res.json({
    posts: userWithPosts.posts.map((post) => post.toObject({ getters: true })),
  });
};
exports.getPostsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPosts;
  try {
    userWithPosts = await User.findById(userId).populate({
      path: "posts",
      options: {
        sort: { _id: -1 },
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later",
      500
    );
    return next(error);
  }
  if (!userWithPosts) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }
  res.json({
    posts: userWithPosts.posts.map((post) => post.toObject({ getters: true })),
  });
};

exports.postPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, body, date, image } = req.body;
  const { name, _id: userId } = req.user;
  const createdPost = new Post({
    title,
    body,
    name,
    date,
    image,
    userId,
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Creating post failed, please try again.", 500);
    return next(error);
  }
  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ post: createdPost });
};
exports.postEditPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, body, image, date } = req.body;
  const postId = req.params.pid;
  const { _id: userId } = req.user;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  if (post.userId.toString() !== userId.toString()) {
    const error = new HttpError("You are not allowed to edit this post.", 401);
    return next(error);
  }
  post.title = title;
  post.body = body;
  post.image = image;
  post.date = date;
  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update post.",
      500
    );
    return next(error);
  }
  res.status(200).json({ post: post.toObject({ getters: true }) });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.pid;
  const { _id: userId } = req.user;

  let post;
  try {
    post = await Post.findById(postId).populate("userId");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }
  if (!post) {
    const error = new HttpError("Could not find post for this id.", 404);
    return next(error);
  }

  if (post.userId.id !== userId.toString()) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      401
    );
    return next(error);
  }
  //   const imagePath = post.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.remove({ session: sess });
    post.userId.posts.pull(post);
    await post.userId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }
  //   fs.unlink(imagePath, (err) => {
  //     console.log(err);
  //   });
  res.status(200).json({ message: "Deleted post." });
};

exports.updateLikes = async (req, res, next) => {
  const postId = req.params.pid;
  const { userId } = req.body;
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update like.",
      500
    );
    return next(error);
  }

  const userIdIndex = post.likes.indexOf(userId.toString());
  if (userIdIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.pull(userId);
  }
  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update likes.",
      500
    );
    return next(error);
  }
  res.status(200).json({ post: post.toObject({ getters: true }) });
};
