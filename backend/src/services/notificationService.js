const { Notification } = require('../models');
const logger = require('../utils/logger');

const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
  referenceId = null,
  referenceModel = null,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      referenceId,
      referenceModel,
    });

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

const markAllAsRead = async userId => {
  return await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = { createNotification, markAsRead, markAllAsRead };