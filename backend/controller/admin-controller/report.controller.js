// These are the models for report and analytics
import reportManagement from "../../models/admin-model/reports-management/report.management.js";
import PDFDocument from "pdfkit";
// import ExcelJS from "exceljs";


//----Report controllers-----

//report of new users registeration per month

const getNewUserRegistrationReport = async (req, res) => {
  const report = await reportManagement.newUserReport();
  res.status(200).json({
    success: true,
    data: report,
  });
};

//report of verified internships

const getVerifiedInernshipReport = async (req, res) => {
  const report = await reportManagement.verifiedInternshipReports();
  res.status(200).json({
    success: true,
    data: report,
  });
};

// get Job posting trend report

const getJobPostingTrendReport = async (req, res) => {
  const report = await reportManagement.jobPostingTrendReport();
  res.status(200).json({
    success: true,
    data: report,
  });
};

//candidate placement success report

const getCandidatePlacementSuccessReport = async (req, res) => {
  const report = await reportManagement.candidatePlacementSuccess();
  res.status(200).json({
    success: true,
    data: report,
  });
};

//skill distribution report

const skillDistributionReport = async (req, res) => {
  const report = await reportManagement.skillDistribution();
  res.status(200).json({
    success: true,
    data: report,
  });
};

//company activities report
const getCompanyActivities = async (req, res) => {
  const report = await reportManagement.getCompanyActivities();
  res.status(200).json({
    success: true,
    data: report,
  });
};

//assessment performance report
const assessmentPerformanceReport = async (req, res) => {
  const report = await reportManagement.getAssessmentPerformance();
  res.status(200).json({
    success: true,
    data: report,
  });
};

//export report
const exportReport = async (req, res) => {
  const { type, report } = req.query;

  //  validation (RETURN added)
  if (!type || !report) {
    return res.status(400).json({
      success: false,
      message: "Type and Report are required",
    });
  }

  let reportData;

  if (report === "new-users") {
    reportData = await reportManagement.newUserReport();
  } else if (report === "job-trends") {
    reportData = await reportManagement.jobPostingTrendReport();
  } else if (report === "placement-success") {
    reportData = await reportManagement.candidatePlacementSuccess();
  } else if (report === "verified-internships") {
    reportData = await reportManagement.verifiedInternshipReports();
  } else if (report === "company-activities") {
    reportData = await reportManagement.getCompanyActivities();
  } else if (report === "assessment-performance") {
    reportData = await reportManagement.getAssessmentPerformance();
  }else if(report === "skills-distribution"){
    reportData = await reportManagement.skillDistribution();
  }

  // invalid report check (RETURN added)
  if (!reportData || reportData.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid report type or no data found",
    });
  }

  /* ===================== PDF ===================== */
  if (type === "pdf") {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${report}.pdf`);

    doc.pipe(res);
    doc.fontSize(18).text(`Report: ${report}`, { underline: true });
    doc.moveDown();

    reportData.forEach((row) => {
      doc.fontSize(12).text(JSON.stringify(row));
      doc.moveDown(0.5);
    });

    doc.end();
    return;
  }

  /* ===================== CSV ===================== */
  if (type === "csv") {
    let csv = "";

    const headers = Object.keys(reportData[0]).join(",");
    csv += headers + "\n";

    reportData.forEach((row) => {
      csv += Object.values(row).join(",") + "\n";
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${report}.csv`);

    return res.send(csv);
  }

  /* ===================== EXCEL ===================== */
  if (type === "exceljs") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    sheet.columns = Object.keys(reportData[0]).map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    sheet.addRows(reportData);

    res.setHeader("Content-Disposition", `attachment; filename=${report}.xlsx`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  return res.status(400).json({
    success: false,
    message: "Unsupported export type",
  });
};

//-----close report controllers-----

export default {
    //report constrollers
  getNewUserRegistrationReport,
  getVerifiedInernshipReport,
  getJobPostingTrendReport,
  getCandidatePlacementSuccessReport,
  skillDistributionReport,
  getCompanyActivities,
  assessmentPerformanceReport,
  exportReport
}