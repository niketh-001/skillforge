const { Assignment, Roadmap, Enrollment } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create assignment
// @route   POST /api/v1/assignments
// @access  Private/Mentor
exports.createAssignment = catchAsync(async (req, res, next) => {
  const roadmap = await Roadmap.findById(req.body.roadmapId);

  if (!roadmap) {
    return next(new AppError('Roadmap not found', 404));
  }

  if (roadmap.mentorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only add assignments to your own roadmaps', 403));
  }

  const assignment = await Assignment.create(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, { assignment }, 'Assignment created successfully'));
});

// @desc    Get assignments by roadmap
// @route   GET /api/v1/assignments/roadmap/:roadmapId
// @access  Private
exports.getAssignmentsByRoadmap = catchAsync(async (req, res) => {
  const assignments = await Assignment.find({
    roadmapId: req.params.roadmapId,
    isPublished: true,
  }).sort('dueDate');

  res.status(200).json(new ApiResponse(200, { assignments }));
});

// @desc    Get single assignment
// @route   GET /api/v1/assignments/:id
// @access  Private
exports.getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate({
    path: 'roadmap',
    select: 'title mentorId',
  });

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  res.status(200).json(new ApiResponse(200, { assignment }));
});

// @desc    Update assignment
// @route   PATCH /api/v1/assignments/:id
// @access  Private/Mentor
exports.updateAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate('roadmap');

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  if (assignment.roadmap.mentorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own assignments', 403));
  }

  const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(new ApiResponse(200, { assignment: updated }, 'Assignment updated'));
});

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Private/Mentor
exports.deleteAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate('roadmap');

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  if (assignment.roadmap.mentorId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own assignments', 403));
  }

  await assignment.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Assignment deleted'));
});