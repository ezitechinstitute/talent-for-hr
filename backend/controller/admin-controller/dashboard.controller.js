import candidateModel from "../../models/admin-model/admin-dashboard/model.candidate.js";
import companyModel from "../../models/admin-model/admin-dashboard/model.company.js";
import systemHealthModel from "../../models/admin-model/admin-dashboard/model.systemHealth.js";
import activityLogsModel from "../../models/admin-model/activity-logs/model.activityLogs.js";

const getDashboardStats = async (req, res) => {
  const totalCandidates = await candidateModel.getAllCandidates();
  const totalCompanies = await companyModel.getAllCompanies();
  const pendingVerifications =
    (await companyModel.getPendingCompanies()) +
    (await candidateModel.getPendingCandidates());
  const monthlyCandidates = await candidateModel.getMonthlyGrowth();
  const monthlyCompanies = await companyModel.getMonthlyGrowth();
  const recentActivities = await activityLogsModel.getRecentActivityLogs();
  const systemHealth = await systemHealthModel.getSystemHealthAlerts();

  res.status(200).json({
    totalCandidates,
    totalCompanies,
    pendingVerifications,
    monthlyCandidates,
    monthlyCompanies,
    recentActivities,
    systemHealth,
  });
};

export default getDashboardStats;
