-- CreateTable: "lịch lặp hàng tuần" (rule sinh ra nhiều buổi StudentSchedule
-- lặp lại 1 khung giờ mỗi tuần, không giới hạn số tuần khi endDate = NULL).
CREATE TABLE `RecurringSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `studentEmail` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `duration` DOUBLE NOT NULL DEFAULT 1.5,
    `note` TEXT NULL,
    `endDate` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `generatedUntil` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RecurringSchedule_courseId_idx`(`courseId`),
    INDEX `RecurringSchedule_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecurringSchedule` ADD CONSTRAINT `RecurringSchedule_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: thêm liên kết tới lịch lặp + mốc đã gửi mail nhắc cho StudentSchedule
ALTER TABLE `StudentSchedule`
    ADD COLUMN `recurringId` VARCHAR(191) NULL,
    ADD COLUMN `reminderSentAt` DATETIME(3) NULL;

CREATE INDEX `StudentSchedule_recurringId_idx` ON `StudentSchedule`(`recurringId`);

CREATE UNIQUE INDEX `StudentSchedule_recurringId_startTime_key` ON `StudentSchedule`(`recurringId`, `startTime`);

-- AddForeignKey
ALTER TABLE `StudentSchedule` ADD CONSTRAINT `StudentSchedule_recurringId_fkey` FOREIGN KEY (`recurringId`) REFERENCES `RecurringSchedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
