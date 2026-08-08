-- Bỏ trường "lessons" (số bài giảng nhập tay) khỏi Course. Số bài giảng
-- hiển thị phía client giờ được tính động bằng số CourseMaterial thực tế
-- của khoá học (course.materials.length), không cần lưu riêng nữa.
ALTER TABLE `Course` DROP COLUMN `lessons`;
