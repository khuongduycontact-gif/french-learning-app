-- Bỏ nút CTA (nhãn + liên kết) ở khối giới thiệu đầu trang "Giới thiệu về tôi"
ALTER TABLE `AboutPage` DROP COLUMN `heroCtaLabel`,
                        DROP COLUMN `heroCtaHref`;
