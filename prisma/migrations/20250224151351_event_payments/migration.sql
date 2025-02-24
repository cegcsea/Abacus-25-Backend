/*
  Warnings:

  - You are about to drop the column `eventPaymentId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_eventPaymentId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "eventPaymentId";

-- CreateTable
CREATE TABLE "_EventPaymentToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventPaymentToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventPaymentToUser_B_index" ON "_EventPaymentToUser"("B");

-- AddForeignKey
ALTER TABLE "_EventPaymentToUser" ADD CONSTRAINT "_EventPaymentToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "EventPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventPaymentToUser" ADD CONSTRAINT "_EventPaymentToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
