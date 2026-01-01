const adminTable = require("../tables/admin-table/admin.table.js");
const userTable = require("../tables/users/users.js")
const {
  verificationManagementTable,
  getAdminDashboardTable,
  matchingAlgorithmControlTables,
  createCMSTables,
  createPortalSettingsTables,
  createSupportTicketTables,
  notificationsTable,
  createAssessmentTables,
} = adminTable;

//for authentication
const {
  createUserTable,
  verificationTokens
} = userTable

const initializeTables = async () => {
  await verificationManagementTable();
  await getAdminDashboardTable();
  await matchingAlgorithmControlTables();
  await createCMSTables();
  await createPortalSettingsTables();
  await createSupportTicketTables();
  await notificationsTable();
  await createAssessmentTables();
  
  //for auth
  await createUserTable();
  await verificationTokens();
};

module.exports = { initializeTables };
