import express from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
import userManagementController from "../../controller/admin-controller/userManagement.controller.js";
import checkPermission from "../../middlewares/permission.middleware.js";
const router = express.Router();

const {
      // Candidate Management Controllers
  viewAllCandidates,
  viewCandidateById,
  updateCandidateById,
  deactivateCandidateById,
  activateCandidateById,
  skillProfile,
  internshipExperience,
  resetCandidatePasswordController,
  exportCandidatesCSVController,

} = userManagementController

// ===========Candidate Management==================
// CSV EXPORT
router.get(
  "/candidates/export-csv",
   checkPermission("candidates", "read"),
  asyncHandler(exportCandidatesCSVController)
);
router.get("/candidates", checkPermission("candidates", "read"), asyncHandler(viewAllCandidates));
router.get("/candidates/:id", checkPermission("candidates", "read"), asyncHandler(viewCandidateById));
router.put("/updateCandidates/:id", checkPermission("candidates", "update"), asyncHandler(updateCandidateById));
router.patch(
  "/candidates/:id/deactivate",
   checkPermission("candidates", "update"),
  asyncHandler(deactivateCandidateById)
);
router.patch("/candidates/:id/activate", checkPermission("candidates", "update"), asyncHandler(activateCandidateById));
router.get(
  "/candidates/:id/internship-experience",
   checkPermission("candidates", "read"),
  asyncHandler(internshipExperience)
);
router.get("/candidates/:id/skill-profile", checkPermission("candidates", "read"), asyncHandler(skillProfile));
router.post(
  "/candidates/:id/reset-password",
   checkPermission("candidates", "create"),
  asyncHandler(resetCandidatePasswordController)
);

export default router