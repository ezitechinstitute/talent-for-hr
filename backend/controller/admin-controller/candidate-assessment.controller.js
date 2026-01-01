const db = require("../../config/db.js");

// These models are being imported from admin-model/candidate-assessment
const assessmentModel = require("../../models/admin-model/candidate-assessment/model.assessments.js");
const questionModel = require("../../models/admin-model/candidate-assessment/model.questions.js");
const resultModel = require("../../models/admin-model/candidate-assessment/model.results.js");
const answerModel = require("../../models/admin-model/candidate-assessment/model.answers.js");

// Utilities
const {
  isValidAssessmentStatus,
  isValidQuestionType,
} = require("../../utils/validations.js");

// These are the models for notification management
const emailService = require("../../services/email.service.js");
const notificationService = require("../../models/admin-model/notification-management/model.notification.js");

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
    const { question, question_type, options, correct_answer, marks, question_order } =
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
      question_order || null
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

    // Admin
    await notificationService.createNotification({
      user_id: null,
      user_type: "admin",
      title: "Assessment Submission",
      message: `Assessment "${assessment.title}" submitted. Score: ${percentage}%.`,
      reference_module: "assessments",
      reference_id: assessmentId,
    });

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
        Please log in to your company dashboard to review the candidate's detailed assessment results
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

module.exports = {
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
};

