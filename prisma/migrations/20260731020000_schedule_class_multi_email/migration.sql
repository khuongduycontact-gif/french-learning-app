-- 1 lớp có thể có nhiều học viên, mỗi học viên 1 gmail -> đổi studentEmail
-- (1 gmail) thành studentEmails (nhiều gmail, cách nhau bởi dấu phẩy), đổi
-- kiểu cột sang TEXT vì danh sách nhiều gmail có thể dài hơn 191 ký tự.
-- Đồng thời đổi studentName (tên học viên) thành className (tên lớp), và bỏ
-- hẳn courseTitle (không còn nhập khoá học rời, tên lớp đã thay thế vai trò
-- nhận diện buổi học này thuộc lớp nào).

-- StudentSchedule
ALTER TABLE `StudentSchedule` CHANGE COLUMN `studentName` `className` VARCHAR(191) NOT NULL;
ALTER TABLE `StudentSchedule` CHANGE COLUMN `studentEmail` `studentEmails` TEXT NOT NULL;
ALTER TABLE `StudentSchedule` DROP COLUMN `courseTitle`;

-- RecurringSchedule
ALTER TABLE `RecurringSchedule` CHANGE COLUMN `studentName` `className` VARCHAR(191) NOT NULL;
ALTER TABLE `RecurringSchedule` CHANGE COLUMN `studentEmail` `studentEmails` TEXT NOT NULL;
ALTER TABLE `RecurringSchedule` DROP COLUMN `courseTitle`;
