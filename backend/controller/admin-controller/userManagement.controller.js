// =============user_management controller functions===================
import activateCandidate from "../../models/admin-model/user-management/model.activateCandidate.js";
import deactivateCandidate from "../../models/admin-model/user-management/model.deactivateCandidate.js";
import exportCandidatesCSV from "../../models/admin-model/user-management/model.exportCandidatesCSV.js";
import getAllCandidates from "../../models/admin-model/user-management/model.getAllCandidates.js";
import getCandidateById from "../../models/admin-model/user-management/model.getCandidateById.js";
import getInternshipExperience from "../../models/admin-model/user-management/model.getInternshipExperience.js";
import getSkillProfile from "../../models/admin-model/user-management/model.getSkillProfile.js";
import resetCandidatePassword from "../../models/admin-model/user-management/model.resetCandidatePassword.js";
import updateCandidateInfoById from "../../models/admin-model/user-management/model.updateCandidate.js";

// View all candidates
const viewAllCandidates = async (req, res) => {
  try {
    const search = req.query.search || "";
    const candidates = await getAllCandidates(search);
    res.json({ success: true, data: candidates });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// View single candidate by ID
const viewCandidateById = async (req, res) => {
  try {
    const id = req.params.id;
    const candidate = await getCandidateById(id);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }
    res.json({ success: true, data: candidate });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update candidate details
const updateCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log("Update request for candidate ID:", id);
    console.log("Update data:", data);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Validate data is not empty
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
    }

    // Validate allowed fields (security measure)
    const allowedFields = [
      "name",
      "email",
      "phone",
      "city",
      "country",
      "status",
      "skills",
      "verified_experience",
      "verified_skills",
      "total_experience_months",
      "internship_count",
      "profile_completion",
    ];

    const invalidFields = Object.keys(data).filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
        allowedFields: allowedFields,
      });
    }

    const result = await updateCandidateInfoById(id, data);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      message: "Candidate Updated Successfully",
      data: {
        id: id,
        affectedRows: result.affectedRows,
        changes: data,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Deactivate candidate
const deactivateCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deactivateCandidate(id);
    res.json({
      success: true,
      message: "Candidate Deactivated Successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Activate candidate
const activateCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await activateCandidate(id);
    res.json({
      success: true,
      message: "Candidate Activated Successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// internshipExperience controller
const internshipExperience = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await getInternshipExperience(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No internship experience found for this candidate",
      });
    }
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// skillProfile controller
const skillProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await getSkillProfile(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No skill profile found for this candidate",
      });
    }
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// resetCandidatePassword controller
const resetCandidatePasswordController = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const result = await resetCandidatePassword(id, newPassword);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// export candidates as CSV
const exportCandidatesCSVController = async (req, res) => {
  try {
    const csv = await exportCandidatesCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="candidates.csv"'
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export default {
  viewAllCandidates,
  viewCandidateById,
  updateCandidateById,
  deactivateCandidateById,
  activateCandidateById,
  internshipExperience,
  skillProfile,
  resetCandidatePasswordController,
  exportCandidatesCSVController
}