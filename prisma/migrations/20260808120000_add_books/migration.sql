-- Thêm 2 loại thông báo mới cho luồng mua sách (giống hệt luồng đăng ký/
-- thanh toán khoá học).
ALTER TABLE `Notification` MODIFY COLUMN `type` ENUM(
    'PAYMENT_SUBMITTED',
    'ENROLLMENT_CONFIRMED',
    'PAYMENT_REJECTED',
    'SUBMISSION_RECEIVED',
    'SUBMISSION_GRADED',
    'BOOK_PAYMENT_SUBMITTED',
    'BOOK_PURCHASE_CONFIRMED',
    'BOOK_PAYMENT_REJECTED'
) NOT NULL;

-- CreateTable: Sách/truyện
CREATE TABLE `Book` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `coverImage` TEXT NULL,
    `contentUrl` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Book_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: Lượt mua sách
CREATE TABLE `BookPurchase` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `paidAmount` INTEGER NOT NULL DEFAULT 0,
    `paymentNote` VARCHAR(191) NULL,
    `confirmedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BookPurchase_userId_bookId_key`(`userId`, `bookId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BookPurchase` ADD CONSTRAINT `BookPurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BookPurchase` ADD CONSTRAINT `BookPurchase_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
