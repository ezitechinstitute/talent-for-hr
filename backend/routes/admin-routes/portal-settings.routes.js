import express from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
import checkPermission from "../../middlewares/permission.middleware.js";
import portalSettingsController from "../../controller/admin-controller/portal-settings.controller.js";

const router = express.Router();

const {
  // Platform Configuration
  getPlatformConfig,
  updatePlatformConfig,
  // SMTP Settings
  getSMTPSettings,
  updateSMTPSettings,
  testSMTPConnection,
  // SMS Settings
  getSMSSettings,
  updateSMSSettings,
  testSMSConnection,
  // Payment Gateway Settings
  getPaymentGatewaySettings,
  updatePaymentGatewaySettings,
  // Database Backup Settings
  getBackupSettings,
  updateBackupSettings,
  getBackupHistory,
  createBackupRecord,
} = portalSettingsController;

// ==================== Platform Configuration Routes ====================
router.get(
  "/platform-config",
  checkPermission("portal_settings", "read"),
  asyncHandler(getPlatformConfig)
);
router.put(
  "/platform-config",
  checkPermission("portal_settings", "update"),
  asyncHandler(updatePlatformConfig)
);

// ==================== SMTP Settings Routes ====================
router.get(
  "/smtp-settings",
  checkPermission("portal_settings", "read"),
  asyncHandler(getSMTPSettings)
);
router.put(
  "/smtp-settings",
  checkPermission("portal_settings", "update"),
  asyncHandler(updateSMTPSettings)
);
router.post(
  "/smtp-settings/test",
  checkPermission("portal_settings", "read"),
  asyncHandler(testSMTPConnection)
);

// ==================== SMS Settings Routes ====================
router.get(
  "/sms-settings",
  checkPermission("portal_settings", "read"),
  asyncHandler(getSMSSettings)
);
router.put(
  "/sms-settings",
  checkPermission("portal_settings", "update"),
  asyncHandler(updateSMSSettings)
);
router.post(
  "/sms-settings/test",
  checkPermission("portal_settings", "read"),
  asyncHandler(testSMSConnection)
);

// ==================== Payment Gateway Settings Routes ====================
router.get(
  "/payment-gateway-settings",
  checkPermission("portal_settings", "read"),
  asyncHandler(getPaymentGatewaySettings)
);
router.put(
  "/payment-gateway-settings",
  checkPermission("portal_settings", "update"),
  asyncHandler(updatePaymentGatewaySettings)
);

// ==================== Database Backup Settings Routes ====================
router.get(
  "/backup-settings",
  checkPermission("portal_settings", "read"),
  asyncHandler(getBackupSettings)
);
router.put(
  "/backup-settings",
  checkPermission("portal_settings", "update"),
  asyncHandler(updateBackupSettings)
);
router.get(
  "/backup-history",
  checkPermission("portal_settings", "read"),
  asyncHandler(getBackupHistory)
);
router.post(
  "/backup-record",
  checkPermission("portal_settings", "create"),
  asyncHandler(createBackupRecord)
);

export default router;

