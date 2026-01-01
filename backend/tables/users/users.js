import db from '../../config/db.js'

const createUserTable = async () =>{
        await db.query(` CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE, 
    isApproved BOOLEAN DEFAULT FALSE,
    role ENUM('admin','hr','candidate','company') DEFAULT 'candidate',
    admin_role_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_role_id) REFERENCES admin_roles(id)
);`)
      console.log("Users table created!");
}

const verificationTokens = async () =>{
    await db.query(` CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) DEFAULT NULL,
    token VARCHAR(255), 
    expiryVerify DATETIME NULL,
    verificationCode VARCHAR(6),
    refreshToken VARCHAR(255),
    resetToken VARCHAR(255),
    resetTokenExpiry DATETIME NULL,
    verificationCodeExpiry DATETIME NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tokens_user_email
      FOREIGN KEY (email) REFERENCES users(email)
      ON DELETE CASCADE
);
`)
console.log('tokens table created')
}

export default {createUserTable,
    verificationTokens
}