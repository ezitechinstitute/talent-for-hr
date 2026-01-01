import express from "express";
import matchingAlgorithmController from "../../controller/admin-controller/matchingAlgorithm.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import checkPermission from "../../middlewares/permission.middleware.js";

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

export default router;
