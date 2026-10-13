const { Enrollment, Roadmap } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const { createNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPES } = require('../utils/constants');

// @desc    Request enrollment
// @route   POST /api/v1/enrollments
// @access  Private/Mentee
exports.createEnrollment = catchAsync(async (req, res, next) => {
  const { roadmapId } = req.body;

  const roadmap = await Roadmap.findById(roadmapId);
  if (!roadmap) {
    return next(new AppError('Roadmap not found', 404));
  }

  if (!roadmap.isPublished) {
    return next(new AppError('This roadmap is not available for enrollment', 400));
  }

  const existing = await Enrollment.findOne({
    menteeId: req.user._id,
    roadmapId,
  });

  if (existing) {
    return next(new AppError('You have already requested enrollment', 400));
  }

  const enrollment = await Enrollment.create({
    menteeId: req.user._id,
    roadmapId,
  });

  await createNotification({
    userId: roadmap.mentorId,
    type: NOTIFICATION_TYPES.ENROLLMENT_REQUEST,
    title: 'New Enrollment Request',
    message: `${req.user.name} requested to enroll in "${roadmap.title}"`,
    link: `/dashboard/enrollments`,
    referenceId: enrollment._id,
  });

  res.status(201).json(
    new ApiResponse(201, { enrollment }, 'Enrollment request sent successfully')
  );
});

// @desc    Get my enrollments (mentee)
// @route   GET /api/v1/enrollments/my
// @access  Private/Mentee
exports.getMyEnrollments = catchAsync(async (req, res) => {
  const enrollments = await Enrollment.find({ menteeId: req.user._id })
    .populate({
      path: 'roadmap',
      select: 'title description technologies mentorId enrollmentCount',
      populate: { path: 'mentor', select: 'name avatar' },
    })
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, { enrollments }));
});

// @desc    Get enrollments for my roadmaps (mentor)
// @route   GET /api/v1/enrollments/mentor
// @access  Private/Mentor
exports.getMentorEnrollments = catchAsync(async (req, res) => {
  const myRoadmaps = await Roadmap.find({ mentorId: req.user._id }).select('_id');
  const roadmapIds = myRoadmaps.map(r => r._id);

  const enrollments = await Enrollment.find({ roadmapId: { $in: roadmapIds } })
    .populate({ path: 'mentee', select: 'name email avatar' })
    .populate({ path: 'roadmap', select: 'title' })
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, { enrollments }));
});

// @desc    Update enrollment status (accept/reject)
// @route   PATCH /api/v1/enrollments/:id
// @access  Private/Mentor
exports.updateEnrollment = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!['active', 'completed', 'dropped'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const enrollment = await Enrollment.findById(req.params.id).populate('roadmap');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.roadmap.mentorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only manage enrollments for your roadmaps', 403));
  }

  enrollment.status = status;
  if (status === 'completed') {
    enrollment.completedAt = new Date();
    enrollment.progress = 100;
  }
  await enrollment.save();

  const notifType =
    status === 'active'
      ? NOTIFICATION_TYPES.ENROLLMENT_ACCEPTED
      : NOTIFICATION_TYPES.ENROLLMENT_REJECTED;

  await createNotification({
    userId: enrollment.menteeId,
    type: notifType,
    title: status === 'active' ? 'Enrollment Accepted' : 'Enrollment Update',
    message: `Your enrollment in "${enrollment.roadmap.title}" was ${status}`,
    link: '/dashboard/my-roadmaps',
    referenceId: enrollment._id,
  });

  res.status(200).json(new ApiResponse(200, { enrollment }, 'Enrollment updated'));
});