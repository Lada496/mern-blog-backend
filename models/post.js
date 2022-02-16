const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  likes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Post", postSchema);
