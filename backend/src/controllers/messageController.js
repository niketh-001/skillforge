const { Message, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get conversations list
// @route   GET /api/v1/messages/conversations
// @access  Private
exports.getConversations = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const userIds = conversations.map(c => c._id);
  const users = await User.find({ _id: { $in: userIds } }).select('name avatar');

  const userMap = users.reduce((acc, user) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {});

  const formatted = conversations.map(c => ({
    user: userMap[c._id.toString()],
    lastMessage: c.lastMessage,
    unreadCount: c.unreadCount,
  }));

  res.status(200).json(new ApiResponse(200, { conversations: formatted }));
});

// @desc    Get messages with a user
// @route   GET /api/v1/messages/:userId
// @access  Private
exports.getMessages = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    $or: [
      { senderId: req.user._id, receiverId: userId },
      { senderId: userId, receiverId: req.user._id },
    ],
  })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // Mark as read
  await Message.updateMany(
    { senderId: userId, receiverId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  const total = await Message.countDocuments({
    $or: [
      { senderId: req.user._id, receiverId: userId },
      { senderId: userId, receiverId: req.user._id },
    ],
  });

  res.status(200).json(
    new ApiResponse(200, {
      messages: messages.reverse(),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});

// @desc    Send message
// @route   POST /api/v1/messages
// @access  Private
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { receiverId, content } = req.body;

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return next(new AppError('Receiver not found', 404));
  }

  const message = await Message.create({
    senderId: req.user._id,
    receiverId,
    content,
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar');

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(receiverId).emit('receive_message', populated);
  }

  res.status(201).json(new ApiResponse(201, { message: populated }, 'Message sent'));
});

// @desc    Get unread count
// @route   GET /api/v1/messages/unread-count
// @access  Private
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Message.countDocuments({
    receiverId: req.user._id,
    isRead: false,
  });

  res.status(200).json(new ApiResponse(200, { count }));
});