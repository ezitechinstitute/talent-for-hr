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
   //for auth
  await createUserTable();
  await verificationManagementTable();
  await verificationTokens();
  await getAdminDashboardTable();
  await matchingAlgorithmControlTables();
  await createCMSTables();
  await createPortalSettingsTables();
  await createSupportTicketTables();
  await notificationsTable();
  await createAssessmentTables();
  
 
};

module.exports = { initializeTables };
