const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();

/* ========================
   MIDDLEWARE
======================== */
app.use(cors({
  origin: "*", // change to frontend URL in production
  credentials: true
}));

app.use(express.json());

/* ========================
   DATABASE CONNECTION
======================== */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

/* ========================
   ROUTES
======================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/chat", require("./routes/chatRoutes")); // NEW CHAT ROUTE

/* ========================
   SOCKET.IO SETUP
======================== */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // change in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId.toString());
    console.log("Joined room:", userId);
  });

  socket.on("sendMessage", (data) => {
    const sender = data.sender.toString();
    const receiver = data.receiver.toString();

    console.log("Sending message:", data);

    // Send to receiver
    io.to(receiver).emit("receiveMessage", data);

    // Send back to sender
    io.to(sender).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});
/* ========================
   SERVER START
======================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});