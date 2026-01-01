import db from "../../config/db.js";

// These models are being imported from admin-model/candidate-assessment
import assessmentModel from "../../models/admin-model/candidate-assessment/model.assessments.js";
import questionModel from "../../models/admin-model/candidate-assessment/model.questions.js";
import resultModel from "../../models/admin-model/candidate-assessment/model.results.js";
import answerModel from "../../models/admin-model/candidate-assessment/model.answers.js";

// These models are being imported from admin-model/portal-settings
import platformConfigModel from "../../models/admin-model/portal-settings/model.platformConfig.js";
import smtpSettingsModel from "../../models/admin-model/portal-settings/model.smtpSettings.js";
import smsSettingsModel from "../../models/admin-model/portal-settings/model.smsSettings.js";
import paymentGatewayModel from "../../models/admin-model/portal-settings/model.paymentGateway.js";
import databaseBackupModel from "../../models/admin-model/portal-settings/model.databaseBackup.js";

// These models are being imported from admin-model/support-ticketing
import ticketModel from "../../models/admin-model/support-ticketing/model.tickets.js";
import ticketMessagesModel from "../../models/admin-model/support-ticketing/model.ticketMessages.js";

// Utilities
import { encrypt, decrypt, maskSensitiveData } from "../../utils/encryption.js";
import {
  isValidEmail,
  isValidHexColor,
  isValidPort,
  isValidURL,
  isValidAssessmentStatus,
  isValidQuestionType,
} from "../../utils/validations.js";

// These models are being imported from admin-model/activity-logs
import activityLogsModel from "../../models/admin-model/activity-logs/model.activityLogs.js";

// These are the models for notification management

import emailService from "../../services/email.service.js";
import notificationService from "../../models/admin-model/notification-management/model.notification.js";

// ==================== Candidate Assessment Module ====================

