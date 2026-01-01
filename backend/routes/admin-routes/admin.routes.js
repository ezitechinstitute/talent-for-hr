import express from "express";
import verificationRoutes from "../admin-routes/verification.routes.js";
import reportRoutes from "../admin-routes/reports.routes.js";
import roleRoutes from "../admin-routes/role.routes.js";
import dashboardRoutes from "../admin-routes/dashboard.routes.js";
import matchingAlgorithmRoutes from "../admin-routes/matchingAlgorithm.routes.js";
import activityLogsRoutes from "../admin-routes/activityLog.routes.js";
import authenticateToken from "../../middlewares/authenticateToken.js";
import jobInternshipRoutes from "./job-internship.routes.js";
import notificationRoutes from "./notification.routes.js";
import cmsRoutes from "./cms.routes.js";
import userManagementRoutes from "./userManagement.routes.js";
// New route imports for separated modules
import candidateAssessmentRoutes from "./candidate-assessment.routes.js";
import portalSettingsRoutes from "./portal-settings.routes.js";
import supportTicketingRoutes from "./support-ticketing.routes.js";

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

export default router;
