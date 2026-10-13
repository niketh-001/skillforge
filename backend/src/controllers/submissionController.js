const { Submission, Assignment } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const { createNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPES, SUBMISSION_STATUS } = require('../utils/constants');

// @desc    Submit project
// @route   POST /api/v1/submissions
// @access  Private/Mentee
exports.createSubmission = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.body.assignmentId).populate('roadmap');

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  const submission = await Submission.create({
    ...req.body,
    menteeId: req.user._id,
  });

  await createNotification({
    userId: assignment.roadmap.mentorId,
    type: NOTIFICATION_TYPES.SUBMISSION_REVIEWED,
    title: 'New Project Submission',
    message: `${req.user.name} submitted "${assignment.title}"`,
    link: `/dashboard/submissions/${submission._id}`,
    referenceId: submission._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { submission }, 'Project submitted successfully'));
});

// @desc    Get my submissions
// @route   GET /api/v1/submissions/my
// @access  Private/Mentee
exports.getMySubmissions = catchAsync(async (req, res) => {
  const submissions = await Submission.find({ menteeId: req.user._id })
    .populate({ path: 'assignment', select: 'title dueDate roadmapId' })
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, { submissions }));
});

// @desc    Get submissions for mentor's assignments
// @route   GET /api/v1/submissions/mentor
// @access  Private/Mentor
exports.getMentorSubmissions = catchAsync(async (req, res) => {
  // Get all assignments for this mentor's roadmaps
  const assignments = await Assignment.find({ mentorId: req.user._id }).select('_id');
  const assignmentIds = assignments.map(a => a._id);

  const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
    .populate({ path: 'mentee', select: 'name email avatar' })
    .populate({ path: 'assignment', select: 'title' })
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, { submissions }));
});

// @desc    Get submission by ID
// @route   GET /api/v1/submissions/:id
// @access  Private
exports.getSubmission = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id)
    .populate({ path: 'mentee', select: 'name email avatar' })
    .populate({ path: 'assignment' });

  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }

  res.status(200).json(new ApiResponse(200, { submission }));
});

// @desc    Review submission
// @route   PATCH /api/v1/submissions/:id/review
// @access  Private/Mentor
exports.reviewSubmission = catchAsync(async (req, res, next) => {
  const { status, feedback, score } = req.body;

  const submission = await Submission.findById(req.params.id).populate({
    path: 'assignment',
    populate: { path: 'roadmap' },
  });

  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }

  if (submission.assignment.roadmap.mentorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only review submissions for your assignments', 403));
  }

  submission.status = status;
  submission.feedback = feedback;
  if (score !== undefined) submission.score = score;
  submission.reviewedAt = new Date();
  submission.reviewedBy = req.user._id;

  await submission.save();

  await createNotification({
    userId: submission.menteeId,
    type: NOTIFICATION_TYPES.SUBMISSION_REVIEWED,
    title: 'Project Reviewed',
    message: `Your submission for "${submission.assignment.title}" was reviewed`,
    link: `/dashboard/submissions/${submission._id}`,
    referenceId: submission._id,
  });

  res.status(200).json(new ApiResponse(200, { submission }, 'Submission reviewed'));
});