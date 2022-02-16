const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
require("./utils/db");
require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
require("./middleware/authenticate");

//import router here
const usersRoutes = require("./routes/users.route");
const postsRoutes = require("./routes/posts.route");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(cookieParser(process.env.COOKIE_SECRET));

const whitelist = process.env.WHITELIST_DOMAINS
  ? process.env.WHITELIST_DOMAINS.split(",")
  : [];
const corsOption = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOption));
app.use(passport.initialize());

// test
app.get("/", (req, res) => {
  res.send({ status: "success" });
});

app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

const server = app.listen(process.env.PORT || 8000, () => {
  const port = server.address().port;
  console.log("App started at port: ", port);
});
