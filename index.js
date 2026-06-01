import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import router from "./router.js";
import connection from "./connection.js";
import Role from "./model/Role.js";



const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// Static folder
app.use("/imgUploads", express.static(path.join(__dirname, "imgUploads")));

// Routes (all routes are already defined in router.js)
app.use(router);   // ← this already includes /role-permissions/*

// DB connection
await connection();

// Seed default roles (no permissions field)
const seedRoles = async () => {
  const roles = [];
  for (const name of roles) {
    const exists = await Role.findOne({ name });
    if (!exists) {
      await Role.create({ name });
      console.log(`✅ Created role: ${name}`);
    }
  }
};
await seedRoles();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running successfully on port ${PORT}`);
});