-- AlterTable: thêm 2 loại thông báo mới cho chức năng nộp bài / chữa bài
ALTER TABLE `Notification` MODIFY `type` ENUM('PAYMENT_SUBMITTED', 'ENROLLMENT_CONFIRMED', 'PAYMENT_REJECTED', 'SUBMISSION_RECEIVED', 'SUBMISSION_GRADED') NOT NULL;

-- CreateTable
CREATE TABLE `Submission` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `materialId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `files` JSON NOT NULL,
    `note` TEXT NULL,
    `status` ENUM('SUBMITTED', 'GRADED') NOT NULL DEFAULT 'SUBMITTED',
    `gradedFiles` JSON NULL,
    `gradedNote` TEXT NULL,
    `gradedById` VARCHAR(191) NULL,
    `gradedAt` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Submission_courseId_idx`(`courseId`),
    INDEX `Submission_materialId_idx`(`materialId`),
    INDEX `Submission_userId_idx`(`userId`),
    INDEX `Submission_gradedById_idx`(`gradedById`),
    UNIQUE INDEX `Submission_userId_materialId_key`(`userId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `CourseMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_gradedById_fkey` FOREIGN KEY (`gradedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
