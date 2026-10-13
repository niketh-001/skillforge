const authValidator = require('./authValidator');
const userValidator = require('./userValidator');
const roadmapValidator = require('./roadmapValidator');
const assignmentValidator = require('./assignmentValidator');
const submissionValidator = require('./submissionValidator');
const messageValidator = require('./messageValidator');

module.exports = {
  ...authValidator,
  ...userValidator,
  ...roadmapValidator,
  ...assignmentValidator,
  ...submissionValidator,
  ...messageValidator,
};