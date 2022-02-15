const mongoose = require("mongoose");
const url = process.env.MONGO_DB_CONNECTION;
const connect = mongoose.connect(url);
connect
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));
