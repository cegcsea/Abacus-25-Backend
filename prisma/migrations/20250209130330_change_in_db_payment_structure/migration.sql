/*
  Warnings:

  - You are about to drop the column `userId` on the `WorkshopPayment` table. All the data in the column will be lost.
  - You are about to drop the `WorkshopPaymentUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkshopPayment" DROP CONSTRAINT "WorkshopPayment_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkshopPaymentUser" DROP CONSTRAINT "WorkshopPaymentUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkshopPaymentUser" DROP CONSTRAINT "WorkshopPaymentUser_workshopPaymentId_fkey";

-- AlterTable
ALTER TABLE "WorkshopPayment" DROP COLUMN "userId";

-- DropTable
DROP TABLE "WorkshopPaymentUser";

-- CreateTable
CREATE TABLE "_UserToWorkshopPayment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserToWorkshopPayment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserToWorkshopPayment_B_index" ON "_UserToWorkshopPayment"("B");

-- AddForeignKey
ALTER TABLE "_UserToWorkshopPayment" ADD CONSTRAINT "_UserToWorkshopPayment_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkshopPayment" ADD CONSTRAINT "_UserToWorkshopPayment_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkshopPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
