import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server as SocketServer } from "socket.io";

import router from "./router.js";
import connection from "./connection.js";
import Role from "./model/Role.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/imgUploads", express.static(path.join(__dirname, "imgUploads")));

// ---------- Socket.IO Setup ----------
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ✅ Make io available globally in the app
app.set('io', io);

// (Optional) Attach to req – but we will use req.app.get('io') in the controller
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ---------- Socket.IO connection handler ----------
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ---------- Routes ----------
app.use(router);

// ---------- Database & Seed ----------
await connection();

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

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});