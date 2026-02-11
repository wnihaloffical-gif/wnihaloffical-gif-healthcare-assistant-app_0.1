/*
  Warnings:

  - You are about to drop the column `finalMedicines` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `hasRedFlags` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `patientSummaryText` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `redFlagWarnings` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `symptoms` on the `consultations` table. All the data in the column will be lost.
  - You are about to alter the column `riskLevel` on the `consultations` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.
  - You are about to drop the `ddi_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `probable_conditions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suggested_medicines` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ddiAlerts` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicines` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `probableConditions` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structuredSymptoms` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summaryText` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transcript` to the `consultations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ddi_alerts` DROP FOREIGN KEY `ddi_alerts_consultationId_fkey`;

-- DropForeignKey
ALTER TABLE `probable_conditions` DROP FOREIGN KEY `probable_conditions_consultationId_fkey`;

-- DropForeignKey
ALTER TABLE `suggested_medicines` DROP FOREIGN KEY `suggested_medicines_consultationId_fkey`;

-- AlterTable
ALTER TABLE `consultations` DROP COLUMN `finalMedicines`,
    DROP COLUMN `hasRedFlags`,
    DROP COLUMN `patientSummaryText`,
    DROP COLUMN `redFlagWarnings`,
    DROP COLUMN `symptoms`,
    ADD COLUMN `blockchainHash` VARCHAR(191) NULL,
    ADD COLUMN `ddiAlerts` JSON NOT NULL,
    ADD COLUMN `finalizedByDoctor` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `medicines` JSON NOT NULL,
    ADD COLUMN `probableConditions` JSON NOT NULL,
    ADD COLUMN `structuredSymptoms` JSON NOT NULL,
    ADD COLUMN `summaryText` LONGTEXT NOT NULL,
    ADD COLUMN `transcript` LONGTEXT NOT NULL,
    MODIFY `riskLevel` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `ddi_alerts`;

-- DropTable
DROP TABLE `probable_conditions`;

-- DropTable
DROP TABLE `suggested_medicines`;

-- CreateTable
CREATE TABLE `drug_interactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `drugA` VARCHAR(191) NOT NULL,
    `drugB` VARCHAR(191) NOT NULL,
    `severity` ENUM('MILD', 'MODERATE', 'SEVERE') NOT NULL,
    `description` LONGTEXT NOT NULL,

    UNIQUE INDEX `drug_interactions_drugA_drugB_key`(`drugA`, `drugB`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
