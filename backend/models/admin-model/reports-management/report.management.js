import db from "../../../config/db.js";

// for getting new user registration report
const newUserReport = async () => {
  
    const sql = `SELECT 
    date,
    SUM(candidates) AS candidates,
    SUM(companies) AS companies
    FROM (
    SELECT DATE(created_at) AS date, COUNT(*) AS candidates, 0 AS companies
    FROM candidates
    GROUP BY DATE(created_at)

    UNION ALL

    SELECT DATE(created_at) AS date, 0 AS candidates, COUNT(*) AS companies
    FROM companies
    GROUP BY DATE(created_at)
   ) t
   GROUP BY date
   ORDER BY date ASC;
   ;`;
    const [rows] = await db.query(sql);
    return rows;
};

// for getting verified internships report
const verifiedInternshipReports = async () => {
    const sql = `SELECT COUNT(*) AS count
     FROM experience_verifications
      WHERE status='verified' OR verified=1`;
    const [rows] = await db.query(sql);
    return rows;
};

// get job postings trend report
const jobPostingTrendReport = async () => {
    const sql = ` SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS total_job_posts
      FROM jobs
      WHERE active = 1
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month;
`;
    const [rows] = await db.query(sql);
    return rows;
 
};

//candidate placement report

const candidatePlacementSuccess = async () => {
    const sql = `SELECT 
    DATE_FORMAT(applied_at, '%Y-%m') AS month,
    COUNT(DISTINCT candidate_id) AS placed_candidates
FROM job_applicants
WHERE status IN ('accepted', 'approved', 'hired')
GROUP BY DATE_FORMAT(applied_at, '%Y-%m')
ORDER BY month;

`;
    const [rows] = await db.query(sql);
    return rows;
};

//skill distribution query

const skillDistribution = async () => {
    const sql = `SELECT 
      skill_name,
      COUNT(DISTINCT candidate_id) AS candidate_count
    FROM candidate_skills
    GROUP BY skill_name
    ORDER BY candidate_count DESC`;
    const [rows] = await db.query(sql);
    return rows;
 
};

//company activities

const getCompanyActivities = async () => {

    const sql = `SELECT 
    c.name AS company_name,
    COUNT(j.id) AS total_jobs
    FROM companies c
    LEFT JOIN jobs j ON j.company_id = c.id
    GROUP BY c.id, c.name
    ORDER BY total_jobs DESC;
`;
    const [rows] = await db.query(sql);
    return rows;
 
};

//get assessment performance

const getAssessmentPerformance = async () => {

    const sql = `SELECT 
    CASE
        WHEN score >= 80 THEN 'Excellent'
        WHEN score >= 60 THEN 'Good'
        ELSE 'Needs Improvement'
    END AS performance,
    COUNT(*) AS total_candidates
FROM candidate_results
GROUP BY performance
ORDER BY total_candidates DESC;
`;
    const [rows] = await db.query(sql);
    return rows;
};
export default {
  newUserReport,
  verifiedInternshipReports,
  jobPostingTrendReport,
  candidatePlacementSuccess,
  skillDistribution,
  getCompanyActivities,
  getAssessmentPerformance,
};
