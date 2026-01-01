import express from "express";
import reportController from "../../controller/admin-controller/report.controller.js";
import checkPermission from "../../middlewares/permission.middleware.js"
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = express.Router();

const {
   //report
  getNewUserRegistrationReport,
  getJobPostingTrendReport,
  getCandidatePlacementSuccessReport,
  getVerifiedInernshipReport,
  skillDistributionReport,
  getCompanyActivities,
  assessmentPerformanceReport,
  exportReport,
} = reportController;


// report and analytics module
router.get("/reports/new-users",checkPermission("reports", "read"), asyncHandler(getNewUserRegistrationReport));
router.get("/reports/job-trends",checkPermission("reports", "read"), asyncHandler(getJobPostingTrendReport));
router.get(
  "/reports/placement-success",
  checkPermission("reports", "read"),
  asyncHandler(getCandidatePlacementSuccessReport)
);
router.get(
  "/reports/verified-internships",
  checkPermission("reports", "read"),
  asyncHandler(getVerifiedInernshipReport)
);
router.get("/reports/skills-distribution",checkPermission("reports", "read"), asyncHandler(skillDistributionReport));
router.get("/reports/company-activities",checkPermission("reports", "read"), asyncHandler(getCompanyActivities));
router.get(
  "/reports/assessment-performance",
  checkPermission("reports", "read"),
  asyncHandler(assessmentPerformanceReport)
);
router.get("/reports/export",checkPermission("reports", "read"), asyncHandler(exportReport));

export default router;