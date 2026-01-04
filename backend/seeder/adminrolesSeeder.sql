const db = require("../config/db"); // adjust path if needed

const seedAdminRoles = async () => {
    const roles = [
      { name: "verification_admin", description: "Handles verifications" },
      { name: "support_admin", description: "Handles user support" },
      { name: "content_admin", description: "Manages content" },
      { name: "hr_admin", description: "HR related tasks" },
    ];

    for (const role of roles) {
      // check if role already exists
      const [existing] = await db.query(
        "SELECT id FROM admin_roles WHERE name = ?",
        [role.name]
      );

      if (existing.length === 0) {
        await db.query(
          `INSERT INTO admin_roles (name, description)
           VALUES (?, ?)`,
          [role.name, role.description]
        );
      }
    }

    console.log(" Default admin roles seeded successfully");
};

module.exports = seedAdminRoles;
