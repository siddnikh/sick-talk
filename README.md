# Sick-talk Backend 🚀

 This is the **Sicktalk Backend**. This is the server side of a dope chat app built with Node.js and Express. It's got all the essentials to keep your chats smooth and real-time. 💬

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features ✨

- **Real-time Messaging**: Chat with your friends in real-time using WebSockets! 🔥
- **User Authentication**: Secure logins and sign-ups with JWT (JSON Web Tokens).
- **File Uploads**: Send images and files like a pro with Multer.
- **Rate Limiting**: Keep the trolls out with express-rate-limit.
- **Logging**: Track everything with Morgan and Winston—no secrets here!

## Getting Started 🏁

### Prerequisites

Make sure you’ve got these installed:

- Node.js (v14 or higher)
- MongoDB (for your database)
- Redis (for caching that good stuff)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/sick-talk-backend.git
   ```

2. Jump into the project folder:
   ```bash
   cd sick-talk-backend
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and drop your environment variables in there:
   ```
   PORT=4000
   MONGODB_URI=your_mongodb_uri
   REDIS_URL=your_redis_url
   JWT_SECRET=your_jwt_secret
   ```

5. Fire up the server:
   ```bash
   npm start
   ```

Boom! Your server's live at `http://localhost:4000`. 🎉

## Tech Stack 🛠️

- **Node.js**: The backbone for building scalable network apps.
- **Express**: The minimalist web framework that gets stuff done.
- **MongoDB**: Your go-to NoSQL database for users and messages.
- **Redis**: The caching wizard to speed things up.
- **Socket.io**: Making real-time communication a breeze.

## API Endpoints 📡

Here’s the lowdown on the main API endpoints:

### Authentication

- **POST /auth/login**: Get your users logged in.
- **POST /auth/register**: Sign up new users.

### Chat

- **GET /chat/messages/:id**: Fetch messages for a specific chat.
- **POST /chat/messages**: Send a fresh message.

### Users

- **GET /users**: Grab a list of all users.

## Contributing 🤝

Wanna jump in? Sweet! Just fork the repo, and add some pull requests c:

---