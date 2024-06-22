require("dotenv").config();
const http = require("http");
const express = require("express");
const app = require("./app");
const logger = require("./config/logger");
const connectDB = require("./config/dbConfig");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/messageModel");
const { transformNewMessage } = require("./utils/transformers");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

if (process.env.PORT) {
  logger.info("env file loaded successfully! 💪");
} else {
  logger.error("Failed to load env file. ❌");
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const ensureUploadsDirectoryExists = () => {
  const dir = path.join(__dirname, "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware to authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: no token provided ❌"));
  }

  jwt.verify(token, process.env.JWT_SECRET || "secretKey", (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error ❌"));
    }
    socket.user = decoded;
    next();
  });
});

io.on("connection", (socket) => {
  logger.info(`New client connected: ${socket.user.id}`);

  socket.on("sendMessage", async (data) => {
    const { recipient, message } = data;
    const newMessage = {
      sender: socket.user.id,
      recipient,
      message,
      timestamp: new Date(),
    };

    try {
      await Message.create(newMessage);
      const messageToSend = await transformNewMessage(newMessage);
      io.emit("receiveMessage", messageToSend);
    } catch (error) {
      logger.error("Error saving message to database:", error);
    }
  });

  socket.on("uploadFile", async (data, callback) => {
    try {
      ensureUploadsDirectoryExists();
      const buffer = Buffer.from(data.file);
      const fileName = Date.now() + "-" + data.fileName;
      const filePath = path.join("uploads", fileName);

      fs.writeFile(filePath, buffer, async (err) => {
        if (err) {
          logger.error("Error saving file:", err);
          return callback({ error: "Error saving file" });
        }

        const fileUrl = `uploads/${fileName}`;

        const newMessage = {
          sender: socket.user.id,
          recipient: data.recipient,
          message: {
            type: "media",
            url: fileUrl,
          },
          timestamp: new Date(),
        };

        try {
          await Message.create(newMessage);
          callback({ url: fileUrl });
        } catch (error) {
          logger.error("Error saving message to database:", error);
          callback({ error: "Error saving message to database" });
        }
      });
    } catch (error) {
      logger.error("Error handling file upload:", error);
      callback({ error: "Error handling file upload" });
    }
  });

  socket.on("disconnect", () => {
    logger.warn(`Client disconnected: ${socket.user.id}`);
  });
});

server.listen(PORT, () => {
  connectDB();
  logger.info(`Server is running on port ${PORT} 🚀`);
});