// Get all assessments
const getAssessments = async (req, res) => {
  try {
    const { difficulty, type } = req.query;
    let assessments;

    if (difficulty) {
      assessments = await assessmentModel.getAssessmentsByDifficulty(
        difficulty
      );
    } else if (type) {
      assessments = await assessmentModel.getAssessmentsByType(type);
    } else {
      assessments = await assessmentModel.getAllAssessments();
    }

    res.status(200).json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get assessment by ID
const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await assessmentModel.getAssessmentById(id);

    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get assessment with questions
const getAssessmentWithQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await assessmentModel.getAssessmentWithQuestions(id);

    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new assessment
const createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      difficulty,
      total_marks,
      time_limit_minutes,
      attempt_limit,
      status,
      company_id,
    } = req.body;

    if (!title || !type || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Title, type, and difficulty are required",
      });
    }

    // Validate question type
    if (!isValidQuestionType(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question type. Must be MCQ, coding, or scenario",
      });
    }

    // Validate status if provided
    if (status && !isValidAssessmentStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be draft, published, or closed",
      });
    }

    // Validate time limit (must be positive if provided)
    if (
      time_limit_minutes !== undefined &&
      time_limit_minutes !== null &&
      time_limit_minutes < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Time limit must be at least 1 minute",
      });
    }

    // Validate attempt limit (must be positive if provided)
    if (
      attempt_limit !== undefined &&
      attempt_limit !== null &&
      attempt_limit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Attempt limit must be at least 1",
      });
    }

    const id = await assessmentModel.createAssessment(
      title,
      description || null,
      type,
      difficulty,
      total_marks || 100,
      time_limit_minutes || null,
      attempt_limit || 1,
      status || "draft",
      company_id || null
    );

    res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      data: { id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an assessment
const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      difficulty,
      total_marks,
      time_limit_minutes,
      attempt_limit,
      status,
    } = req.body;

    const assessment = await assessmentModel.getAssessmentById(id);
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    // Validate status if provided
    if (status && !isValidAssessmentStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be draft, published, or closed",
      });
    }

    // Validate time limit if provided
    if (
      time_limit_minutes !== undefined &&
      time_limit_minutes !== null &&
      time_limit_minutes < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Time limit must be at least 1 minute",
      });
    }

    await assessmentModel.updateAssessment(
      id,
      title || assessment.title,
      description !== undefined ? description : assessment.description,
      type || assessment.type,
      difficulty || assessment.difficulty,
      total_marks || assessment.total_marks,
      time_limit_minutes !== undefined
        ? time_limit_minutes
        : assessment.time_limit_minutes,
      attempt_limit !== undefined ? attempt_limit : assessment.attempt_limit,
      status || assessment.status,
      req.body.company_id !== undefined
        ? req.body.company_id
        : assessment.company_id
    );

    res
      .status(200)
      .json({ success: true, message: "Assessment updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete an assessment
const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await assessmentModel.getAssessmentById(id);
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    await assessmentModel.deleteAssessment(id);
    res
      .status(200)
      .json({ success: true, message: "Assessment deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== Questions Management ====================

// Get all questions for an assessment
const getAssessmentQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const questions = await questionModel.getQuestionsByAssessmentId(
      assessmentId
    );
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await questionModel.getQuestionById(id);

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res.status(200).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add question to assessment
const addQuestion = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { question, question_type, options, correct_answer, marks } =
      req.body;

    if (!question || !question_type || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: "Question, question_type, and correct_answer are required",
      });
    }

    // Validate assessment exists
    const assessment = await assessmentModel.getAssessmentById(assessmentId);
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    const questionId = await questionModel.addQuestion(
      assessmentId,
      question,
      question_type,
      options || null,
      correct_answer,
      marks || 1,
      question_order
    );

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: { id: questionId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      question_type,
      options,
      correct_answer,
      marks,
      question_order,
    } = req.body;

    const existingQuestion = await questionModel.getQuestionById(id);
    if (!existingQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Validate question type if provided
    if (question_type && !isValidQuestionType(question_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question type. Must be MCQ, coding, or scenario",
      });
    }

    // Validate MCQ options if question type is MCQ
    if (
      (question_type === "MCQ" || existingQuestion.question_type === "MCQ") &&
      options !== undefined &&
      (!options || !Array.isArray(options) || options.length < 2)
    ) {
      return res.status(400).json({
        success: false,
        message: "MCQ questions must have at least 2 options",
      });
    }

    await questionModel.updateQuestion(
      id,
      question || existingQuestion.question,
      question_type || existingQuestion.question_type,
      options !== undefined ? options : existingQuestion.options,
      correct_answer || existingQuestion.correct_answer,
      marks || existingQuestion.marks,
      question_order !== undefined
        ? question_order
        : existingQuestion.question_order
    );

    res
      .status(200)
      .json({ success: true, message: "Question updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await questionModel.getQuestionById(id);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    await questionModel.deleteQuestion(id);
    res
      .status(200)
      .json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== Results Management ====================

// Get candidate results for an assessment
const getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const results = await resultModel.getResultsByAssessmentId(assessmentId);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get result by ID
const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await resultModel.getResultById(id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Result not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all results for a candidate
const getCandidateResults = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const results = await resultModel.getResultsByCandidateId(candidateId);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit assessment (calculate score and save)
const submitAssessment = async (req, res) => {
  try {
    const { candidateId, assessmentId, answers, timeTakenMinutes } = req.body;

    if (!candidateId || !assessmentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "candidateId, assessmentId, and answers array are required",
      });
    }

    // Get assessment details
    const assessment = await assessmentModel.getAssessmentById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Check if assessment is published
    if (assessment.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Assessment is not available for submission",
      });
    }

    // Check attempt limit
    const existingCompleted = await resultModel.checkExistingResult(
      candidateId,
      assessmentId
    );
    const attemptNumber = await resultModel.getAttemptNumber(
      candidateId,
      assessmentId
    );

    if (assessment.attempt_limit && attemptNumber > assessment.attempt_limit) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${assessment.attempt_limit}) reached for this assessment`,
      });
    }

    // Check if already submitted (prevent duplicate submission)
    if (existingCompleted && existingCompleted.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Assessment already submitted. Cannot submit again.",
        data: {
          resultId: existingCompleted.id,
          score: existingCompleted.score,
        },
      });
    }

    // Get all questions for the assessment
    const questions = await questionModel.getQuestionsByAssessmentId(
      assessmentId
    );
    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this assessment",
      });
    }

    // Calculate score and prepare answers for storage
    let totalScore = 0;
    let totalMarks = 0;
    const answersToStore = [];

    questions.forEach((q) => {
      totalMarks += q.marks;
      const answer = answers.find((a) => a.questionId === q.id);
      const isCorrect = answer && answer.answer === q.correct_answer;
      const marksObtained = isCorrect ? q.marks : 0;

      if (isCorrect) {
        totalScore += q.marks;
      }

      answersToStore.push({
        questionId: q.id,
        answer: answer ? answer.answer : null,
        isCorrect: isCorrect,
        marksObtained: marksObtained,
      });
    });

    // Calculate percentage
    const percentage =
      totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

    // Get or create result
    let resultId;
    const existingResult = await resultModel.getCandidateResult(
      candidateId,
      assessmentId
    );

    if (existingResult && existingResult.status === "pending") {
      resultId = existingResult.id;
      await resultModel.submitResult(resultId, percentage, timeTakenMinutes);
    } else {
      // Create new result
      resultId = await resultModel.createCandidateResult(
        candidateId,
        assessmentId
      );
      await resultModel.submitResult(resultId, percentage, timeTakenMinutes);
    }

    // Store individual answers
    await answerModel.saveCandidateAnswers(resultId, answersToStore);

    // ===================== FETCH EMAIL DATA =====================
    const [[candidate]] = await db.query(
      "SELECT name, email FROM candidates WHERE id = ?",
      [candidateId]
    );

    let company = null;
    if (assessment.company_id) {
      const [[companyRow]] = await db.query(
        "SELECT id, name, email FROM companies WHERE id = ?",
        [assessment.company_id]
      );
      company = companyRow || null;
    }

    // ===================== NOTIFICATIONS =====================

    // Candidate
    await notificationService.createNotification({
      user_id: candidateId,
      user_type: "candidate",
      title: "Assessment Submitted",
      message: `You completed the assessment "${assessment.title}". Your score is ${percentage}%.`,
      reference_module: "assessments",
      reference_id: assessmentId,
    });

    // Company
    if (company?.id) {
      await notificationService.createNotification({
        user_id: company.id,
        user_type: "company",
        title: "Assessment Submitted",
        message: `A candidate submitted "${assessment.title}" (Score: ${percentage}%).`,
        reference_module: "assessments",
        reference_id: assessmentId,
      });
    }

    // const [admins] = await db.query(
    //   `SELECT id FROM users WHERE role IN ('admin')`
    // );

    // for (const admin of admins) {
    //   if (!admin.id) continue;

    //   await notificationService.createNotification({
    //     user_id: admin.id,
    //     user_type: "admin",
    //     title: "Assessment Submitted",
    //     message: `Assessment "${assessment.title}" submitted. Score: ${percentage}%.`,
    //     reference_module: "assessments",
    //     reference_id: assessmentId,
    //   });
    // }


    // ===================== EMAILS =====================

    // Candidate email
    if (candidate?.email) {
      await emailService.sendEmail({
        to: candidate.email,
        subject: "Assessment Submission Confirmation",
        html: `
      <p>Dear ${candidate.name || "Candidate"},</p>

      <p>We are pleased to inform you that you have successfully completed the following assessment:</p>

      <p><strong>Assessment Title:</strong> ${assessment.title}</p>
      <p><strong>Score Achieved:</strong> ${percentage}%</p>

      <p>You may log in to your dashboard to review your detailed performance and results.</p>

      <p>
        Should you have any questions, please feel free to contact our support team.
      </p>

      <p>
        Best regards,<br/>
        <strong>Talent Management System</strong>
      </p>
    `,
      });
    }

    // Company email
    if (company?.email) {
      await emailService.sendEmail({
        to: company.email,
        subject: `Assessment Submission Notification – ${assessment.title}`,
        html: `
      <p>Dear ${company.name || "Hiring Team"},</p>

      <p>This is to notify you that a candidate has completed the following assessment:</p>

      <p><strong>Assessment Title:</strong> ${assessment.title}</p>
      <p><strong>Candidate Score:</strong> ${percentage}%</p>

      <p>
        Please log in to your company dashboard to review the candidate’s detailed assessment results
        and take further action as required.
      </p>

      <p>
        Regards,<br/>
        <strong>Talent Management System</strong>
      </p>
    `,
      });
    }

    // Admin email
    if (process.env.ADMIN_EMAIL) {
      await emailService.sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "Admin Notification: Assessment Submitted",
        html: `
      <p>An assessment has been successfully submitted.</p>

      <p>
        <strong>Assessment:</strong> ${assessment.title}<br/>
        <strong>Candidate ID:</strong> ${candidateId}<br/>
        <strong>Score:</strong> ${percentage}%
      </p>

      <p>
        Please review the submission from the admin panel for further processing.
      </p>

      <p>
        <strong>Talent Management System</strong>
      </p>
    `,
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: {
        resultId,
        score: percentage,
        totalMarks,
        obtainedMarks: totalScore,
        attemptNumber,
        timeTakenMinutes: timeTakenMinutes || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== Analytics ====================

// Get assessment statistics
const getAssessmentStats = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const stats = await resultModel.getAssessmentStats(assessmentId);

    // Get question count and total marks
    const questionCount = await questionModel.getQuestionCountByAssessmentId(
      assessmentId
    );
    const totalMarks = await questionModel.getTotalMarksByAssessmentId(
      assessmentId
    );

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        questionCount,
        totalMarks,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get performance distribution
const getPerformanceDistribution = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const distribution = await resultModel.getPerformanceDistribution(
      assessmentId
    );
    res.status(200).json({ success: true, data: distribution });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get recent submissions
const getRecentSubmissions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const submissions = await resultModel.getRecentSubmissions(limit);
    res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get answers for a result
const getAnswersByResultId = async (req, res) => {
  try {
    const { resultId } = req.params;
    const answers = await answerModel.getAnswersByResultId(resultId);
    res.status(200).json({ success: true, data: answers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//close assessment controllers

// ==================== Support / Ticketing Module ====================

// Create ticket (candidate/company)
const createTicket = async (req, res) => {
  try {
    const {
      user_type,
      candidate_id,
      company_id,
      subject,
      description,
      priority,
      attachment_url,
    } = req.body;

    if (!user_type || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "user_type, subject, and description are required",
      });
    }
    if (!["candidate", "company"].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: "user_type must be candidate or company",
      });
    }
    if (priority && !ticketModel.ALLOWED_PRIORITY.includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority value" });
    }

    const ticketId = await ticketModel.createTicket({
      user_type,
      candidate_id,
      company_id,
      subject,
      description,
      priority,
      attachment_url,
    });

    // Add history
    await ticketModel.addHistory(
      ticketId,
      "comment",
      null,
      null,
      null,
      "Ticket created"
    );

    res.status(201).json({
      success: true,
      message: "Ticket created",
      data: { id: ticketId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// List tickets with filters
const listTickets = async (req, res) => {
  try {
    const { status, priority, assigned_admin_id, user_type } = req.query;
    if (status && !ticketModel.ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status filter" });
    }
    if (priority && !ticketModel.ALLOWED_PRIORITY.includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority filter" });
    }

    const tickets = await ticketModel.listTickets({
      status,
      priority,
      assigned_admin_id,
      user_type,
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get ticket detail with messages
const getTicketDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ticketModel.getTicketById(id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    const messages = await ticketMessagesModel.getMessages(id);
    const history = await ticketModel.getHistory(id);

    res
      .status(200)
      .json({ success: true, data: { ticket, messages, history } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add message / respond to ticket
const addTicketMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { sender_type, sender_id, message, attachment_url } = req.body;

    if (!sender_type || !message) {
      return res.status(400).json({
        success: false,
        message: "sender_type and message are required",
      });
    }
    if (!["candidate", "company", "admin"].includes(sender_type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sender_type" });
    }

    const ticket = await ticketModel.getTicketById(ticketId);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    const msgId = await ticketMessagesModel.addMessage(
      ticketId,
      sender_type,
      sender_id,
      message,
      attachment_url
    );
    await ticketModel.addHistory(
      ticketId,
      "comment",
      null,
      null,
      sender_type === "admin" ? sender_id : null,
      "Message added"
    );

    res
      .status(201)
      .json({ success: true, message: "Message added", data: { id: msgId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Assign ticket to support admin
const assignTicketToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;
    const ticket = await ticketModel.getTicketById(id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    await ticketModel.assignTicket(id, admin_id || null);
    await ticketModel.addHistory(
      id,
      "assignment",
      null,
      null,
      admin_id || null,
      "Ticket assigned"
    );

    res
      .status(200)
      .json({ success: true, message: "Ticket assigned successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_id, note } = req.body;

    if (!status || !ticketModel.ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const ticket = await ticketModel.getTicketById(id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    await ticketModel.updateStatus(id, status);
    await ticketModel.addHistory(
      id,
      "status_change",
      ticket.status,
      status,
      admin_id || null,
      note || null
    );

    res.status(200).json({ success: true, message: "Ticket status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get ticket history
const getTicketHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await ticketModel.getHistory(id);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== Portal Settings Module ====================
/**
 * Portal Settings Module Controllers
 * This module handles all portal-level settings including:
 * - Platform configuration (logo, colors, name)
 * - SMTP email settings
 * - SMS API settings
 * - Payment gateway configuration
 * - Database backup controls
 */

// Platform Configuration Controllers
/**
 * Get platform configuration
 * Returns platform-level settings like logo, colors, contact info
 */
const getPlatformConfig = async (req, res) => {
  try {
    const config = await platformConfigModel.getPlatformConfig();
    res.status(200).json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update platform configuration
 * Updates platform name, logo, colors, contact information
 */
const updatePlatformConfig = async (req, res) => {
  try {
    await platformConfigModel.updatePlatformConfig(req.body);
    res.status(200).json({
      success: true,
      message: "Platform configuration updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SMTP Settings Controllers
/**
 * Get SMTP email server settings
 * Returns current SMTP configuration for sending emails
 * Passwords are masked for security
 */
const getSMTPSettings = async (req, res) => {
  try {
    const settings = await smtpSettingsModel.getSMTPSettings();

    // Mask sensitive data
    if (settings) {
      settings.smtp_password = maskSensitiveData(settings.smtp_password);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update SMTP email server settings
 * Updates SMTP host, port, credentials, and activation status
 * Passwords are encrypted before storage
 */
const updateSMTPSettings = async (req, res) => {
  try {
    const { smtp_user, smtp_password, from_email, smtp_port } = req.body;

    // Validate email formats
    if (smtp_user && !isValidEmail(smtp_user)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SMTP user email format",
      });
    }

    if (from_email && !isValidEmail(from_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid from email format",
      });
    }

    // Validate port range
    if (smtp_port && !isValidPort(smtp_port)) {
      return res.status(400).json({
        success: false,
        message: "Invalid port number. Must be between 1 and 65535",
      });
    }

    // Encrypt password if provided
    const settingsData = { ...req.body };
    if (smtp_password) {
      settingsData.smtp_password = encrypt(smtp_password);
    }

    await smtpSettingsModel.updateSMTPSettings(settingsData);
    res
      .status(200)
      .json({ success: true, message: "SMTP settings updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Test SMTP connection
 * Tests the SMTP settings to verify email server connectivity
 */
const testSMTPConnection = async (req, res) => {
  try {
    const result = await smtpSettingsModel.testSMTPConnection();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SMS Settings Controllers
/**
 * Get SMS API settings
 * Returns current SMS provider configuration
 * API secrets are masked for security
 */
const getSMSSettings = async (req, res) => {
  try {
    const settings = await smsSettingsModel.getSMSSettings();

    // Mask sensitive data
    if (settings) {
      settings.api_secret = maskSensitiveData(settings.api_secret);
      settings.api_key = maskSensitiveData(settings.api_key);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update SMS API settings
 * Updates SMS provider, API keys, sender ID, and activation status
 * API secrets are encrypted before storage
 */
const updateSMSSettings = async (req, res) => {
  try {
    const { endpoint_url, api_secret } = req.body;

    // Validate URL if provided
    if (endpoint_url && !isValidURL(endpoint_url)) {
      return res.status(400).json({
        success: false,
        message: "Invalid endpoint URL format",
      });
    }

    // Encrypt API secret if provided
    const settingsData = { ...req.body };
    if (api_secret) {
      settingsData.api_secret = encrypt(api_secret);
    }

    await smsSettingsModel.updateSMSSettings(settingsData);
    res
      .status(200)
      .json({ success: true, message: "SMS settings updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Test SMS API connection
 * Tests the SMS settings to verify API connectivity
 */
const testSMSConnection = async (req, res) => {
  try {
    const result = await smsSettingsModel.testSMSConnection();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Payment Gateway Settings Controllers
/**
 * Get payment gateway settings
 * Returns current payment gateway configuration (Stripe, PayPal, etc.)
 * API secrets are masked for security
 */
const getPaymentGatewaySettings = async (req, res) => {
  try {
    const settings = await paymentGatewayModel.getPaymentGatewaySettings();

    // Mask sensitive data
    if (settings) {
      settings.api_secret = maskSensitiveData(settings.api_secret);
      settings.webhook_secret = maskSensitiveData(settings.webhook_secret);
      settings.api_key = maskSensitiveData(settings.api_key);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update payment gateway settings
 * Updates payment provider, merchant ID, API keys, and test/live mode
 * API secrets are encrypted before storage
 */
const updatePaymentGatewaySettings = async (req, res) => {
  try {
    const { api_secret, webhook_secret } = req.body;

    // Encrypt secrets if provided
    const settingsData = { ...req.body };
    if (api_secret) {
      settingsData.api_secret = encrypt(api_secret);
    }
    if (webhook_secret) {
      settingsData.webhook_secret = encrypt(webhook_secret);
    }

    await paymentGatewayModel.updatePaymentGatewaySettings(settingsData);
    res.status(200).json({
      success: true,
      message: "Payment gateway settings updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Database Backup Controllers
/**
 * Get database backup settings
 * Returns backup frequency, retention, and notification settings
 */
const getBackupSettings = async (req, res) => {
  try {
    const settings = await databaseBackupModel.getBackupSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update database backup settings
 * Updates backup frequency, retention days, auto-backup, and notification settings
 */
const updateBackupSettings = async (req, res) => {
  try {
    await databaseBackupModel.updateBackupSettings(req.body);
    res
      .status(200)
      .json({ success: true, message: "Backup settings updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get backup history
 * Returns list of recent database backups with status and details
 * Query param: limit (default: 10) - Number of records to return
 */
const getBackupHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await databaseBackupModel.getBackupHistory(limit);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Create backup record
 * Creates a new entry in backup history when a backup is performed
 */
const createBackupRecord = async (req, res) => {
  try {
    const backupId = await databaseBackupModel.createBackupRecord(req.body);
    res.status(201).json({
      success: true,
      message: "Backup record created",
      data: { id: backupId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  // Assessment Controllers
  createAssessment,
  getAssessments,
  getAssessmentById,
  getAssessmentWithQuestions,
  updateAssessment,
  deleteAssessment,
  // Question Controllers
  getAssessmentQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  // Result Controllers
  getAssessmentResults,
  getResultById,
  getCandidateResults,
  submitAssessment,
  // Analytics Controllers
  getAssessmentStats,
  getPerformanceDistribution,
  getRecentSubmissions,
  // Answer Controllers
  getAnswersByResultId,

  // ==================== Portal Settings Module ====================
  // Platform Configuration
  getPlatformConfig,
  updatePlatformConfig,
  // SMTP Settings
  getSMTPSettings,
  updateSMTPSettings,
  testSMTPConnection,
  // SMS Settings
  getSMSSettings,
  updateSMSSettings,
  testSMSConnection,
  // Payment Gateway Settings
  getPaymentGatewaySettings,
  updatePaymentGatewaySettings,
  // Database Backup Settings
  getBackupSettings,
  updateBackupSettings,
  getBackupHistory,
  createBackupRecord,

  // ==================== Support / Ticketing Module ====================
  createTicket,
  listTickets,
  getTicketDetail,
  addTicketMessage,
  assignTicketToAdmin,
  updateTicketStatus,
  getTicketHistory,
};
