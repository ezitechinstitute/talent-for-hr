import matchingSettings from "../../models/admin-model/matching-alogrithm-control/model.matchingSettings.js";
import matchingQueue from "../../models/admin-model/matching-alogrithm-control/model.matchQueue.js";
import getCandidateById from "../../models/admin-model/user-management/model.getCandidateById.js";
import matchingRecommand from "../../models/admin-model/matching-alogrithm-control/model.matchQueue.js";
import db from "../../config/db.js";

// Matching Algorithm Control
const getMatchingSettings = async (req, res) => {
  const settings = await matchingSettings.getSettings();
  res.status(200).json(settings);
};

const updateMatchingSettings = async (req, res) => {
  const updated = await matchingSettings.updateSettings(
    req.body,
    req.adminId || null
  );
  res.status(200).json(updated);
};

const toggleAutoMatching = async (req, res) => {
  const payload = { ...req.body, auto_matching_enabled: req.body.enabled };
  const updated = await matchingSettings.updateSettings(payload, req.adminId);
  res.status(200).json(updated);
};

const rerunMatchingForJob = async (req, res) => {
  const jobId = req.body.jobId;
  if (!jobId) return res.status(400).json({ error: "Job ID required" });

  const queueId = await matchingQueue.enqueueJob(jobId, "manual");
  res.status(201).json({ status: "queued", jobId, queueId });
};

const getUserRecommendations = async (req, res) => {
  const userId = req.user.id;
  const type = req.query.type || "all";
  const page = Math.max(parseInt(req.query.page || "1"), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
  const offset = (page - 1) * limit;

  const [rows] = await db.query(
    `SELECT id, skills FROM candidates WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    return res.status(404).json({
      success: false,
      message: "Candidate not found for this user",
    });
  }

  const candidateId = rows[0].id;
  const skillsRaw = rows[0].skills;

  if (!skillsRaw) {
    return res.json({
      success: true,
      meta: {
        total_jobs: 0,
        total_internships: 0,
        page,
        limit,
        type,
      },
      jobs: [],
      internships: [],
    });
  }

  const skills = Array.isArray(skillsRaw) ? skillsRaw : JSON.parse(skillsRaw);

  if (!skills.length) {
    return res.json({
      success: true,
      meta: {
        total_jobs: 0,
        total_internships: 0,
        page,
        limit,
        type,
      },
      jobs: [],
      internships: [],
    });
  }

  const normalizedSkills = skills.map((s) => s.toLowerCase().trim());

  const allJobs =
    type === "internships" ? [] : await matchingRecommand.matchingListJobs();

  const allInternships =
    type === "jobs" ? [] : await matchingRecommand.matchingListInternships();

  const matchedJobs = [];
  const matchedInternships = [];

  for (const job of allJobs) {
    const title = (job.title || "").toLowerCase();
    const description = (job.description || "").toLowerCase();

    let requirements = [];
    if (job.requirements) {
      try {
        requirements = Array.isArray(job.requirements)
          ? job.requirements
          : JSON.parse(job.requirements);
      } catch {
        requirements = [];
      }
    }

    const normalizedReqs = requirements.map((r) => r.toLowerCase().trim());

    let score = 0;
    const matchedSkills = new Set();

    for (const skill of normalizedSkills) {
      if (
        title.includes(skill) ||
        description.includes(skill) ||
        normalizedReqs.includes(skill)
      ) {
        score++;
        matchedSkills.add(skill);
      }
    }

    if (score > 0) {
      matchedJobs.push({
        ...job,
        match_score: score,
        matched_skills: Array.from(matchedSkills),
      });
    }
  }

  matchedJobs.sort((a, b) => b.match_score - a.match_score);
  for (const internship of allInternships) {
    const title = (internship.title || "").toLowerCase();

    let score = 0;
    const matchedSkills = new Set();

    for (const skill of normalizedSkills) {
      if (title.includes(skill)) {
        score++;
        matchedSkills.add(skill);
      }
    }

    if (score > 0) {
      matchedInternships.push({
        ...internship,
        match_score: score,
        matched_skills: Array.from(matchedSkills),
      });
    }
  }

  matchedInternships.sort((a, b) => b.match_score - a.match_score);
  const totalJobs = matchedJobs.length;
  const totalInternships = matchedInternships.length;
  const paginatedJobs =
    type === "internships" ? [] : matchedJobs.slice(offset, offset + limit);

  const paginatedInternships =
    type === "jobs" ? [] : matchedInternships.slice(offset, offset + limit);

  return res.json({
    success: true,
    meta: {
      candidate_id: candidateId,
      total_jobs: totalJobs,
      total_internships: totalInternships,
      page,
      limit,
      type,
    },
    jobs: paginatedJobs,
    internships: paginatedInternships,
  });
};

export default {
  getMatchingSettings,
  updateMatchingSettings,
  toggleAutoMatching,
  rerunMatchingForJob,
  getUserRecommendations,
};
