-- DropForeignKey
ALTER TABLE "WorkshopPayment" DROP CONSTRAINT "WorkshopPayment_userId_fkey";

-- AlterTable
ALTER TABLE "WorkshopPayment" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "WorkshopPaymentUser" (
    "id" SERIAL NOT NULL,
    "workshopPaymentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WorkshopPaymentUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopPaymentUser_workshopPaymentId_userId_key" ON "WorkshopPaymentUser"("workshopPaymentId", "userId");

-- AddForeignKey
ALTER TABLE "WorkshopPayment" ADD CONSTRAINT "WorkshopPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopPaymentUser" ADD CONSTRAINT "WorkshopPaymentUser_workshopPaymentId_fkey" FOREIGN KEY ("workshopPaymentId") REFERENCES "WorkshopPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopPaymentUser" ADD CONSTRAINT "WorkshopPaymentUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
