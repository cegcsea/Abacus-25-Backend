/*
  Warnings:

  - You are about to drop the column `userId` on the `WorkshopPayment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkshopPayment" DROP CONSTRAINT "WorkshopPayment_userId_fkey";

-- AlterTable
ALTER TABLE "WorkshopPayment" DROP COLUMN "userId";
