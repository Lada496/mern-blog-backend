const mongoose = require("mongoose");

const Scheme = mongoose.Schema;

const commentSchema = new Scheme({
  comment: { type: String, required: true },
  postId: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
  name: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Comment", commentSchema);
