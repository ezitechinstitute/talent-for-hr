const jobModel = require('../../models/admin-model/job-internship-management/model.job.js');
const applicantModel = require('../../models/admin-model/job-internship-management/model.jobApplicants.js');
const internshipsModel = require('../../models/admin-model/job-internship-management/model.internships.js');
const internApplicantModel = require('../../models/admin-model/job-internship-management/model.internshipApplicants.js');
const notificationService = require('../../models/admin-model/notification-management/model.notification.js');
const { uploadToCloudinary } = require('../../utils/cloudinary.js');
const db = require('../../config/db.js');
const emailService = require('../../services/email.service.js');

const createJob = async (req, res) => {
  if (!["admin", "hr"].includes(req.user.role)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!req.body.title) {
    return res.status(400).json({ message: "Title is required" });
  }

  let companyId = null;

  if (req.user.role === "hr") {
    const [[company]] = await db.query(
      "SELECT id FROM companies WHERE user_id = ?",
      [req.user.id]
    );

    if (!company) {
      return res.status(400).json({
        message: "HR is not linked to any company",
      });
    }

    companyId = company.id;
  }

  if (req.user.role === "admin") {
    if (!req.body.company_id) {
      return res.status(400).json({
        message: "company_id is required for admin",
      });
    }
    companyId = req.body.company_id;
  }

  const jobId = await jobModel.createJob({
    ...req.body,
    company_id: companyId,
    actor_id: req.user.id,
    actor_role: req.user.role,
    created_by: req.user.id,
  });

  res.status(201).json({
    success: true,
    jobId,
  });
};

const updateJob = async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const job = await jobModel.getJobById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.actor_id !== req.user.id || job.actor_role !== req.user.role) {
    return res.status(403).json({
      message: "You are not allowed to update this job",
    });
  }

  const updated = await jobModel.updateJob(jobId, {
    ...req.body,
    updated_by: req.user.id,
    actor_id: req.user.id,
    actor_role: req.user.role,
  });

  res.json({
    success: true,
    affectedRows: updated.affectedRows,
  });
};

const publishJob = async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const job = await jobModel.getJobById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.actor_id !== req.user.id || job.actor_role !== req.user.role) {
    return res.status(403).json({
      message: "You are not allowed to publish this job",
    });
  }

  await jobModel.updateJob(jobId, {
    status: "live",
    published_at: new Date(),
    updated_by: req.user.id,
  });

  res.json({ success: true, message: "Job published" });
};

