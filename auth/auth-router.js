const router = require("express").Router();
const bcryptjs = require("bcryptjs");

const Users = require("../users/user-model");

router.post("/register", (req, res) => {
  const credentials = req.body;
  const rounds = Number(process.env.HASH_ROUNDS) || 6;
  const hash = bcryptjs.hashSync(credentials.password, rounds);

  credentials.password = hash;

  Users.add(credentials)
    .then((user) => {
      res.status(201).json({ data: user });
    })
    .catch((error) => {
      res.json({ message: error.message });
    });
});

router.post("/login", (req, res) => {
  const credentials = req.body;

  Users.findBy({ username: credentials.username })
    .then((users) => {
      const user = users[0];

      if (user && bcryptjs.compareSync(credentials.password, user.password)) {
        req.session.username = user.username;

        res.status(200).json({
          message: "welcome",
          username: req.username,
        });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    })
    .catch((err) => res.json({ message: err.message }));
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "logout failed, please try later" });
      } else {
        res.status(204).end();
      }
    });
  } else {
    res.status(204).end();
  }
});

module.exports = router;
