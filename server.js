// Your existing imports
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
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
// TODO: CHANGE ORIGIN
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e7,
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

const ensureUploadsDirectoryExists = () => {
  const dir = path.join(__dirname, "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Helper function to delete files older than 7 days
const deleteOldFiles = (directory, ageInDays) => {
  const now = Date.now();
  const ageInMs = ageInDays * 24 * 60 * 60 * 1000;

  fs.readdir(directory, (err, files) => {
    if (err) {
      return logger.error(`Error reading directory ${directory}:`, err);
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          return logger.error(`Error getting stats for file ${file}:`, err);
        }

        const fileAge = now - stats.mtimeMs; // Calculate file age
        if (fileAge > ageInMs) {
          fs.unlink(filePath, (err) => {
            if (err) {
              return logger.error(`Error deleting file ${file}:`, err);
            }
            logger.debug(`Deleted old file: ${file}`);
          });
        }
      });
    });
  });
};

// Schedule the cleanup task to run every week
cron.schedule("0 0 * * 0", () => {
  const uploadsDir = path.join(__dirname, "uploads");
  deleteOldFiles(uploadsDir, 7); // Delete files older than 7 days
  logger.debug("Scheduled cleanup of old images in uploads folder executed.");
});

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

      // Check the file extension to determine if it's an image
      const ext = path.extname(fileName).toLowerCase();
      let compressedBuffer = buffer;
      logger.debug("YO WE REACHED HERE");
      if ([".png", ".jpg", ".jpeg", ".heic"].includes(ext)) {
        try {
          // Compress the image based on its format
          if (ext === ".png") {
            compressedBuffer = await sharp(buffer)
              .png({ quality: 80 }) // Adjust quality as needed
              .toBuffer();
          } else {
            // Handle jpg and jpeg formats
            compressedBuffer = await sharp(buffer)
              .jpeg({ quality: 80 }) // Adjust quality as needed
              .toBuffer();
          }
        } catch (compressionError) {
          logger.error("Error compressing image:", compressionError);
          return callback({ error: "Error compressing image" });
        }
      }

      // Save the (possibly compressed) file
      fs.writeFile(filePath, compressedBuffer, async (err) => {
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
