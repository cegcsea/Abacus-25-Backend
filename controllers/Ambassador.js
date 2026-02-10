import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get ambassador eligibility status
export const getAmbassadorStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.id },
      select: { referralCode: true },
    });

    if (!user || !user.referralCode) {
      return res.status(200).json({
        status: "OK",
        isAmbassador: false,
        isEligible: false,
        workshopReferrals: 0,
        message: "User is not a student ambassador",
      });
    }

    const ambassador = await prisma.campusAmbassador.findUnique({
      where: { referralCode: user.referralCode },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        isEligible: true,
        workshopsClaimed: true,
        workshopReferrals: true,
      },
    });

    if (!ambassador) {
      return res.status(200).json({
        status: "OK",
        isAmbassador: false,
        isEligible: false,
        workshopReferrals: 0,
        message: "User is not a student ambassador",
      });
    }

    return res.status(200).json({
      status: "OK",
      isAmbassador: true,
      isEligible: ambassador.isEligible,
      workshopReferrals: ambassador.workshopReferrals,
      ambassador: {
        ...ambassador,
        referralsNeeded: Math.max(0, 5 - ambassador.workshopReferrals),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error.message,
      message: "Internal server error",
    });
  }
};


export const getAllAmbassadors = async (req, res) => {
  console.log("GET ALL AMBASSADORS HIT"); 
  try {
    const ambassadors = await prisma.campusAmbassador.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        referralCode: true,
        isEligible: true,
        workshopReferrals: true,
        eventReferrals: true,
        workshopsClaimed: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      status: "OK",
      count: ambassadors.length,
      ambassadors,
    });
  } catch (error) {
  console.error("GET ALL AMBASSADORS ERROR:", error);

  return res.status(500).json({
    status: "error",
    message: error.message,
  });
}
};