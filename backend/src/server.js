require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initializeSocket } = require('./sockets');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible from controllers
app.set('io', io);

// Start server
server.listen(PORT, () => {
  logger.info(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║   🚀 SkillForge API Server                               ║
  ║                                                          ║
  ║   📍 Environment: ${process.env.NODE_ENV || 'development'}                              ║
  ║   🌐 Server: http://localhost:${PORT}                       ║
  ║   📚 API Docs: http://localhost:${PORT}/api-docs            ║
  ║   ❤️  Health: http://localhost:${PORT}/api/v1/health         ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => logger.info('💥 Process terminated!'));
});