require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const geminiRoute = require("./routes/geminiRoute");
console.log(geminiRoute);

const app = express();
const PORT = process.env.PORT || 5000;

// ================= Middleware =================

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// ================= Health Check =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JDoodle Backend is running 🚀",
  });
});

// ================= JDoodle =================

app.post("/execute", async (req, res) => {
  try {
    const { script, language, versionIndex, stdin } = req.body;

    if (!script || !language) {
      return res.status(400).json({
        error: "Script and language are required.",
      });
    }

    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        script,
        language,
        versionIndex: versionIndex || "0",
        stdin: stdin || "",
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("JDoodle Error:", err.response?.data || err.message);

    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
});

// ================= Gemini =================

app.use("/api/v1/gemini", geminiRoute);

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================= Start Server =================

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});