-- CreateTable: thời khoá biểu học viên (mỗi bản ghi là 1 ca học cụ thể
-- của 1 học viên trong 1 khoá học, tại 1 mốc ngày giờ).
CREATE TABLE `StudentSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `studentEmail` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `duration` DOUBLE NOT NULL DEFAULT 1.5,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentSchedule_courseId_idx`(`courseId`),
    INDEX `StudentSchedule_startTime_idx`(`startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentSchedule` ADD CONSTRAINT `StudentSchedule_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
