import initializeTables from "../config/initializeTables.js";
import jobWorker from "../worker/jobWorker.js";

const startupManager = async () => {
  await initializeTables.initializeTables();
  await jobWorker.startWorker();
};

export default { startupManager };
