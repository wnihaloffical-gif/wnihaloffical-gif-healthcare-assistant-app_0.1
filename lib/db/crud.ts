import { getDatabase } from "./mongodb"
import { logger } from "./logger"
import type { User, Consultation, BlockchainRecord, MLInferenceLog, AuditLog } from "./schemas"

class DatabaseService {
  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const db = await getDatabase()
      const user = await db.collection<User>("users").findOne({ email })
      return user
    } catch (error) {
      logger.error("Failed to get user by email", { email }, "DATABASE")
      throw error
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const db = await getDatabase()
      const user = await db.collection<User>("users").findOne({ _id: userId })
      return user
    } catch (error) {
      logger.error("Failed to get user by ID", { userId }, "DATABASE")
      throw error
    }
  }

  async createUser(user: User): Promise<string> {
    try {
      const db = await getDatabase()
      const result = await db.collection<User>("users").insertOne({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      logger.info("User created", { userId: result.insertedId, email: user.email }, "DATABASE")
      return result.insertedId.toString()
    } catch (error) {
      logger.error("Failed to create user", { email: user.email }, "DATABASE")
      throw error
    }
  }

  // Consultation operations
  async createConsultation(consultation: Consultation): Promise<string> {
    try {
      const db = await getDatabase()
      const result = await db.collection<Consultation>("consultations").insertOne({
        ...consultation,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      logger.info(
        "Consultation created",
        { consultationId: result.insertedId, patientId: consultation.patientId },
        "DATABASE",
      )
      return result.insertedId.toString()
    } catch (error) {
      logger.error("Failed to create consultation", { patientId: consultation.patientId }, "DATABASE")
      throw error
    }
  }

  async getConsultationById(consultationId: string): Promise<Consultation | null> {
    try {
      const db = await getDatabase()
      const consultation = await db.collection<Consultation>("consultations").findOne({
        _id: consultationId,
      })
      return consultation
    } catch (error) {
      logger.error("Failed to get consultation", { consultationId }, "DATABASE")
      throw error
    }
  }

  async getPatientConsultations(patientId: string): Promise<Consultation[]> {
    try {
      const db = await getDatabase()
      const consultations = await db
        .collection<Consultation>("consultations")
        .find({ patientId })
        .sort({ createdAt: -1 })
        .toArray()
      return consultations
    } catch (error) {
      logger.error("Failed to get patient consultations", { patientId }, "DATABASE")
      throw error
    }
  }

  async updateConsultation(consultationId: string, updates: Partial<Consultation>): Promise<void> {
    try {
      const db = await getDatabase()
      await db
        .collection<Consultation>("consultations")
        .updateOne({ _id: consultationId }, { $set: { ...updates, updatedAt: new Date() } })
      logger.info("Consultation updated", { consultationId }, "DATABASE")
    } catch (error) {
      logger.error("Failed to update consultation", { consultationId }, "DATABASE")
      throw error
    }
  }

  // Blockchain record operations
  async storeBlockchainRecord(record: BlockchainRecord): Promise<string> {
    try {
      const db = await getDatabase()
      const result = await db.collection<BlockchainRecord>("blockchain_records").insertOne({
        ...record,
        timestamp: new Date(),
      })
      logger.info(
        "Blockchain record stored",
        {
          recordId: result.insertedId,
          consultationId: record.consultationId,
        },
        "DATABASE",
      )
      return result.insertedId.toString()
    } catch (error) {
      logger.error("Failed to store blockchain record", { consultationId: record.consultationId }, "DATABASE")
      throw error
    }
  }

  async getBlockchainRecord(consultationId: string): Promise<BlockchainRecord | null> {
    try {
      const db = await getDatabase()
      const record = await db.collection<BlockchainRecord>("blockchain_records").findOne({ consultationId })
      return record
    } catch (error) {
      logger.error("Failed to get blockchain record", { consultationId }, "DATABASE")
      throw error
    }
  }

  async getPatientBlockchainHistory(patientId: string): Promise<BlockchainRecord[]> {
    try {
      const db = await getDatabase()
      const records = await db
        .collection<BlockchainRecord>("blockchain_records")
        .find({ patientId })
        .sort({ timestamp: -1 })
        .toArray()
      return records
    } catch (error) {
      logger.error("Failed to get blockchain history", { patientId }, "DATABASE")
      throw error
    }
  }

  // ML Inference logging
  async logMLInference(log: MLInferenceLog): Promise<void> {
    try {
      const db = await getDatabase()
      await db.collection<MLInferenceLog>("ml_inference_logs").insertOne({
        ...log,
        timestamp: new Date(),
      })
      logger.debug("ML inference logged", { consultationId: log.consultationId }, "DATABASE")
    } catch (error) {
      logger.error("Failed to log ML inference", { consultationId: log.consultationId }, "DATABASE")
      // Don't throw - logging failures shouldn't break the application
    }
  }

  // Audit logging
  async logAuditEvent(event: AuditLog): Promise<void> {
    try {
      const db = await getDatabase()
      await db.collection<AuditLog>("audit_logs").insertOne({
        ...event,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error("Failed to log audit event", { module: event.module }, "DATABASE")
      // Don't throw - logging failures shouldn't break the application
    }
  }
}

export const db = new DatabaseService()
