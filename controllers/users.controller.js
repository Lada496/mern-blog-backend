const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const HttpError = require("../models/http-error");
const {
  COOKIE_OPTIONS,
  getToken,
  getRefreshToken,
} = require("../middleware/authenticate");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.status(500).send(err);
      } else {
        user.name = req.body.name;
        const token = getToken({ _id: user._id });
        const refreshToken = getRefreshToken({ _id: user._id });
        user.refreshToken.push({ refreshToken });
        user.save((err, user) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
          }
        });
      }
    }
  );
};

exports.login = (req, res, next) => {
  const token = getToken({ _id: req.user._id });
  const refreshToken = getRefreshToken({ _id: req.user._id });

  User.findById(req.user._id)
    .then((user) => {
      user.refreshToken.push({ refreshToken });
      user.save((err, user) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
          res.send({ success: true, token });
        }
      });
    })
    .catch((err) => next(err));
};

exports.refreshToken = (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const userId = payload._id;
      User.findOne({ _id: userId })
        .then((user) => {
          if (user) {
            const tokenIndex = user.refreshToken.findIndex(
              (item) => item.refreshToken === refreshToken
            );

            if (tokenIndex === -1) {
              res.status(401).send("Unauthorized");
            } else {
              const token = getToken({ _id: userId });
              const newRefreshToken = getRefreshToken({ _id: userId });
              user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
              user.save((err, user) => {
                if (err) {
                  res.status(500).send(err);
                } else {
                  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
                  res.send({ success: true, token });
                }
              });
            }
          } else {
            res.status(401).send("Unauthorized");
          }
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      res.status(401).send("Unauthorized");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
};

exports.getMyData = (req, res, next) => {
  res.send(req.user);
};

exports.logout = (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  User.findById(req.user._id)
    .then((user) => {
      const tokenIndex = user.refreshToken.findIndex(
        (item) => item.refreshToken === refreshToken
      );

      if (tokenIndex !== -1) {
        user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
      }

      user.save((err, user) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.clearCookie("refreshToken", COOKIE_OPTIONS);
          res.send({ success: true });
        }
      });
    })
    .catch((err) => next(err));
};
