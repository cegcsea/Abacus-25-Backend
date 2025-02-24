-- AlterTable
ALTER TABLE "user" ADD COLUMN     "eventPaymentId" INTEGER,
ADD COLUMN     "referralCode" TEXT;

-- CreateTable
CREATE TABLE "CampusAmbassador" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampusAmbassador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPayment" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "paymentMobile" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "screenshot" TEXT,
    "status" "Status" NOT NULL,
    "verifiedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accomodation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "day0" BOOLEAN NOT NULL,
    "day1" BOOLEAN NOT NULL,
    "day2" BOOLEAN NOT NULL,
    "day3" BOOLEAN NOT NULL,
    "food" BOOLEAN NOT NULL,
    "amount" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accomodation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampusAmbassador_email_key" ON "CampusAmbassador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CampusAmbassador_referralCode_key" ON "CampusAmbassador"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "EventPayment_screenshot_key" ON "EventPayment"("screenshot");

-- CreateIndex
CREATE UNIQUE INDEX "Accomodation_userId_key" ON "Accomodation"("userId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_referralCode_fkey" FOREIGN KEY ("referralCode") REFERENCES "CampusAmbassador"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_eventPaymentId_fkey" FOREIGN KEY ("eventPaymentId") REFERENCES "EventPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPayment" ADD CONSTRAINT "EventPayment_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accomodation" ADD CONSTRAINT "Accomodation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
