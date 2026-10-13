const { Message } = require('../models');

const chatHandler = (io, socket) => {
  // Join a conversation room
  socket.on('join_conversation', otherUserId => {
    const roomId = [socket.user._id.toString(), otherUserId].sort().join('_');
    socket.join(roomId);
  });

  // Send message via socket
  socket.on('send_message', async ({ receiverId, content }) => {
    try {
      const message = await Message.create({
        senderId: socket.user._id,
        receiverId,
        content,
      });

      const populated = await Message.findById(message._id)
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar');

      const roomId = [socket.user._id.toString(), receiverId].sort().join('_');

      io.to(roomId).emit('receive_message', populated);
      io.to(receiverId).emit('receive_message', populated);
    } catch (error) {
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ receiverId }) => {
    const roomId = [socket.user._id.toString(), receiverId].sort().join('_');
    socket.to(roomId).emit('user_typing', { userId: socket.user._id });
  });

  socket.on('stop_typing', ({ receiverId }) => {
    const roomId = [socket.user._id.toString(), receiverId].sort().join('_');
    socket.to(roomId).emit('user_stop_typing', { userId: socket.user._id });
  });

  // Mark messages as read
  socket.on('mark_read', async ({ senderId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId: socket.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      io.to(senderId).emit('messages_read', { readerId: socket.user._id });
    } catch (error) {
      // Silent fail
    }
  });
};

module.exports = chatHandler;