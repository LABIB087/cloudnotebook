const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser")
const JWT_SECRET = "labibahammed087$#@";

//ROUTE1:  create a user using : POST "/api/auth/createuser". Dosen't require login
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("password", "Password minimum length is 8"),
    body("email", "Enter a valid email").isEmail(),
  ],
  async (req, res) => {
    success= false;
    // if there ate errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    // check whether the user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({success, error: "User already exists" });
      }
      const salt = await bycrypt.genSalt(10);

      const secPass = await bycrypt.hash(req.body.password, salt);
      // creating new users

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        date: req.body.date,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success= true;
      res.json({success, authtoken: authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occurred");
    }
  }
);

//ROUTE2:  login a user using : POST "/api/auth/login". Dosen't require login

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // if there ate errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // check whether the user with this email exists already
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success= false;
        return res.status(400).json({
          success, error: "Please try to login with correct email and password",
        });
      }
      const passwordCompare = await bycrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success, error: "Please try to login with correct email and password",
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success, authtoken: authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Something went wrong. Please try again");
    }
  }
);

//ROUTE3:  Get loggedin user details using : POST "/api/auth/getuser".require login

router.post("/getuser", fetchuser ,async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong. Please try again");
  }
});
module.exports = router;
