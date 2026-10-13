const notificationHandler = (io, socket) => {
  // User is already in their own room (userId) from index.js
  // Notifications are emitted from the notificationService

  socket.on('mark_notification_read', async ({ notificationId }) => {
    // Handled via REST API, but can also be done here
  });
};

module.exports = notificationHandler;