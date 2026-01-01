const express = require('express');
const matchingAlgorithmController = require('../../controller/admin-controller/matchingAlgorithm.controller.js');
const asyncHandler = require('../../middlewares/asyncHandler.js');
const checkPermission = require('../../middlewares/permission.middleware.js');

const router = express.Router();

const {
  getMatchingSettings,
  updateMatchingSettings,
  toggleAutoMatching,
  rerunMatchingForJob,
  getUserRecommendations,
} = matchingAlgorithmController;

// Matching Algorithm Routes
router.get(
  "/matching-settings",
  checkPermission("matching", "read"),
  asyncHandler(getMatchingSettings)
);
router.put(
  "/matching-settings",
  checkPermission("matching", "update"),
  asyncHandler(updateMatchingSettings)
);
router.put(
  "/toggle-auto-matching",
  checkPermission("matching", "update"),
  asyncHandler(toggleAutoMatching)
);
router.post(
  "/queue/:jobId/rerun",
  checkPermission("matching", "create"),
  asyncHandler(rerunMatchingForJob)
);
router.get(
  "/matching-user/recommendations",
  checkPermission("candidates", "read"),
  asyncHandler(getUserRecommendations)
);

module.exports = router;
