const db = require("../config/db.js"); 

const seedDefaultModules = async () => {
    const modules = [
      { name: "dashboard", description: "Admin dashboard overview" },
      { name: "candidates", description: "Candidate management" },
      { name: "companies", description: "Company management" },
      { name: "jobs", description: "Job postings" },
      { name: "internships", description: "Internship postings" },
      { name: "verifications", description: "Skill & experience verification" },
      { name: "assessments", description: "Candidate assessments" },
      { name: "reports", description: "Reports & analytics" },
      { name: "cms", description: "Content management" },
      { name: "notifications", description: "System notifications" },
      { name: "matching", description: "Matching algorithm" },
      { name: "portal_settings", description: "Portal configuration" },
      { name: "support_ticketing", description: "Support ticketing system" },
    ];

    for (const module of modules) {
      // prevent duplicates
      const [existing] = await db.query(
        "SELECT id FROM module WHERE name = ?",
        [module.name]
      );

      if (existing.length === 0) {
        await db.query(
          `INSERT INTO module (name, description, created_at)
           VALUES (?, ?, NOW())`,
          [module.name, module.description]
        );
      }
    }

    console.log("Default modules seeded successfully");
  
};

module.exports = seedDefaultModules;
