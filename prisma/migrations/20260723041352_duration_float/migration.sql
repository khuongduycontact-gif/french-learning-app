/*
  Warnings:

  - You are about to alter the column `duration` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Course` MODIFY `duration` DOUBLE NOT NULL DEFAULT 0;
