-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL,
  specialization VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId INT NOT NULL,
  doctorId INT,
  riskLevel VARCHAR(255),
  language VARCHAR(255) DEFAULT 'English',
  status ENUM('PENDING', 'REVIEWED', 'COMPLETED') DEFAULT 'PENDING',
  doctorNotes LONGTEXT,
  finalDiagnosis LONGTEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  blockchainHash VARCHAR(255),
  finalizedByDoctor BOOLEAN DEFAULT FALSE,
  medicines JSON,
  probableConditions JSON,
  structuredSymptoms JSON,
  summaryText LONGTEXT,
  transcript LONGTEXT,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_patient_created (patientId, createdAt),
  INDEX idx_doctor_status (doctorId, status)
);

-- Create drug_interactions table
CREATE TABLE IF NOT EXISTS drug_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drugA VARCHAR(255),
  drugB VARCHAR(255),
  severity ENUM('MILD', 'MODERATE', 'SEVERE'),
  description LONGTEXT,
  UNIQUE KEY unique_drug_pair (drugA, drugB)
);

-- Create blockchain_records table
CREATE TABLE IF NOT EXISTS blockchain_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultationId INT UNIQUE NOT NULL,
  patientId INT NOT NULL,
  dataHash VARCHAR(255) UNIQUE NOT NULL,
  txId VARCHAR(255) UNIQUE NOT NULL,
  blockNumber INT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (consultationId) REFERENCES consultations(id) ON DELETE CASCADE,
  INDEX idx_patient_id (patientId)
);

-- Create ml_inference_logs table
CREATE TABLE IF NOT EXISTS ml_inference_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultationId INT UNIQUE NOT NULL,
  patientId INT NOT NULL,
  inputText LONGTEXT NOT NULL,
  language VARCHAR(255),
  modelVersion VARCHAR(255),
  predictions JSON,
  processingTime INT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consultationId) REFERENCES consultations(id) ON DELETE CASCADE,
  INDEX idx_patient_id (patientId)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module VARCHAR(255),
  action VARCHAR(255),
  userId INT,
  resourceId INT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  details JSON,
  consultationId INT,
  FOREIGN KEY (consultationId) REFERENCES consultations(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (userId),
  INDEX idx_module (module),
  INDEX audit_logs_consultationId_fkey (consultationId)
);
