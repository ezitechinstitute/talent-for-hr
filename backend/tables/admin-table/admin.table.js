import db from "../../config/db.js";

// Admin Dashboard Table
async function getAdminDashboardTable() {
  await db.query(`
   CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      city VARCHAR(100),
      country VARCHAR(100),
      verified BOOLEAN DEFAULT FALSE,
      verified_experience BOOLEAN DEFAULT FALSE,
      verified_skills BOOLEAN DEFAULT FALSE,
      status ENUM('Active', 'Inactive', 'Pending Verification') DEFAULT 'Pending Verification',
      total_experience_months INT DEFAULT 0,
      internship_count INT DEFAULT 0,
      skills TEXT,
      profile_completion INT DEFAULT 0,
      last_login TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    `);

  await db.query(`
  CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);


  await db.query(`
    CREATE TABLE IF NOT EXISTS internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company_id INT,
    actor_id INT NULL,
    actor_role ENUM('admin','hr') NULL,
    duration_months INT DEFAULT 3,
    stipend_min INT NULL,
    stipend_max INT NULL,
    stipend VARCHAR(100) DEFAULT NULL,
    location VARCHAR(255),
    status ENUM('draft','pending','live','closed','rejected') DEFAULT 'draft',
    active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    updated_by INT NULL,
    published_at TIMESTAMP NULL,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_intern_company (company_id),
    INDEX idx_intern_status (status),
    FULLTEXT KEY ft_intern_title_desc (title, description)
    );
    `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS internship_applicants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id INT NOT NULL,
    candidate_id INT NOT NULL,
    resume_url VARCHAR(1000) DEFAULT NULL,
    cover_letter TEXT DEFAULT NULL,
    status ENUM('applied','shortlisted','rejected','hired') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_updated_by INT NULL,
    application_source ENUM('web','email','external') DEFAULT 'web',
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY ux_intern_candidate (internship_id, candidate_id),
    INDEX idx_intern_app_internship (internship_id),
    INDEX idx_intern_app_candidate (candidate_id)
   );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_role ENUM('super admin','verification admin','hr admin'),
    action_type VARCHAR(50),
    api_endpoint VARCHAR(255),
    module VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
     `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS system_health (
     id INT AUTO_INCREMENT PRIMARY KEY,
     type VARCHAR(255),
     message TEXT,
     path VARCHAR(255),
     method VARCHAR(10),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
    `);

  await db.query(`
        CREATE TABLE IF NOT EXISTS candidate_skills(
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT,
        skill_name VARCHAR(255),
        FOREIGN KEY (candidate_id) REFERENCES candidates(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company_id INT,
    actor_id INT NULL,
    actor_role ENUM('admin','hr') NULL,
    job_type ENUM('full-time','part-time','contract','remote') DEFAULT 'full-time',
    location VARCHAR(255),
    min_salary INT NULL,
    max_salary INT NULL,
    salary_range VARCHAR(100),
    requirements JSON NULL,
    responsibilities TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft','pending','live','closed','rejected') DEFAULT 'draft',
    active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    updated_by INT NULL,
    published_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_jobs_company (company_id),
    INDEX idx_jobs_status (status),
    INDEX idx_jobs_created (created_at),
    INDEX idx_jobs_type_status (job_type, status),
    FULLTEXT KEY ft_jobs_title_desc (title, description)
  );
`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS job_applicants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    resume_url VARCHAR(1000) DEFAULT NULL,
    cover_letter TEXT DEFAULT NULL,
    status ENUM('applied','shortlisted','rejected','hired') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_updated_by INT NULL,
    application_source ENUM('web','email','external') DEFAULT 'web',
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY ux_job_candidate (job_id, candidate_id),
    INDEX idx_job_app_job_status (job_id, status),
    INDEX idx_job_app_candidate (candidate_id)
  );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`);

  await db.query(
    `CREATE TABLE IF NOT EXISTS module(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await db.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    module_id INT NOT NULL,
    
    can_create TINYINT(1) DEFAULT 0,
    can_read   TINYINT(1) DEFAULT 1,
    can_update TINYINT(1) DEFAULT 0,
    can_delete TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_role_module (role_id, module_id),
    FOREIGN KEY (role_id) REFERENCES admin_roles(id)
        ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES module(id)  
       ON DELETE CASCADE  
);
 `);
}

// Verification Management Table
async function verificationManagementTable() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS experience_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT,
    company_id INT,
    position VARCHAR(255),
    start_date DATE,
    end_date DATE,
    document_url VARCHAR(500),
    status ENUM('pending', 'accepted', 'rejected', 'more_info_required') DEFAULT 'pending',
    admin_remarks TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);`);

    await db.query(`CREATE TABLE IF NOT EXISTS skill_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT,
    skill_name VARCHAR(255),
    certification_url VARCHAR(500) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'needs_correction') DEFAULT 'pending',
    admin_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
