-- CreateTable: đếm giờ nộp bài (48 tiếng kể từ khi học viên tải/xem tài
-- liệu bài tập lần đầu), dùng để khoá tính năng nộp bài khi quá hạn.
CREATE TABLE `SubmissionDeadline` (
    `id` VARCHAR(191) NOT NULL,
    `materialId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hours` INTEGER NOT NULL DEFAULT 48,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubmissionDeadline_materialId_idx`(`materialId`),
    INDEX `SubmissionDeadline_userId_idx`(`userId`),
    UNIQUE INDEX `SubmissionDeadline_userId_materialId_key`(`userId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubmissionDeadline` ADD CONSTRAINT `SubmissionDeadline_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `CourseMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionDeadline` ADD CONSTRAINT `SubmissionDeadline_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
