const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler.js');
const checkPermission = require('../../middlewares/permission.middleware.js');
const assessmentController = require('../../controller/admin-controller/candidate-assessment.controller.js');

const router = express.Router();

const {
  // Assessment Controllers
  createAssessment,
  getAssessments,
  getAssessmentById,
  getAssessmentWithQuestions,
  updateAssessment,
  deleteAssessment,
  // Question Controllers
  getAssessmentQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  // Result Controllers
  getAssessmentResults,
  getResultById,
  getCandidateResults,
  submitAssessment,
  // Analytics Controllers
  getAssessmentStats,
  getPerformanceDistribution,
  getRecentSubmissions,
  // Answer Controllers
  getAnswersByResultId,
} = assessmentController;

// ==================== Assessment Routes ====================
router.get(
  "/assessments",
  checkPermission("assessments", "read"),
  asyncHandler(getAssessments)
);
router.get(
  "/assessments/:id",
  checkPermission("assessments", "read"),
  asyncHandler(getAssessmentById)
);
router.get(
  "/assessments/:id/questions",
  checkPermission("assessments", "read"),
  asyncHandler(getAssessmentWithQuestions)
);
router.post(
  "/assessments",
  checkPermission("assessments", "create"),
  asyncHandler(createAssessment)
);
router.put(
  "/assessments/:id",
  checkPermission("assessments", "update"),
  asyncHandler(updateAssessment)
);
router.delete(
  "/assessments/:id",
  checkPermission("assessments", "delete"),
  asyncHandler(deleteAssessment)
);

// ==================== Question Routes ====================
router.get(
  "/assessments/:assessmentId/questions",
  checkPermission("assessments", "read"),
  asyncHandler(getAssessmentQuestions)
);
router.get(
  "/questions/:id",
  checkPermission("assessments", "read"),
  asyncHandler(getQuestionById)
);
router.post(
  "/assessments/:assessmentId/questions",
  checkPermission("assessments", "create"),
  asyncHandler(addQuestion)
);
router.put(
  "/questions/:id",
  checkPermission("assessments", "update"),
  asyncHandler(updateQuestion)
);
router.delete(
  "/questions/:id",
  checkPermission("assessments", "delete"),
  asyncHandler(deleteQuestion)
);

// ==================== Result Routes ====================
router.get(
  "/assessments/:assessmentId/results",
  checkPermission("assessments", "read"),
  asyncHandler(getAssessmentResults)
);
router.get(
  "/results/:id",
  checkPermission("assessments", "read"),
  asyncHandler(getResultById)
);
router.get(
  "/candidates/:candidateId/results",
  checkPermission("assessments", "read"),
  asyncHandler(getCandidateResults)
);
router.post(
  "/assessments/submit",
  checkPermission("assessments", "create"),
  asyncHandler(submitAssessment)
);

// ==================== Analytics Routes ====================
router.get(
  "/assessments/:assessmentId/stats",
  checkPermission("assessments", "read"),
  asyncHandler(getAssessmentStats)
);
router.get(
  "/assessments/:assessmentId/performance-distribution",
  checkPermission("assessments", "read"),
  asyncHandler(getPerformanceDistribution)
);
router.get(
  "/assessments/recent-submissions",
  checkPermission("assessments", "read"),
  asyncHandler(getRecentSubmissions)
);

// ==================== Answer Routes ====================
router.get(
  "/results/:resultId/answers",
  checkPermission("assessments", "read"),
  asyncHandler(getAnswersByResultId)
);

module.exports = router;

