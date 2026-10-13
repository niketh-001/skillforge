const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfileSchema } = require('../validators/userValidator');

const router = express.Router();

router.get('/mentors', userController.getMentors);

router.use(protect);

router.patch('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/me/avatar', userController.deleteAvatar);

router.get('/:id', userController.getUser);

module.exports = router;