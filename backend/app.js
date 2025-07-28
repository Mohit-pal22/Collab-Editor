const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documentRoutes.js");
const protectedRoutes = require('./routes/protected');
const socketHandler = require('./socket/socketHandler'); // 👈 NEW

require("dotenv").config();

const app = express();
const allowedOrigins = ["http://localhost:3000"];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin allowed
    } else {
      console.warn(`CORS Blocked: ${origin}`);
      callback(null, false); // instead of throwing
    }
  },
  credentials: true
}));


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/documents", documentRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin allowed
    } else {
      console.warn(`CORS Blocked: ${origin}`);
      callback(null, false); // instead of throwing
    }
    },
    credentials: true
  }
});


// 🔌 Use socket handler here
socketHandler(io);

// Connect DB and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
