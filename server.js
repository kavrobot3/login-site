// server.js
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());

// MongoDB model
mongoose.connect(process.env.MONGO_URI);
const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String
}));

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send("User already exists");
    const user = new User({ email, password: hashed });
    await user.save();
    res.status(200).send("User created");
  } catch {
    res.status(500).send("Error signing up");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send("Wrong password");
  res.status(200).send("Login successful");
});

app.listen(3000, () => console.log("Server running on port 3000"));
