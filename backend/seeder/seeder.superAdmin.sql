// backend/seeder/seeder.js
const bcrypt = require("bcryptjs");
const db = require("../config/db.js"); // your DB connection
const dotenv = require("dotenv");
dotenv.config();

// Import table creation functions
const { createAdminRolesAndPermissionsTable } = require("../tables/admin-table/admin.table.js");
const { createAdminUsersTable } = require("../tables/users/users.js");
const { createUserTable } = require("../tables/users/users.js"); // normal users

// ----------------- Super Admin Creation -----------------
async function createDefaultSuperAdmin() {
  const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
  const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

  if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
    console.log("Super admin email or password not set in .env");
    return;
  }

  // Check if super admin already exists
  const [rows] = await db.query("SELECT * FROM admin_users WHERE email = ?", [SUPERADMIN_EMAIL]);
  if (rows.length > 0) {
    console.log("Super Admin already exists ");
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  // Insert super admin safely using ON DUPLICATE KEY UPDATE
  await db.query(
    `INSERT INTO admin_users 
      (name, email, password, isVerified, isApproved, role, admin_role_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE email = email`,
    ["Super Admin", SUPERADMIN_EMAIL, hashedPassword, true, true, "superadmin", 1]
  );

  console.log("Default Super Admin created ");
}

// ----------------- Seeder Initialization -----------------
async function initRolesAndAdmin() {

    //  Create admin_roles table first
    await createAdminRolesAndPermissionsTable();

    //  Ensure default super_admin role exists
    await db.query(
      `INSERT INTO admin_roles (id, name, description)
       VALUES (1, 'super_admin', 'Has all permissions and full access')
       ON DUPLICATE KEY UPDATE description = VALUES(description)`
    );
    console.log("Default super_admin role ensured ");

    //  Create admin_users table
    await createAdminUsersTable();

    //  Create default superadmin user
    await createDefaultSuperAdmin();

    //  Create normal users table
    await createUserTable();
    console.log("Normal users table created ");

    console.log("Database initialization complete ");

}

// Run seeder
initRolesAndAdmin();

module.exports = { initRolesAndAdmin };
