// These models are being imported from admin-model/verification-management
import experienceVerification from "../../models/admin-model/verification-management/experience.verification.js";
import skillVerification from "../../models/admin-model/verification-management/skill.verification.js";
import { handleVerificationStatusNotification } from "../../models/admin-model/verification-management/helper-function/verificationNotification.service.js";

// experience verification
const getAllPendingVerifications = async (req, res) => {
  // to get its information
  const rows = await experienceVerification.getPending();
  res.status(200).json({
    success: true,
    data: rows,
  });
};

//fetching verification documents to verify experience
const viewDocument = async (req, res) => {
  const { id } = req.params;
  const row = await experienceVerification.viewDocument(id);
  if (row.length === 0) {
    res.status(404).json({
      success: false,
      message: "Document not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Document fetched successfully",
    data: row[0].document_url,
  });
};

const validateExperienceSubmission = async (req, res) => {
  const { id } = req.params;

  // Fetch experience record
  const [rows] = await experienceVerification.getById(id);
  console.log(rows)
  if (rows=== 0) {
    return res.status(404).json({
      success: false,
      message: "Experience record not found",
    });
  }

  const experience = rows;

  const { candidate_id, company_id, start_date, end_date, document_url } =
    experience;

  // Required fields check
  if (
    !candidate_id ||
    !company_id ||
    !start_date ||
    !end_date ||
    !document_url
  ) {
    return res.status(400).json({
      success: false,
      message: "Fields missing in experience record",
    });
  }

  // Date validation
  const start = new Date(start_date);
  const end = new Date(end_date);
  const today = new Date();

  if (start > end) {
    return res.status(400).json({
      success: false,
      message: "Start date must be before end date",
    });
  }

  if (end > today) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be in the future",
    });
  }

  // Duration validation
  const diffInDays = (end - start) / (1000 * 60 * 60 * 24);

  if (diffInDays < 30) {
    return res.status(400).json({
      success: false,
      message: "Experience must be at least 1 month",
    });
  }

  if (diffInDays > 730) {
    return res.status(400).json({
      success: false,
      message: "Experience cannot exceed 2 years",
    });
  }

  // Company existence check
  const [company] = await experienceVerification.validate(company_id);

  if (company.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Company does not exist",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Experience validated successfully",
  });
};

//approving,rejecting,more info status update
const updateVerificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_remarks, verified } = req.body;
  const row = await experienceVerification.updateVerificationStatus(
    id,
    status,
    admin_remarks,
    verified
  );

  if (!row || row.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Verification record not found",
    });
  }

  // Call the notification handler
  await handleVerificationStatusNotification({
    verificationId: id,
    status,
    adminRemarks: admin_remarks,
    adminId: req.adminId || null,
  });

  res.status(200).json({
    success: true,
    message: "verification status updated successfully"
  });
};

// add admin remarks
const addRemarks = async (req, res) => {
  const { id } = req.params;
  const { admin_remarks } = req.body;
  await experienceVerification.addRemarks(admin_remarks, id);
  res.status(200).json({
    success: true,
    message: "Admin added remarks successfully"
  });
};

// status of candidate updation
const updateCandidateExperience = async (req, res) => {
  const { id } = req.params;
  const verified_experience = req.body.verified_experience;
   await experienceVerification.updateCandidateExperience(
    id,
    verified_experience
  );
  res.status(200).json({
    success: true,
    message: "candidate experience updated successfully"
  });
};

//skill verification part
//getting all pending skill
const pendingSkillVerifications = async (req, res) => {
  const rows = await skillVerification.pendingSkill();
  res.status(200).json({
    success: true,
    data: rows,
  });
};

// view skill details
const skillView = async (req, res) => {
  const { id } = req.params;
  const row = await skillVerification.viewSkill(id);
  res.status(200).json({
    success: true,
    data: row,
  });
};

//skill status updation
const updateSkillStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_remarks } = req.body;
   await skillVerification.updateStatus(id, status, admin_remarks);
  res.status(200).json({
    success: true,
    message: "skill status updated successfully"
  });
};

// update admin remarks
const updateAdminRemarks = async (req, res) => {
  const { id } = req.params;
  const { admin_remarks } = req.body;
  await skillVerification.updateAdminRemarks(id, admin_remarks);
  res.status(200).json({
    success: true,
    message: "Admin remarks updated successfully"
  });
};

export default {
getAllPendingVerifications,
  viewDocument,
  updateVerificationStatus,
  addRemarks,
  updateCandidateExperience,
  validateExperienceSubmission,
  // skill verification constrollers
  pendingSkillVerifications,
  skillView,
  updateSkillStatus,
  updateAdminRemarks
}