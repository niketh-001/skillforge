const express = require('express');
const assignmentController = require('../controllers/assignmentController');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createAssignmentSchema,
  updateAssignmentSchema,
} = require('../validators/assignmentValidator');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  restrictTo('mentor'),
  validate(createAssignmentSchema),
  assignmentController.createAssignment
);

router.get('/roadmap/:roadmapId', assignmentController.getAssignmentsByRoadmap);
router.get('/:id', assignmentController.getAssignment);
router.patch(
  '/:id',
  restrictTo('mentor'),
  validate(updateAssignmentSchema),
  assignmentController.updateAssignment
);
router.delete('/:id', restrictTo('mentor'), assignmentController.deleteAssignment);

module.exports = router;