-- Khoá học trong Thời khoá biểu là khoá học OFFLINE, không phải Course
-- trên web -> bỏ liên kết courseId (FK tới Course), đổi thành courseTitle
-- nhập tay tự do. Giữ nguyên tên khoá học hiện có bằng cách copy từ
-- Course.title trước khi xoá cột/khoá ngoại cũ.

-- StudentSchedule
ALTER TABLE `StudentSchedule` ADD COLUMN `courseTitle` VARCHAR(191) NULL;

UPDATE `StudentSchedule` s
JOIN `Course` c ON c.`id` = s.`courseId`
SET s.`courseTitle` = c.`title`;

UPDATE `StudentSchedule` SET `courseTitle` = '' WHERE `courseTitle` IS NULL;

ALTER TABLE `StudentSchedule` MODIFY COLUMN `courseTitle` VARCHAR(191) NOT NULL;

ALTER TABLE `StudentSchedule` DROP FOREIGN KEY `StudentSchedule_courseId_fkey`;
DROP INDEX `StudentSchedule_courseId_idx` ON `StudentSchedule`;
ALTER TABLE `StudentSchedule` DROP COLUMN `courseId`;

-- RecurringSchedule
ALTER TABLE `RecurringSchedule` ADD COLUMN `courseTitle` VARCHAR(191) NULL;

UPDATE `RecurringSchedule` r
JOIN `Course` c ON c.`id` = r.`courseId`
SET r.`courseTitle` = c.`title`;

UPDATE `RecurringSchedule` SET `courseTitle` = '' WHERE `courseTitle` IS NULL;

ALTER TABLE `RecurringSchedule` MODIFY COLUMN `courseTitle` VARCHAR(191) NOT NULL;

ALTER TABLE `RecurringSchedule` DROP FOREIGN KEY `RecurringSchedule_courseId_fkey`;
DROP INDEX `RecurringSchedule_courseId_idx` ON `RecurringSchedule`;
ALTER TABLE `RecurringSchedule` DROP COLUMN `courseId`;
