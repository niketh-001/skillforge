const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('mentee'), enrollmentController.createEnrollment);
router.get('/my', restrictTo('mentee'), enrollmentController.getMyEnrollments);
router.get('/mentor', restrictTo('mentor'), enrollmentController.getMentorEnrollments);
router.patch('/:id', restrictTo('mentor'), enrollmentController.updateEnrollment);

module.exports = router;