`);

    console.log("Experience Verification table created!");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

// candidate-Assessments Table

async function createAssessmentTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('MCQ','coding','scenario') DEFAULT 'MCQ',
        difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
        total_marks INT DEFAULT 100,
        company_id INT NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        time_limit_minutes INT DEFAULT NULL,
        attempt_limit INT DEFAULT 1,
        status ENUM('draft','published','closed') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Questions Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS assessment_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT,
        question TEXT NOT NULL,
        question_type ENUM('MCQ','coding','scenario') DEFAULT 'MCQ',
        options JSON DEFAULT NULL,
        correct_answer TEXT DEFAULT NULL,
        marks INT DEFAULT 1,
        question_order INT DEFAULT 0,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
      );
    `);

    // Candidate Results Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS candidate_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT,
        assessment_id INT,
        score INT DEFAULT 0,
        status ENUM('pending','completed') DEFAULT 'pending',
        started_at DATETIME DEFAULT NULL,
        submitted_at DATETIME DEFAULT NULL,
        time_taken_minutes INT DEFAULT NULL,
        attempt_number INT DEFAULT 1,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id),
        FOREIGN KEY (assessment_id) REFERENCES assessments(id),
        UNIQUE KEY unique_attempt (candidate_id, assessment_id, attempt_number)
      );
    `);

    // Candidate Answers Table - Store individual answers
    await db.query(`
      CREATE TABLE IF NOT EXISTS candidate_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        result_id INT NOT NULL,
        question_id INT NOT NULL,
        answer TEXT DEFAULT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        marks_obtained INT DEFAULT 0,
        FOREIGN KEY (result_id) REFERENCES candidate_results(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
      );
    `);

    console.log("Candidate Assessment tables created successfully!");
  } catch (err) {
    console.error("Error creating assessment tables:", err);
  }
}

// Matching Algorithm Controll Tables
async function matchingAlgorithmControlTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS match_settings(
      id INT PRIMARY KEY AUTO_INCREMENT,
      skills_weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
      experience_weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
      certification_weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
      assessment_weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
      internship_priority DECIMAL(5,2) NOT NULL DEFAULT 1.00,
      auto_matching_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS match_queue (
      id INT PRIMARY KEY AUTO_INCREMENT,
      job_id INT NOT NULL,
      trigger_source ENUM('manual','auto') DEFAULT 'manual',
      status ENUM('queued','processing','done','failed') DEFAULT 'queued',
      error_text TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );`);
  } catch (err) {
    console.error("Error creating Matching Algorithm Control tables:", err);
  }
}

// CMS (Control Management System) Tables
export async function createCMSTables() {
  // Home Page Banners
  await db.query(`
       CREATE TABLE IF NOT EXISTS home_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`);
  // About Page
  await db.query(`
        CREATE TABLE IF NOT EXISTS about_page (
            id INT PRIMARY KEY DEFAULT 1,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);

  // FAQ
  await db.query(`
        CREATE TABLE IF NOT EXISTS faqs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);

  // Privacy Policy
  await db.query(`
        CREATE TABLE IF NOT EXISTS privacy_policy (
            id INT PRIMARY KEY DEFAULT 1,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);

  // Terms & Conditions
  await db.query(`
        CREATE TABLE IF NOT EXISTS terms_conditions (
            id INT PRIMARY KEY DEFAULT 1,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);

  // Blog Posts (optional)
  await db.query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);

  console.log("CMS tables created successfully!");
}

/**
 * Portal Settings Tables
 * Creates all tables required for Portal Settings Module:
 * - platform_config: Platform branding and configuration
 * - smtp_settings: Email server configuration
 * - sms_settings: SMS API configuration
 * - payment_gateway_settings: Payment provider configuration
 * - database_backup_settings: Backup configuration
 * - database_backup_history: Backup execution history
 */
