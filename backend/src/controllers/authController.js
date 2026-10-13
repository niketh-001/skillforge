const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashToken,
} = require('../services/tokenService');
const { sendPasswordResetEmail } = require('../services/emailService');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', 409));
  }

  const user = await User.create({ name, email, password, role });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
      },
      'Registration successful'
    )
  );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  user.lastLogin = new Date();
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
      },
      'Login successful'
    )
  );
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed')
  );
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user.getPublicProfile() }));
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  const { resetToken, hashedToken } = generateResetToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json(new ApiResponse(200, null, 'Password reset email sent'));
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email. Please try again later.', 500));
  }
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = hashToken(req.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(200).json(
    new ApiResponse(200, { user: user.getPublicProfile(), accessToken, refreshToken }, 'Password reset successful')
  );
});