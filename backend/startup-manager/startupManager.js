const initializeTables = require('../config/initializeTables.js');
const jobWorker = require('../worker/jobWorker.js');
const { initRolesAndAdmin } = require('../seeder/seeder.superAdmin.sql');
const seeder = require('../seeder/moduleSeeder.sql');
const adminRoleSeeder = require("../seeder/adminrolesSeeder.sql")

const seedDefaultModules=seeder;
const startupManager = async () => {
  await initializeTables.initializeTables();
    await initRolesAndAdmin();
    await seedDefaultModules();
    await adminRoleSeeder();
  await jobWorker.startWorker();
};

module.exports = { startupManager };
