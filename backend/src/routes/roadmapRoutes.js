const express = require('express');
const roadmapController = require('../controllers/roadmapController');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createRoadmapSchema,
  updateRoadmapSchema,
} = require('../validators/roadmapValidator');

const router = express.Router();

router.get('/', roadmapController.getRoadmaps);
router.get('/my-roadmaps', protect, restrictTo('mentor'), roadmapController.getMyRoadmaps);

router.use(protect);

router.post(
  '/',
  restrictTo('mentor'),
  validate(createRoadmapSchema),
  roadmapController.createRoadmap
);

router.get('/:id', roadmapController.getRoadmap);
router.patch(
  '/:id',
  restrictTo('mentor'),
  validate(updateRoadmapSchema),
  roadmapController.updateRoadmap
);
router.delete('/:id', restrictTo('mentor'), roadmapController.deleteRoadmap);

module.exports = router;