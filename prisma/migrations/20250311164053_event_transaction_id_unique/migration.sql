/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `EventPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventPayment_transactionId_key" ON "EventPayment"("transactionId");
