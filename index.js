import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import router from "./router.js";
import connection from "./connection.js";

const app = express();

// 🔥 FIX __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// Static folder
app.use("/imgUploads", express.static(path.join(__dirname, "imgUploads")));

// Routes
app.use(router);

// DB connection
connection();

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running successfully on port ${PORT}`);
});