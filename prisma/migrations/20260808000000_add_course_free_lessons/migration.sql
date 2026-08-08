-- Thêm số bài học miễn phí (xem trước, không cần đăng ký khoá học) cho mỗi
-- khoá học. Mặc định 0 để giữ nguyên hành vi cũ (phải đăng ký mới xem được
-- bài học nào) cho toàn bộ dữ liệu hiện có.
ALTER TABLE `Course` ADD COLUMN `freeLessons` INTEGER NOT NULL DEFAULT 0;
