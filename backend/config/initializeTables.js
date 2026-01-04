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
  createAdminRolesAndPermissionsTable
} = adminTable;

//for authentication
const {
  createAdminUsersTable,
  createUserTable,
  verificationTokens
} = userTable

const initializeTables = async () => {
  await createAdminUsersTable();
  await createAdminRolesAndPermissionsTable();
   //for auth
  await createUserTable();
  await verificationTokens();
  await getAdminDashboardTable();
  await verificationManagementTable();
   await createAssessmentTables();
  await matchingAlgorithmControlTables();
  await createCMSTables();
  await createPortalSettingsTables();
  await createSupportTicketTables();
  await notificationsTable();
 
};

module.exports = { initializeTables };
