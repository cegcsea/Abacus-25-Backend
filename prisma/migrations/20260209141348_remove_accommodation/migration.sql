/*
  Warnings:

  - You are about to drop the column `accomodation` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Accomodation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Accomodation" DROP CONSTRAINT "Accomodation_userId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "accomodation";

-- DropTable
DROP TABLE "Accomodation";
