import express from "express";
import roleController from "../../controller/admin-controller/role.controller.js";
import permissionController from "../../controller/admin-controller/permission.controller.js";
import authorizeRoles from "../../middlewares/authorizeRoles.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = express.Router();

//role_permission module
const { createRole, getAllRoles,assignRoles, updateRole, deleteRole } = roleController;
const {
  createModule,
  getModule,
  //permission
  assignPermissionToRoles,
  getRolePermission,
  updateRolePermissions,
  removePermissionFromRole,
} = permissionController;

//role
router.post("/role",authorizeRoles("super_admin"),asyncHandler(createRole));
router.get("/role",authorizeRoles("super_admin"), asyncHandler(getAllRoles));
router.put("/assign-role/:userId",authorizeRoles("super_admin"), asyncHandler(assignRoles))
router.put("/role/:id",authorizeRoles("super_admin"), asyncHandler(updateRole));
router.delete("/role/:id",authorizeRoles("super_admin"), asyncHandler(deleteRole));
//module
router.post("/module",authorizeRoles("super_admin"), asyncHandler(createModule));
router.get("/module",authorizeRoles("super_admin"), asyncHandler(getModule));
//permission
router.post("/permissions",authorizeRoles("super_admin"), asyncHandler(assignPermissionToRoles));
router.put("/permissions/:id",authorizeRoles("super_admin"), asyncHandler(updateRolePermissions));
router.get("/permission",authorizeRoles("super_admin"), asyncHandler(getRolePermission));
router.delete("/permission/:id",authorizeRoles("super_admin"), asyncHandler(removePermissionFromRole));

export default router;