const listJobs = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      job_type: req.query.job_type,
      company_name: req.query.company_name,
      search: req.query.search,
      title: req.query.title,
      offset: parseInt(req.query.offset || "0", 10),
      limit: parseInt(req.query.limit || "10", 10),
    };

    if (req.user.role === "candidate") {
      filters.status = "live";
    }

    if (["admin", "hr"].includes(req.user.role)) {
      filters.actor_id = req.user.id;
      filters.actor_role = req.user.role;
    }

    const result = await jobModel.listJobs(filters);

    return res.json({
      success: true,
      meta: {
        total_jobs: result.total,
        total_live_jobs: result.totalLive,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: filters.limit,
      },
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getJob = async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const job = await jobModel.getJobById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (req.user.role === "candidate" && job.status !== "live") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (
    ["admin", "hr"].includes(req.user.role) &&
    (job.actor_id !== req.user.id || job.actor_role !== req.user.role)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json({ success: true, data: job });
};

const applyForJob = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can apply for jobs",
      });
    }

    const job_id = parseInt(req.params.id, 10);
    const candidate_id = req.body.candidate_id;
    const { cover_letter } = req.body;

    const job = await jobModel.getJobById(job_id);
    if (!job || job.status !== "live") {
      return res.status(400).json({
        success: false,
        message: "Job not available",
      });
    }

    let resumeUrl = null;
    if (req.file?.path) {
      const cloudResp = await uploadToCloudinary(req.file.path);
      resumeUrl = cloudResp.secure_url;
    }

    const applicationId = await applicantModel.applyJob({
      job_id,
      candidate_id,
      resume_url: resumeUrl,
      cover_letter,
      application_source: "web",
    });

    const [[candidate]] = await db.query(
      "SELECT email FROM candidates WHERE id = ?",
      [candidate_id]
    );

    const [[company]] = await db.query(
      `SELECT c.email, c.name 
       FROM companies c
       JOIN jobs j ON j.company_id = c.id
       WHERE j.id = ?`,
      [job_id]
    );

    await notificationService.createNotification({
      user_id: candidate_id,
      user_type: "candidate",
      title: "Job Application Submitted",
      message: `You successfully applied for ${job.title}. Please wait for further updates.`,
      reference_module: "jobs",
      reference_id: job_id,
    });

    // Company Notification
    await notificationService.createNotification({
      user_id: job.company_id,
      user_type: "company",
      title: "New Job Application",
      message: `A candidate has applied for your job: ${job.title}`,
      reference_module: "jobs",
      reference_id: job_id,
    });

    const [admins] = await db.query(
      `SELECT id FROM users WHERE role = 'admin'`
    );

    for (const admin of admins) {
      await notificationService.createNotification({
        user_id: admin.id,
        user_type: "admin",
        title: "New Job Application",
        message: `Application submitted for "${job.title}".`,
        reference_module: "jobs",
        reference_id: job_id,
      });
    }


    // Candidate Email
    await emailService.sendEmail({
      to: candidate.email,
      subject: "Application Submitted Successfully",
      html: `
    <p>Dear ${candidate.name || "Candidate"},</p>

    <p>
      Thank you for applying for the position of 
      <strong>${job.title}</strong>.
    </p>

    <p>
      Your application has been successfully submitted and is currently
      under review by the hiring team.
    </p>

    <p>
      We will contact you if your profile is shortlisted for the next stage.
      Please keep an eye on your email for further updates.
    </p>

    <p>
      Best regards,<br />
      <strong>The Recruitment Team</strong>
    </p>
  `,
    });

    // Company Email
    await emailService.sendEmail({
      to: company.email,
      subject: `New Application Received – ${job.title}`,
      html: `
    <p>Dear Hiring Team,</p>

    <p>
      A new candidate has applied for the position of 
      <strong>${job.title}</strong>.
    </p>

    <p>
      You may review the candidate’s resume using the link below:
    </p>

    <p>
      <a href="${resumeUrl}" target="_blank">
        View Candidate Resume
      </a>
    </p>

    <p>
      Please log in to your dashboard to take further action on this
      application.
    </p>

    <p>
      Regards,<br />
      <strong>Talent Management System</strong>
    </p>
  `,
    });

    // Admin Email
    await emailService.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "Admin Alert: New Job Application Submitted",
      html: `
    <p>Hello Admin,</p>

    <p>
      A candidate has submitted an application for the position of 
      <strong>${job.title}</strong>.
    </p>

    <p>
      Resume link:
      <a href="${resumeUrl}" target="_blank">
        View Resume
      </a>
    </p>

    <p>
      This email is for monitoring and audit purposes.
    </p>

    <p>
      System Notification<br />
      <strong>Recruitment Platform</strong>
    </p>
  `,
    });

    res.status(201).json({
      success: true,
      applicationId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Already applied",
      });
    }
    throw err;
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id, 10);

    const job = await jobModel.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      job.actor_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view applicants for this job",
      });
    }

    const filters = {
      status: req.query.status,
      name: req.query.name,
      email: req.query.email,
      offset: parseInt(req.query.offset || "0", 10),
      limit: parseInt(req.query.limit || "10", 10),
    };

    const result = await applicantModel.getApplicantsByJob(jobId, filters);

    return res.json({
      success: true,
      meta: {
        total_applicants: result.total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: filters.limit,
      },
      data: result.rows,
    });
  } catch (err) {
    console.error("Get Job Applicants Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateJobApplicationStatus = async (req, res) => {
  const applicationId = parseInt(req.params.id, 10);
  const jobId = parseInt(req.params.jobId, 10);
  const { status } = req.body;

  if (!applicationId || !jobId) {
    return res.status(400).json({
      success: false,
      message: "applicationId and jobId are required in URL",
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "status is required in body",
    });
  }

  const job = await jobModel.getJobById(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  if (job.actor_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to update applications for this job",
    });
  }

  const result = await applicantModel.updateApplicationStatus(
    applicationId,
    jobId,
    status,
    req.user.id || null
  );

  if (!result || result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "No matching application found for this job",
    });
  }

  const [[data]] = await db.query(
    `
      SELECT 
        ja.candidate_id,
        c.email AS candidate_email,
        j.title AS job_title,
        j.company_id,
        co.email AS company_email
      FROM job_applicants ja
      JOIN candidates c ON c.id = ja.candidate_id
      JOIN jobs j ON j.id = ja.job_id
      JOIN companies co ON co.id = j.company_id
      WHERE ja.id = ? AND ja.job_id = ?
      `,
    [applicationId, jobId]
  );

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Application data not found",
    });
  }

  // Status messages
  const statusMessageMap = {
    applied: "Your job application has been submitted.",
    shortlisted: "Good news! You have been shortlisted for the job.",
    rejected: "We regret to inform you that your application was rejected.",
    hired: "Congratulations! You have been selected for the job.",
  };

  const candidateMessage =
    statusMessageMap[status] || "Your job application status was updated.";


  // Candidate notification
  await notificationService.createNotification({
    user_id: data.candidate_id,
    user_type: "candidate",
    title: "Job Application Status Update",
    message: candidateMessage,
    reference_module: "jobs",
    reference_id: jobId,
  });

  // Company notification
  await notificationService.createNotification({
    user_id: data.company_id,
    user_type: "company",
    title: "Job Application Status Updated",
    message: `Application status for "${data.job_title}" changed to "${status}".`,
    reference_module: "jobs",
    reference_id: jobId,
  });

  const [admins] = await db.query(
    `SELECT id FROM users WHERE role = 'admin'`
  );

  for (const admin of admins) {
    await notificationService.createNotification({
      user_id: admin.id,
      user_type: "admin",
      title: "Job Application Status Updated",
      message: `Application ID ${applicationId} updated to "${status}".`,
      reference_module: "jobs",
      reference_id: jobId,
    })
  };

  // Candidate email
  if (data.candidate_email) {
    await emailService.sendEmail({
      to: data.candidate_email,
      subject: "Job Application Status Update",
      html: `
      <p>Dear Candidate,</p>

      <p>
        We would like to inform you that the status of your application for the
        position of <strong>${data.job_title}</strong> has been updated.
      </p>

      <p>
        <strong>Current Status:</strong> ${status}
      </p>

      <p>
        Please log in to your dashboard to view detailed information and any
        next steps related to your application.
      </p>

      <p>
        Best regards,<br />
        <strong>The Recruitment Team</strong>
      </p>
    `,
    });
  }

  // Company email
  if (data.company_email) {
    await emailService.sendEmail({
      to: data.company_email,
      subject: `Job Application Status Updated – ${data.job_title}`,
      html: `
      <p>Dear Hiring Team,</p>

      <p>
        The status of a job application associated with the position
        <strong>${data.job_title}</strong> has been updated.
      </p>

      <p>
        <strong>Updated Status:</strong> ${status}
      </p>

      <p>
        Please access your dashboard to review the application and take any
        further action if required.
      </p>

      <p>
        Regards,<br />
        <strong>Talent Management System</strong>
      </p>
    `,
    });
  }

  // Admin email
  await emailService.sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "Admin Alert: Job Application Status Updated",
    html: `
    <p>Hello Admin,</p>

    <p>
      A job application status has been updated in the system.
    </p>

    <p>
      <strong>Job Title:</strong> ${data.job_title}<br />
      <strong>Application ID:</strong> ${applicationId}<br />
      <strong>New Status:</strong> ${status}
    </p>

    <p>
      This notification is sent for monitoring and audit purposes.
    </p>

    <p>
      System Notification<br />
      <strong>Recruitment Platform</strong>
    </p>
  `,
  });

  return res.json({
    success: true,
    message: "Application status updated and notifications sent",
  });
};

