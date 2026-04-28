const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "SkiTrack backend API is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);

module.exports = app;