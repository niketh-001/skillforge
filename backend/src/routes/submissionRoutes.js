const express = require('express');
const submissionController = require('../controllers/submissionController');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createSubmissionSchema,
  reviewSubmissionSchema,
} = require('../validators/submissionValidator');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  restrictTo('mentee'),
  validate(createSubmissionSchema),
  submissionController.createSubmission
);

router.get('/my', restrictTo('mentee'), submissionController.getMySubmissions);
router.get('/mentor', restrictTo('mentor'), submissionController.getMentorSubmissions);
router.get('/:id', submissionController.getSubmission);
router.patch(
  '/:id/review',
  restrictTo('mentor'),
  validate(reviewSubmissionSchema),
  submissionController.reviewSubmission
);

module.exports = router;