const jobsIncrementViews = async (req, res) => {
  const id = req.params.id;
  await jobModel.jobIncrementViews(id);
  res.json({ success: true, message: "Job view count incremented" });
};

const createInternship = async (req, res) => {
  try {
    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    let companyId = null;

    if (req.user.role === "hr") {
      const [[company]] = await db.query(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id]
      );

      if (!company) {
        return res.status(400).json({
          message: "HR is not linked to any company",
        });
      }

      companyId = company.id;
    }

    if (req.user.role === "admin") {
      if (!req.body.company_id) {
        return res.status(400).json({
          message: "company_id is required",
        });
      }

      companyId = req.body.company_id;
    }

    const internshipId = await internshipsModel.createInternship({
      ...req.body,
      company_id: companyId,
      actor_id: req.user.id,
      actor_role: req.user.role,
      created_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      internshipId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateInternship = async (req, res) => {
  try {
    const internshipId = parseInt(req.params.id, 10);

    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const internship = await internshipsModel.getInternshipById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    if (req.user.role === "hr") {
      const [[company]] = await db.query(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id]
      );

      if (!company || company.id !== internship.company_id) {
        return res.status(403).json({
          message: "You can update only your own internship",
        });
      }
    }

    const result = await internshipsModel.updateInternship(internshipId, {
      ...req.body,
      updated_by: req.user.id,
    });

    res.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const publishInternship = async (req, res) => {
  try {
    const internshipId = parseInt(req.params.id, 10);

    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const internship = await internshipsModel.getInternshipById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    if (req.user.role === "hr") {
      const [[company]] = await db.query(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id]
      );

      if (!company || company.id !== internship.company_id) {
        return res.status(403).json({
          message: "You can publish only your own internship",
        });
      }
    }

    await internshipsModel.updateInternship(internshipId, {
      status: "live",
      published_at: new Date(),
      updated_by: req.user.id,
    });

    res.json({
      success: true,
      message: "Internship published",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const listInternships = async (req, res) => {
  const filters = {
    status: req.query.status,
    search: req.query.search,
    title: req.query.title,
    duration_months: req.query.duration_months,
    company_name: req.query.company_name,
    offset: parseInt(req.query.offset || "0", 10),
    limit: parseInt(req.query.limit || "10", 10),
  };

  if (req.user?.role === "hr") {
    filters.company_id = req.user.company_id;
  } else if (req.user?.role === "admin") {
    if (req.query.company_id) {
      filters.company_id = parseInt(req.query.company_id, 10);
    }
  } else {
    filters.status = "live";
  }

  const result = await internshipsModel.listInternships(filters);

  res.json({
    success: true,
    meta: {
      total_internships: result.total,
      total_live_internships: result.totalLive,
      page: Math.floor(filters.offset / filters.limit) + 1,
      limit: filters.limit,
    },
    stats: {
      by_status: result.byStatus,
      by_company: result.byCompany,
    },
    data: result.rows,
  });
};

const getInternship = async (req, res) => {
  try {
    const internshipId = parseInt(req.params.id, 10);

    const internship = await internshipsModel.getInternshipById(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    if (!req.user) {
      if (internship.status !== "live") {
        return res.status(403).json({
          success: false,
          message: "Internship not available",
        });
      }

      return res.json({
        success: true,
        data: internship,
      });
    }

    if (req.user.role === "admin") {
      return res.json({
        success: true,
        data: internship,
      });
    }

    if (req.user.role === "hr") {
      const [[company]] = await db.query(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id]
      );

      if (!company || company.id !== internship.company_id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return res.json({
        success: true,
        data: internship,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const applyForInternship = async (req, res) => {
  try {

    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can apply",
      });
    }
    const internship_id = parseInt(req.params.id, 10);
    const { candidate_id, cover_letter, application_source = "web" } = req.body;

    if (!candidate_id) {
      return res.status(400).json({
        success: false,
        message: "candidate_id required",
      });
    }

    const internship = await internshipsModel.getInternshipById(internship_id);
    if (!internship || internship.status !== "live") {
      return res.status(400).json({
        success: false,
        message: "Internship not available",
      });
    }

    const resumeLocalPath = req.file?.path;
    let uploadResp = null;

    if (resumeLocalPath) {
      try {
        uploadResp = await uploadToCloudinary(resumeLocalPath);
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload resume",
        });
      }
    }

    const resume_url = uploadResp?.secure_url || null;

    const applicationId = await internApplicantModel.applyInternship({
      internship_id,
      candidate_id,
      resume_url,
      cover_letter,
      application_source,
    });

    const [[candidate]] = await db.query(
      "SELECT email FROM candidates WHERE id = ?",
      [candidate_id]
    );

    const [[company]] = await db.query(
      `SELECT c.id, c.email 
       FROM companies c
       JOIN internships i ON i.company_id = c.id
       WHERE i.id = ?`,
      [internship_id]
    );

    // Candidate notification
    await notificationService.createNotification({
      user_id: candidate_id,
      user_type: "candidate",
      title: "Internship Application Submitted",
      message: `You successfully applied for "${internship.title}". Please wait for updates.`,
      reference_module: "internships",
      reference_id: internship_id,
    });

    // Company notification
    if (company?.id) {
      await notificationService.createNotification({
        user_id: company.id,
        user_type: "company",
        title: "New Internship Application",
        message: `A candidate applied for your internship "${internship.title}".`,
        reference_module: "internships",
        reference_id: internship_id,
      });
    }

    // Admin notification
    await notificationService.createNotification({
      user_id: null,
      user_type: "admin",
      title: "New Internship Application",
      message: `Candidate applied for internship "${internship.title}".`,
      reference_module: "internships",
      reference_id: internship_id,
    });

    // Candidate email
    await emailService.sendEmail({
      to: candidate.email,
      subject: "Internship Application Submitted Successfully",
      html: `
    <p>Dear ${candidate.name || "Candidate"},</p>

    <p>
      Thank you for applying for the internship position of 
      <strong>${internship.title}</strong>.
    </p>

    <p>
      Your application has been successfully submitted and is currently
      under review.
    </p>

    <p>
      If your profile is shortlisted, the hiring team will contact you
      for the next steps. Please monitor your email for further updates.
    </p>

    <p>
      Best regards,<br />
      <strong>The Recruitment Team</strong>
    </p>
  `,
    });

    // Company email
    if (company?.email) {
      await emailService.sendEmail({
        to: company.email,
        subject: `New Internship Application Received – ${internship.title}`,
        html: `
      <p>Dear Hiring Team,</p>

      <p>
        A new candidate has applied for the internship position of 
        <strong>${internship.title}</strong>.
      </p>

      ${resume_url
            ? `
          <p>
            You can review the candidate’s resume using the link below:
          </p>
          <p>
            <a href="${resume_url}" target="_blank">
              View Candidate Resume
            </a>
          </p>
          `
            : `<p>No resume was attached with this application.</p>`
          }

      <p>
        Please log in to your dashboard to review and manage this
        application.
      </p>

      <p>
        Regards,<br />
        <strong>Talent Management System</strong>
      </p>
    `,
      });
    }

    // Admin email
    await emailService.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "Admin Alert: New Internship Application Submitted",
      html: `
    <p>Hello Admin,</p>

    <p>
      A candidate has submitted an application for the internship position:
      <strong>${internship.title}</strong>.
    </p>

    ${resume_url
          ? `
        <p>
          Resume link:
          <a href="${resume_url}" target="_blank">
            View Resume
          </a>
        </p>
        `
          : `<p>No resume was provided by the candidate.</p>`
        }

    <p>
      This notification is sent for monitoring and record-keeping purposes.
    </p>

    <p>
      System Notification<br />
      <strong>Recruitment Platform</strong>
    </p>
  `,
    });

    return res.status(201).json({
      success: true,
      applicationId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "You already applied for this internship",
      });
    }

    console.error("applyForInternship error:", err);
    throw err;
  }
};

const getInternApplicants = async (req, res) => {
  try {
    const internshipId = parseInt(req.params.id, 10);
    if (!internshipId) {
      return res.status(400).json({
        success: false,
        message: "Invalid internship ID",
      });
    }

    const internship = await internshipsModel.getInternshipById(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    // ================= AUTH REQUIRED =================
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ================= ADMIN =================
    if (req.user.role === "admin") {
      // admin can see all applicants
    }

    // ================= HR =================
    else if (req.user.role === "hr") {
      const [[company]] = await db.query(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id]
      );

      if (!company || company.id !== internship.company_id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }
    }

    // ================= BLOCK OTHERS =================
    else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // ================= FETCH APPLICANTS =================
    const filters = {
      status: req.query.status,
      name: req.query.name,
      email: req.query.email,
      offset: parseInt(req.query.offset || "0", 10),
      limit: parseInt(req.query.limit || "10", 10),
    };

    const result =
      await internApplicantModel.getApplicantsByInternship(
        internshipId,
        filters
      );

    return res.json({
      success: true,
      meta: {
        total_applicants: result.total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: filters.limit,
      },
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateInternApplicationStatus = async (req, res) => {
  const applicationId = parseInt(req.params.id, 10);
  const internshipId = parseInt(req.params.internshipId, 10);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "status required" });
  }

  const internship = await internshipsModel.getInternshipById(internshipId);
  if (!internship) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  // 🔒 FIXED HR ownership
  if (req.user.role === "hr") {
    const [[company]] = await db.query(
      "SELECT id FROM companies WHERE user_id = ?",
      [req.user.id]
    );

    if (!company || company.id !== internship.company_id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
  }

  const result = await internApplicantModel.updateApplicationStatus(
    applicationId,
    internshipId,
    status,
    req.user.id
  );

  if (!result.affectedRows) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  const [[application]] = await db.query(
    `
      SELECT ia.candidate_id, ia.resume_url, i.title, i.company_id
      FROM internship_applicants ia
      JOIN internships i ON ia.internship_id = i.id
      WHERE ia.id = ? AND ia.internship_id = ?
      `,
    [applicationId, internshipId]
  );

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application data not found",
    });
  }

  const [[candidate]] = await db.query(
    "SELECT email FROM candidates WHERE id = ?",
    [application.candidate_id]
  );

  const [[company]] = await db.query(
    "SELECT email FROM companies WHERE id = ?",
    [application.company_id]
  );

  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  // ===================== Notifications =====================

  // Candidate notification
  await notificationService.createNotification({
    user_id: application.candidate_id,
    user_type: "candidate",
    title: `Internship Application ${statusText}`,
    message: `Your application for "${application.title}" has been ${status}.`,
    reference_module: "internships",
    reference_id: internshipId,
  });

  // Company notification
  if (application.company_id) {
    await notificationService.createNotification({
      user_id: application.company_id,
      user_type: "company",
      title: "Internship Application Updated",
      message: `Application status changed to "${status}" for "${application.title}".`,
      reference_module: "internships",
      reference_id: internshipId,
    });
  }

  const [admins] = await db.query(
    `SELECT id FROM users WHERE role = 'admin'`
  );

  for (const admin of admins) {
    await notificationService.createNotification({
      user_id: admin.id,
      user_type: "admin",
      title: "Internship Application Status Updated",
      message: `Application ${applicationId} marked as "${status}" for "${application.title}".`,
      reference_module: "internships",
      reference_id: internshipId,
    })
  };

  // ===================== Email =====================

  // Candidate email
  if (candidate?.email) {
    await emailService.sendEmail({
      to: candidate.email,
      subject: `Internship Application Update – ${application.title}`,
      html: `
      <p>Dear ${candidate.name || "Candidate"},</p>

      <p>
        Thank you for your interest in the internship position of
        <strong>${application.title}</strong>.
      </p>

      <p>
        We would like to inform you that the status of your application is:
        <strong>${statusText}</strong>.
      </p>

      ${status === "shortlisted"
          ? `
            <p>
              Congratulations! Your profile has been shortlisted for the next
              stage of the selection process. Our team will contact you shortly
              with further details.
            </p>
          `
          : status === "hired"
            ? `
            <p>
              We are pleased to inform you that you have been selected for this
              internship position. Further onboarding details will be shared
              with you soon.
            </p>
          `
            : `
            <p>
              While your profile was carefully reviewed, we regret to inform you
              that you were not selected at this time. We encourage you to apply
              for future opportunities that match your skills.
            </p>
          `
        }

      <p>
        You may log in to your dashboard at any time to track your application
        status.
      </p>

      <p>
        Best regards,<br />
        <strong>The Recruitment Team</strong>
      </p>
    `,
    });
  }

  // Company email
  if (company?.email) {
    await emailService.sendEmail({
      to: company.email,
      subject: `Application ${statusText} – ${application.title}`,
      html: `
          <p>An internship application has been updated.</p>
          <p><b>Internship:</b> ${application.title}</p>
          <p><b>Status:</b> ${statusText}</p>
        `,
    });
  }

  // Admin email
  await emailService.sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "Admin Monitor: Internship Application Status Update",
    html: `
        <p>Internship: <b>${application.title}</b></p>
        <p>Application ID: ${applicationId}</p>
        <p>Status: <b>${statusText}</b></p>
      `,
  });

  res.json({
    success: true,
    message: "Internship application status updated successfully",
  });
};

const internshipsIncrementViews = async (req, res) => {
  const id = req.params.id;
  await internshipsModel.internshipIncrementViews(id);
  res.json({ success: true, message: "Internship view count incremented" });
};

module.exports = {
  createJob,
  updateJob,
  publishJob,
  listJobs,
  getJob,
  jobsIncrementViews,
  applyForJob,
  getJobApplicants,
  updateJobApplicationStatus,
  createInternship,
  updateInternship,
  publishInternship,
  listInternships,
  getInternship,
  internshipsIncrementViews,
  applyForInternship,
  getInternApplicants,
  updateInternApplicationStatus,
}