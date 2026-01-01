const db = require("../config/db.js");
const matchQueue = require("../models/admin-model/matching-alogrithm-control/model.matchQueue.js");

const processJob = async (queueId, jobId) => {
  try {
    await matchQueue.updateStatus(queueId, "processing");
    console.log(`Running matching for job ${jobId}...`);

    await matchQueue.updateStatus(queueId, "done");
  } catch (err) {
    await matchQueue.updateStatus(queueId, "failed", err.message);
  }
};

const startWorker = async () => {
  console.log("Worker started...");

  setInterval(async () => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM match_queue WHERE status='queued' LIMIT 1"
      );

      if (rows.length > 0) {
        const job = rows[0];
        await processJob(job.id, job.job_id);
      }
    } catch (err) {
      console.error("Worker error:", err.message);
    }
  }, 5000);
};

module.exports = { startWorker };