async function createPortalSettingsTables() {
  try {
    // Platform Configuration Table - Stores platform branding, colors, contact info
    await db.query(`
      CREATE TABLE IF NOT EXISTS platform_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform_name VARCHAR(255) DEFAULT 'Talent for HR',
        platform_logo VARCHAR(500) DEFAULT NULL,
        primary_color VARCHAR(7) DEFAULT '#3B82F6',
        secondary_color VARCHAR(7) DEFAULT '#10B981',
        accent_color VARCHAR(7) DEFAULT '#F59E0B',
        footer_text TEXT DEFAULT NULL,
        contact_email VARCHAR(255) DEFAULT NULL,
        contact_phone VARCHAR(20) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // SMTP Settings Table - Stores email server configuration for sending emails
    await db.query(`
      CREATE TABLE IF NOT EXISTS smtp_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        smtp_host VARCHAR(255) NOT NULL,
        smtp_port INT DEFAULT 587,
        smtp_secure BOOLEAN DEFAULT TRUE,
        smtp_user VARCHAR(255) NOT NULL,
        smtp_password VARCHAR(500) NOT NULL,
        from_email VARCHAR(255) NOT NULL,
        from_name VARCHAR(255) DEFAULT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // SMS API Settings Table - Stores SMS provider configuration for sending SMS
    await db.query(`
      CREATE TABLE IF NOT EXISTS sms_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(100) DEFAULT NULL,
        api_key VARCHAR(255) DEFAULT NULL,
        api_secret VARCHAR(500) DEFAULT NULL,
        sender_id VARCHAR(50) DEFAULT NULL,
        endpoint_url VARCHAR(500) DEFAULT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Payment Gateway Settings Table - Stores payment provider configuration (Stripe, PayPal, etc.)
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_gateway_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gateway_provider VARCHAR(100) DEFAULT NULL,
        merchant_id VARCHAR(255) DEFAULT NULL,
        api_key VARCHAR(255) DEFAULT NULL,
        api_secret VARCHAR(500) DEFAULT NULL,
        webhook_secret VARCHAR(500) DEFAULT NULL,
        is_test_mode BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Database Backup Settings Table - Stores backup configuration (frequency, retention, etc.)
    await db.query(`
      CREATE TABLE IF NOT EXISTS database_backup_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        backup_frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
        backup_retention_days INT DEFAULT 30,
        auto_backup_enabled BOOLEAN DEFAULT FALSE,
        backup_location VARCHAR(500) DEFAULT NULL,
        email_notifications BOOLEAN DEFAULT FALSE,
        notification_email VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Database Backup History Table - Stores records of all backup operations
    await db.query(`
      CREATE TABLE IF NOT EXISTS database_backup_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        backup_file_path VARCHAR(500) NOT NULL,
        backup_size BIGINT DEFAULT 0,
        backup_status ENUM('completed', 'failed', 'in_progress') DEFAULT 'completed',
        backup_type ENUM('manual', 'automatic') DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Portal Settings tables created successfully!");
  } catch (err) {
    console.error("Error creating portal settings tables:", err);
  }
}

/**
 * Support / Ticketing Module Tables
 * - tickets: main ticket info
 * - ticket_messages: conversation messages with attachments
 * - ticket_history: audit trail for status/assignment changes
 */
async function createSupportTicketTables() {
  try {
    // Tickets table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_type ENUM('candidate','company') NOT NULL,
        candidate_id INT NULL,
        company_id INT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low','medium','high') DEFAULT 'medium',
        status ENUM('open','pending','resolved','closed') DEFAULT 'open',
        assigned_admin_id INT NULL,
        attachment_url VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      );
    `);

    // Ticket messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_type ENUM('candidate','company','admin') NOT NULL,
        sender_id INT NULL,
        message TEXT NOT NULL,
        attachment_url VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      );
    `);

    // Ticket history / audit log
    await db.query(`
      CREATE TABLE IF NOT EXISTS ticket_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        action ENUM('status_change','assignment','comment') NOT NULL,
        from_status ENUM('open','pending','resolved','closed') DEFAULT NULL,
        to_status ENUM('open','pending','resolved','closed') DEFAULT NULL,
        changed_by_admin_id INT NULL,
        note TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      );
    `);

    console.log("Support/Ticketing tables created successfully!");
  } catch (err) {
    console.error("Error creating support/ticketing tables:", err);
  }
}
// Notification module Table

async function notificationsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        user_type ENUM('candidate','company','admin') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('email','push','system') DEFAULT 'system',
        is_read BOOLEAN DEFAULT FALSE,
        reference_module VARCHAR(100), 
        reference_id INT NULL,         
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error("Error creating Notification tables:", err);
  }
}

export default {
  getAdminDashboardTable,
  createAssessmentTables,
  verificationManagementTable,
  matchingAlgorithmControlTables,
  createCMSTables,
  createPortalSettingsTables,
  createSupportTicketTables,
  notificationsTable,
};
