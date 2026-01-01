const express = require('express');
const { upload } = require('../../middlewares/multer.middlewares.js');
const adminController = require('../../controller/admin-controller/job-internship.controller.js');
const asyncHandler = require('../../middlewares/asyncHandler.js');
const checkPermission = require('../../middlewares/permission.middleware.js');
const {
  createJob, updateJob, publishJob, listJobs, getJob,
  jobsIncrementViews, applyForJob, getJobApplicants, updateJobApplicationStatus,
  createInternship, updateInternship, publishInternship, listInternships,getInternship,
  internshipsIncrementViews, applyForInternship, getInternApplicants, updateInternApplicationStatus,
} = adminController;

const router = express.Router();

router.post("/jobs",checkPermission("jobs", "create"),asyncHandler(createJob));
router.get("/jobs", asyncHandler(listJobs));
router.get("/jobs/:id", asyncHandler(getJob));
router.put("/jobs/:id",checkPermission("jobs", "update"),asyncHandler(updateJob));
router.put("/jobs/:id/publish",checkPermission("jobs", "update"),asyncHandler(publishJob));
router.put("/jobs/:id/increment-views",checkPermission("jobs", "update"),asyncHandler(jobsIncrementViews));
router.post("/jobs/:id/apply",checkPermission("candidates", "create"),upload.single("resume"),asyncHandler(applyForJob));
router.get("/jobs/:id/applicants",checkPermission("jobs", "read"),asyncHandler(getJobApplicants));
router.put("/applications/:id/jobs/:jobId/status",checkPermission("jobs", "update"),asyncHandler(updateJobApplicationStatus));

router.post("/internships",checkPermission("internships", "create"),asyncHandler(createInternship));
router.get("/internships",asyncHandler(listInternships));
router.get("/internships/:id",asyncHandler(getInternship));
router.put("/internships/:id",checkPermission("internships", "update"),asyncHandler(updateInternship));
router.put("/internships/:id/publish",checkPermission("internships", "update"),asyncHandler(publishInternship));
router.put("/internships/:id/increment-views",checkPermission("internships", "update"),asyncHandler(internshipsIncrementViews));
router.post("/internships/:id/apply",checkPermission("candidates", "create"),upload.single("resume"),asyncHandler(applyForInternship));
router.get("/internships/:id/applicants",checkPermission("internships", "read"),asyncHandler(getInternApplicants));
router.put("/applications/:id/internships/:internshipId/status",checkPermission("internships", "update"),asyncHandler(updateInternApplicationStatus));

module.exports = router;