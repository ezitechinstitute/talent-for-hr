const express = require("express");
const verificationRoutes = require("../admin-routes/verification.routes.js");
const reportRoutes = require("../admin-routes/reports.routes.js");
const roleRoutes = require("../admin-routes/role.routes.js");
const dashboardRoutes = require("../admin-routes/dashboard.routes.js");
const matchingAlgorithmRoutes = require("../admin-routes/matchingAlgorithm.routes.js");
const activityLogsRoutes = require("../admin-routes/activityLog.routes.js");
const authenticateToken = require("../../middlewares/authenticateToken.js");
const jobInternshipRoutes = require("./job-internship.routes.js");
const notificationRoutes = require("./notification.routes.js");
const cmsRoutes = require("./cms.routes.js");
const userManagementRoutes = require("./userManagement.routes.js");
// New route imports for separated modules
const candidateAssessmentRoutes = require("./candidate-assessment.routes.js");
const portalSettingsRoutes = require("./portal-settings.routes.js");
const supportTicketingRoutes = require("./support-ticketing.routes.js");

const router = express.Router();

// authenticate token middleware
router.use(authenticateToken);

// Activity Logs Routes
router.use("/v1", activityLogsRoutes);

// Matching Algorithm Routes
router.use("/v1", matchingAlgorithmRoutes);

//  Dashbaord Routes
router.use("/v1", dashboardRoutes);

//verification
router.use("/v1", verificationRoutes);
//report
router.use("/v1", reportRoutes);
//role and permissions
router.use("/v1", roleRoutes);
router.use("/v1", cmsRoutes);
router.use("/v1", userManagementRoutes);
router.use("/v1", jobInternshipRoutes);
router.use("/v1", notificationRoutes);

// New separated module routes
router.use("/v1", candidateAssessmentRoutes);
router.use("/v1", portalSettingsRoutes);
router.use("/v1", supportTicketingRoutes);

module.exports = router;
