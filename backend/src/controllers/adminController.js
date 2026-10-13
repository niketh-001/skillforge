const { User, Roadmap, Enrollment, Submission } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const QueryBuilder = require('../utils/queryBuilder');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = catchAsync(async (req, res) => {
  const baseQuery = User.find().select('name email role isActive lastLogin createdAt');

  const features = new QueryBuilder(baseQuery, req.query)
    .filter()
    .search(['name', 'email'])
    .sort()
    .paginate();

  const [users, total] = await Promise.all([
    features.query,
    User.countDocuments(),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      users,
      meta: {
        page: features.page,
        limit: features.limit,
        total,
        totalPages: Math.ceil(total / features.limit),
      },
    })
  );
});

// @desc    Update user status
// @route   PATCH /api/v1/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json(new ApiResponse(200, { user }, 'User status updated'));
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role === 'admin') {
    return next(new AppError('Cannot delete admin users', 403));
  }

  await user.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getStats = catchAsync(async (req, res) => {
  const [totalUsers, mentees, mentors, totalRoadmaps, publishedRoadmaps, totalEnrollments, activeEnrollments, totalSubmissions, pendingSubmissions] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'mentee' }),
      User.countDocuments({ role: 'mentor' }),
      Roadmap.countDocuments(),
      Roadmap.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'submitted' }),
    ]);

  res.status(200).json(
    new ApiResponse(200, {
      users: { total: totalUsers, mentees, mentors },
      roadmaps: { total: totalRoadmaps, published: publishedRoadmaps },
      enrollments: { total: totalEnrollments, active: activeEnrollments },
      submissions: { total: totalSubmissions, pending: pendingSubmissions },
    })
  );
});

// @desc    Get all roadmaps (admin)
// @route   GET /api/v1/admin/roadmaps
// @access  Private/Admin
exports.getRoadmaps = catchAsync(async (req, res) => {
  const baseQuery = Roadmap.find().populate({ path: 'mentor', select: 'name email' });

  const features = new QueryBuilder(baseQuery, req.query)
    .filter()
    .search(['title', 'description'])
    .sort()
    .paginate();

  const [roadmaps, total] = await Promise.all([
    features.query,
    Roadmap.countDocuments(),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      roadmaps,
      meta: {
        page: features.page,
        limit: features.limit,
        total,
        totalPages: Math.ceil(total / features.limit),
      },
    })
  );
});