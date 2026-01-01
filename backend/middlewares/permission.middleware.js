const db = require('../config/db.js');

function checkPermission(moduleName, action) {
  return async function (req, res, next) {
    try {
      console.log('permission middleware called')
      console.log(req.user);

      
      //  Must come from authMiddleware
      if (!req.user || !req.user.role_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

       console.log(req.user.role_id)
      const roleId = req.user.role_id;

      // Super admin bypass (optional but recommended)
      if (req.user.role === "super_admin") {
        return next();
      }

      // Get module
      const [modules] = await db.query(
        `SELECT id FROM module WHERE name = ?`,
        [moduleName]
      );

      if (!modules.length) {
        return res.status(403).json({
          message: "Module does not exist"
        });
      }

      const moduleId = modules[0].id;

      //  Get permissions
      const [permissions] = await db.query(
        `SELECT can_create, can_read, can_update, can_delete
         FROM role_permissions
         WHERE role_id = ? AND module_id = ?`,
        [roleId, moduleId]
      );

      if (!permissions.length) {
        return res.status(403).json({
          message: "No permissions assigned"
        });
      }

      const perm = permissions[0];

      // Action check
      if (!perm[`can_${action}`]) {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  };
}

module.exports = checkPermission;
