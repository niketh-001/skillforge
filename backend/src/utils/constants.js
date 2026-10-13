module.exports = {
  USER_ROLES: { MENTEE: 'mentee', MENTOR: 'mentor', ADMIN: 'admin' },
  ENROLLMENT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    DROPPED: 'dropped',
  },
  SUBMISSION_STATUS: {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    NEEDS_WORK: 'needs_work',
    REJECTED: 'rejected',
  },
  DIFFICULTY_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
  },
  NOTIFICATION_TYPES: {
    ENROLLMENT_REQUEST: 'enrollment_request',
    ENROLLMENT_ACCEPTED: 'enrollment_accepted',
    ENROLLMENT_REJECTED: 'enrollment_rejected',
    NEW_MESSAGE: 'new_message',
    ASSIGNMENT_CREATED: 'assignment_created',
    SUBMISSION_REVIEWED: 'submission_reviewed',
    ASSIGNMENT_DUE_SOON: 'assignment_due_soon',
  },
};