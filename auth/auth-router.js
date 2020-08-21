const router = require('express').Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../users/users-model.js");
const constants = require('../config/constants')

//usually in users-service
function isValid(user) {
  return Boolean(user.username && user.password && typeof user.password === "string");
}
 
router.post('/register', (req, res) => {
  const credentials = req.body;

  if (isValid(credentials)) {
      const rounds = process.env.BCRYPT_ROUNDS || 5;
      const hash = bcryptjs.hashSync(credentials.password, rounds);
      credentials.password = hash;
      Users.add(credentials)
          .then(user => {
              res.status(201).json({ data: user });
          })
          .catch(error => {
              res.status(500).json({ message: error.message });
          });
  } else {
      res.status(400).json({
          message:
              "please provide username and password",
      });
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (isValid(req.body)) {
      Users.findBy({ username: username })
          .then(([user]) => {
              if (user && bcryptjs.compareSync(password, user.password)) {
                const token = signToken(user);

                  res.status(200).json({
                      message: "You are in!",
                      token,
                  });
              } else {
                  res.status(401).json({ message: "Invalid credentials" });
              }
          })
          .catch(error => {
              res.status(500).json({ message: error.message });
          });
  } else {
      res.status(400).json({
          message:
              "please provide username and password",
      });
  }
});

function signToken(user) {
  const payload = {
      subject: user.id,
      username: user.username,
      department: user.department,
  };

  const secret = constants.jwtSecret;

  const options = {
      expiresIn: "1d",
  };

  return jwt.sign(payload, secret, options);
}

module.exports = router;
