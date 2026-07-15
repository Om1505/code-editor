const express = require("express");
const router = express.Router();

const { generateContent } = require("../controllers/geminiController");

router.post("/chat", (req, res, next) => {
  console.log("Gemini /chat route reached");
  next();
}, generateContent);

module.exports = router;