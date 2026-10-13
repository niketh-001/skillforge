const { Roadmap, Enrollment } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const QueryBuilder = require('../utils/queryBuilder');

// @desc    Create roadmap
// @route   POST /api/v1/roadmaps
// @access  Private/Mentor
exports.createRoadmap = catchAsync(async (req, res) => {
  const roadmap = await Roadmap.create({
    ...req.body,
    mentorId: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { roadmap }, 'Roadmap created successfully'));
});

// @desc    Get all published roadmaps
// @route   GET /api/v1/roadmaps
// @access  Public
exports.getRoadmaps = catchAsync(async (req, res) => {
  const baseQuery = Roadmap.find({ isPublished: true }).populate({
    path: 'mentor',
    select: 'name avatar',
  });

  const features = new QueryBuilder(baseQuery, req.query)
    .filter()
    .search(['title', 'description'])
    .sort()
    .limitFields()
    .paginate();

  const [roadmaps, total] = await Promise.all([
    features.query,
    Roadmap.countDocuments({ isPublished: true }),
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

// @desc    Get single roadmap
// @route   GET /api/v1/roadmaps/:id
// @access  Public
exports.getRoadmap = catchAsync(async (req, res, next) => {
  const roadmap = await Roadmap.findById(req.params.id)
    .populate({ path: 'mentor', select: 'name avatar bio githubUsername' })
    .populate({
      path: 'assignments',
      match: { isPublished: true },
      select: 'title description dueDate',
    });

  if (!roadmap) {
    return next(new AppError('Roadmap not found', 404));
  }

  let isEnrolled = false;
  if (req.user) {
    const enrollment = await Enrollment.findOne({
      menteeId: req.user._id,
      roadmapId: roadmap._id,
    });
    isEnrolled = !!enrollment;
  }

  res.status(200).json(new ApiResponse(200, { roadmap, isEnrolled }));
});

// @desc    Update roadmap
// @route   PATCH /api/v1/roadmaps/:id
// @access  Private/Mentor (owner)
exports.updateRoadmap = catchAsync(async (req, res, next) => {
  const roadmap = await Roadmap.findById(req.params.id);

  if (!roadmap) {
    return next(new AppError('Roadmap not found', 404));
  }

  if (roadmap.mentorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own roadmaps', 403));
  }

  const updated = await Roadmap.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(new ApiResponse(200, { roadmap: updated }, 'Roadmap updated'));
});

// @desc    Delete roadmap
// @route   DELETE /api/v1/roadmaps/:id
// @access  Private/Mentor (owner)
exports.deleteRoadmap = catchAsync(async (req, res, next) => {
  const roadmap = await Roadmap.findById(req.params.id);

  if (!roadmap) {
    return next(new AppError('Roadmap not found', 404));
  }

  if (roadmap.mentorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own roadmaps', 403));
  }

  // Delete associated enrollments
  await Enrollment.deleteMany({ roadmapId: roadmap._id });
  await roadmap.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Roadmap deleted'));
});

// @desc    Get my roadmaps (mentor)
// @route   GET /api/v1/roadmaps/my-roadmaps
// @access  Private/Mentor
exports.getMyRoadmaps = catchAsync(async (req, res) => {
  const roadmaps = await Roadmap.find({ mentorId: req.user._id }).sort('-createdAt');

  res.status(200).json(new ApiResponse(200, { roadmaps }));
});