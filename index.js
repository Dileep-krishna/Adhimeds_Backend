require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const router = require("./router");
const connection = require("./connection");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Static folder
app.use("/imgUploads", express.static(path.join(__dirname, "imgUploads")));

// Routes
app.use(router);

// 🔥 IMPORTANT FIX (Render PORT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running successfully on port ${PORT}`);
});