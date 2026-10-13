const { Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { markAsRead, markAllAsRead } = require('../services/notificationService');

// @desc    Get notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId: req.user._id }),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markRead = catchAsync(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user._id);

  res.status(200).json(new ApiResponse(200, { notification }, 'Marked as read'));
});

// @desc    Mark all as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
exports.markAllRead = catchAsync(async (req, res) => {
  await markAllAsRead(req.user._id);

  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = catchAsync(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});