import express from "express";
import verificationController from "../../controller/admin-controller/verification.controller.js";
import checkPermission from "../../middlewares/permission.middleware.js"
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = express.Router();

const {
   // experience verification controllers
  getAllPendingVerifications,
  viewDocument,
  updateVerificationStatus,
  addRemarks,
  updateCandidateExperience,
  validateExperienceSubmission,
  //skill verification
  pendingSkillVerifications,
  skillView,
  updateSkillStatus,
  updateAdminRemarks,
} = verificationController;

//experience verification
router.get("/pending-verifications",checkPermission("verifications", "read"), asyncHandler(getAllPendingVerifications));
router.get("/view-document/:id",checkPermission("verifications", "read"), asyncHandler(viewDocument));
router.put(
  "/update-verification-status/:id",
  checkPermission("verifications", "update"),
  asyncHandler(updateVerificationStatus)
);
router.put("/add-admin-remarks/:id",checkPermission("verifications", "update"), asyncHandler(addRemarks));
router.put(
  "/update-candidate-experience/:id"
  ,checkPermission("verifications", "update"),
  asyncHandler(updateCandidateExperience)
);
router.get(
  "/validate-experience-submission/:id"
  ,checkPermission("verifications", "read"),
  asyncHandler(validateExperienceSubmission)
);

// skill verification
router.get("/pending-skill",checkPermission("verifications", "read"), asyncHandler(pendingSkillVerifications));
router.get("/skill-view/:id",checkPermission("verifications", "read"), asyncHandler(skillView));
router.put("/update-skill-status/:id",checkPermission("verifications", "update"), asyncHandler(updateSkillStatus));
router.put("/update-admin-remarks/:id",checkPermission("verifications", "update"), asyncHandler(updateAdminRemarks));

export default router;
