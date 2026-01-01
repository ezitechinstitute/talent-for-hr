const initializeTables = require('../config/initializeTables.js');
const jobWorker = require('../worker/jobWorker.js');

const startupManager = async () => {
  await initializeTables.initializeTables();
  await jobWorker.startWorker();
};

module.exports = { startupManager };
