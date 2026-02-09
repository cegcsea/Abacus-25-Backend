-- AlterTable
ALTER TABLE "CampusAmbassador" ADD COLUMN     "eventReferrals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workshopReferrals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "workshopsClaimed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EmailCounter" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailCounter_date_key" ON "EmailCounter"("date");
