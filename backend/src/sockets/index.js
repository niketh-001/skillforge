const { Server } = require('socket.io');
const logger = require('../utils/logger');
const authSocket = require('./authSocket');
const chatHandler = require('./chatHandler');
const notificationHandler = require('./notificationHandler');

let io;

const initializeSocket = server => {
  io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? [process.env.CLIENT_URL]
          : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(authSocket);

  io.on('connection', socket => {
    logger.info(`✅ User connected: ${socket.user._id} (${socket.id})`);

    // Join user's personal room for notifications
    socket.join(socket.user._id.toString());

    // Register handlers
    chatHandler(io, socket);
    notificationHandler(io, socket);

    socket.on('disconnect', () => {
      logger.info(`❌ User disconnected: ${socket.user._id} (${socket.id})`);
    });
  });

  // Store io instance for use in controllers
  io.on('connection', () => {});

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initializeSocket, getIO };