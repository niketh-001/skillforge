const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({
    path: 'roadmaps',
    match: { isPublished: true },
    select: 'title description technologies enrollmentCount averageRating',
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json(new ApiResponse(200, { user: user.getPublicProfile() }));
});

// @desc    Update current user profile
// @route   PATCH /api/v1/users/me
// @access  Private
exports.updateMe = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'bio', 'githubUsername', 'linkedinUrl', 'portfolioUrl'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(new ApiResponse(200, { user: user.getPublicProfile() }, 'Profile updated'));
});

// @desc    Upload avatar
// @route   POST /api/v1/users/me/avatar
// @access  Private
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar
  if (user.avatarPublicId) {
    try {
      await deleteImage(user.avatarPublicId);
    } catch (error) {
      // Continue even if delete fails
    }
  }

  const { url, publicId } = await uploadImage(req.file.buffer, 'skillforge/avatars');

  user.avatar = url;
  user.avatarPublicId = publicId;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, { avatar: url }, 'Avatar uploaded successfully'));
});

// @desc    Delete avatar
// @route   DELETE /api/v1/users/me/avatar
// @access  Private
exports.deleteAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.avatarPublicId) {
    try {
      await deleteImage(user.avatarPublicId);
    } catch (error) {
      // Continue even if delete fails
    }
  }

  user.avatar = null;
  user.avatarPublicId = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, null, 'Avatar deleted'));
});

// @desc    Get mentors list
// @route   GET /api/v1/users/mentors
// @access  Public
exports.getMentors = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { role: 'mentor', isActive: true };

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { bio: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [mentors, total] = await Promise.all([
    User.find(query).select('name email avatar bio role createdAt').skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      mentors,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});