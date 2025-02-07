import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import sendEmail from "../utils/sendEmail.js";

const prisma = new PrismaClient();

export const eventRegister = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.id },
      include: { events: true },
    });

    if (!user) {
      res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Invalid User",
      });
      return;
    }

    if (user.events.some((event) => event.eventId === req.body.eventId)) {
      res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "User already registered for the event!",
      });
      return;
    }

    await prisma.event.create({
      data: { userId: req.id, eventId: req.body.eventId },
    });

    res.status(200).json({
      status: "OK",
      message: "Event registration successful!",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error",
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.id },
      include: { events: true },
    });

    if (!user) {
      res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Invalid User",
      });
      return;
    }

    const eventsData = JSON.parse(fs.readFileSync("events.json", "utf-8"));
    const events = user.events.map((event) => ({
      eventId: event.eventId,
      eventName: eventsData[event.eventId.toString()],
    }));

    res.status(200).json({
      status: "OK",
      message: "Events fetched successfully!",
      events: { events },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error",
    });
  }
};

export const workshopRegister = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.id },
      include: { workshops: true },
    });

    if (!user) {
      res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Invalid User",
      });
      return;
    }

    if (
      user.workshops.some(
        (workshop) => workshop.workshopId === req.body.workshopId
      )
    ) {
      res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "User already registered for the workshop",
      });
      return;
    }

    const data = await prisma.workshop.create({
      data: { userId: req.id, workshopId: req.body.workshopId },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync(path.join("workshops.json"), "utf-8")
    );

    const subject = "Reach'25 Workshop Registration Successful";
    const text = `Thank you for registering for ${
      workshopsData[req.body.workshopId.toString()]
    } workshop.`;
    sendEmail(user.email, subject, text);

    res.status(200).json({
      status: "OK",
      message: "Workshop registration successful!",
      data: { data },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error",
    });
  }
};
export const verifyWorkshopPaymentDetails = async (req, res) => {
  try {
    console.log(req.body);
    const user = await prisma.user.findUnique({
      where: { id: req.id },
      include: { workshopPayments: true },
    });

    if (!user) {
      return res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Invalid User",
      });
    }
    console.log(req.body);
    let alreadyPaid = false;
    let pendingPaymentId = null;

    user.workshopPayments.forEach((payment) => {
      if (
        payment.workshopId === req.body.workshopId &&
        payment.transactionId === req.body.transactionId &&
        payment.paymentMobile === req.body.paymentMobile &&
        payment.status === "PENDING" &&
        !payment.screenshot
      ) {
        alreadyPaid = true;
        pendingPaymentId = payment.id;
      } else if (
        payment.workshopId === req.body.workshopId &&
        payment.status === "SUCCESS"
      ) {
        alreadyPaid = true;
      }
    });

    // If user has a successful payment, reject request
    if (alreadyPaid && !pendingPaymentId) {
      return res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "User has already paid for the workshop",
      });
    }

    console.log(req.body);

    const transactionId = await prisma.workshopPayment.findUnique({
      where: { transactionId: req.body.transactionId },
    });

    if (transactionId) {
      return res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Invalid Transaction Id",
      });
    }
    console.log(req.body);
    const workshopPayment = await prisma.workshopPayment.create({
      data: {
        workshopId: parseInt(req.body.workshopId),
        transactionId: req.body.transactionId,
        paymentMobile: req.body.paymentMobile,
        status: "PENDING",
        User: { connect: { id: req.id } },
      },
    });
    console.log(req.body);
    return res.status(200).json({
      status: "OK",
      message: "Payment details verified",
      data: { id: workshopPayment.id },
    });
  } catch (error) {
    console.error("❌ Error during workshop payment creation:", error);

    return res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error in payment",
    });
  }
};

// export const verifyWorkshopPaymentDetails = async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.id },
//       include: { workshopPayments: true },
//     });

//     if (!user) {
//       return res.status(409).json({
//         status: "error",
//         error: "Conflict",
//         message: "Invalid User",
//       });
//     }

//     let alreadyPaid = false;
//     let pendingPaymentId = null;

//     user.workshopPayments.forEach((payment) => {
//       if (
//         payment.workshopId === req.body.workshopId &&
//         payment.transactionId === req.body.transactionId &&
//         payment.paymentMobile === req.body.paymentMobile &&
//         payment.status === "PENDING" &&
//         !payment.screenshot
//       ) {
//         alreadyPaid = true;
//         pendingPaymentId = payment.id;
//       } else if (
//         payment.workshopId === req.body.workshopId &&
//         payment.status === "SUCCESS"
//       ) {
//         alreadyPaid = true;
//       }
//     });

//     // If user has a successful payment, reject request
//     if (alreadyPaid && !pendingPaymentId) {
//       return res.status(409).json({
//         status: "error",
//         error: "Conflict",
//         message: "User has already paid for the workshop",
//       });
//     }

//     const transactionId = await prisma.workshopPayment.findUnique({
//       where: { transactionId: req.body.transactionId },
//     });

//     if (transactionId) {
//       return res.status(409).json({
//         status: "error",
//         error: "Conflict",
//         message: "Invalid Transaction Id",
//       });
//     }

//     // Create Workshop Payment
//     const workshopPayment = await prisma.workshopPayment.create({
//       data: {
//         workshopId: parseInt(req.body.workshopId),
//         transactionId: req.body.transactionId,
//         paymentMobile: req.body.paymentMobile,
//         status: "PENDING",
//         user: { connect: { id: req.id } }, // This part remains the same
//       },
//     });

//     // Link users with Workshop Payment using WorkshopPaymentUser
//     const userPayments = req.body.userIds.map((userId) => ({
//       userId: userId,
//       workshopPaymentId: workshopPayment.id,
//     }));
//     await prisma.workshopPaymentUser.createMany({ data: userPayments });

//     return res.status(200).json({
//       status: "OK",
//       message: "Payment details verified",
//       data: { id: workshopPayment.id },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       error: `Something went wrong.\n${error.message}`,
//       message: "Internal server error",
//     });
//   }
// };

export const workshopPaymentScreenshot = async (req, res) => {
  try {
    const workshopPayment = await prisma.workshopPayment.findUnique({
      where: { id: parseInt(req.params.workshopPaymentId) },
    });

    if (!workshopPayment || workshopPayment.screenshot != null) {
      fs.unlink(path.join("../images/" + req.file.filename), (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      return res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Invalid Payment Id",
      });
    }

    await prisma.workshopPayment.update({
      data: { screenshot: req.file.filename },
      where: { id: parseInt(req.params.workshopPaymentId) },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync("workshops.json", "utf-8")
    );

    const subject = "Reach'25 Workshop Registration Successful";
    const text = `Thank you for registering for ${
      workshopsData[workshopPayment.workshopId.toString()]
    } workshop.`;

    const user = await prisma.user.findUnique({ where: { id: req.id } });

    sendEmail(user.email, subject, text);

    return res.status(200).json({
      status: "OK",
      message: "Screenshot uploaded successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error in screenshot",
    });
  }
};

export const bulkWorkshopPayment = async (req, res) => {
  try {
    const { workshopId, transactionId, paymentMobile, userIds } = req.body;

    if (
      !workshopId ||
      !transactionId ||
      !paymentMobile ||
      !userIds ||
      !userIds.length
    ) {
      return res.status(400).json({
        status: "error",
        error: "Bad Request",
        message: "Missing required fields or empty userIds array",
      });
    }
    
    // console.log( userIds.split(","));
    // if (userIds.length !== 5) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Exactly 5 unique user IDs must be provided",
    //   });
    // }

    const existingTransaction = await prisma.workshopPayment.findUnique({
      where: { transactionId },
    });

    if (existingTransaction) {
      return res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Transaction ID already exists",
      });
    }
    //console.log(userIds);
    let processedUserIds =
      typeof userIds === "string" ? JSON.parse(userIds) : userIds;
    processedUserIds = processedUserIds
      .map((uid) => parseInt(uid, 10))
      .filter((uid) => !isNaN(uid));
    console.log(processedUserIds);
    const validUsers = await prisma.user.findMany({
      where: { id: { in: processedUserIds } },
      select: { id: true },
    });

    const validUserIds = validUsers.map((user) => user.id);

    if (validUserIds.length !== 5) {
      return res.status(400).json({
        status: "error",
        message:
          "All 5 provided user IDs must be valid and exist in the database",
      });
    }

    const conflictingPayments = await prisma.workshopPayment.findMany({
      where: {
        userId: { in: validUserIds },
        workshopId: parseInt(workshopId),
        status: { in: ["PENDING", "SUCCESS"] },
      },
      select: { userId: true },
    });

    if (conflictingPayments.length > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "One or more users have an ongoing or successful payment and cannot register for this workshop again!",
        conflictingUsers: conflictingPayments.map((user) => user.userId),
      });
    }

    const workshopPayment = await prisma.workshopPayment.create({
      data: {
        workshopId: parseInt(workshopId),
        transactionId,
        paymentMobile,
        status: "PENDING",
      },
    });

    const userPayments = validUserIds.map((userId) => ({
      userId,
      workshopPaymentId: workshopPayment.id,
    }));

    await prisma.workshopPaymentUser.createMany({
      data: userPayments,
      skipDuplicates: true,
    });

    const workshopsData = JSON.parse(
      fs.readFileSync(path.join("workshops.json"), "utf-8")
    );

    for (const userId of validUserIds) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const subject = "Reach'25 Workshop Registration Successful";
      const text = `Thank you for registering for ${
        workshopsData[workshopId.toString()]
      } workshop.`;
      sendEmail(user.email, subject, text);
    }

    res.status(200).json({
      status: "OK",
      message:
        "Bulk payment recorded and users registered for the workshop successfully",
      payment: workshopPayment,
      data: {
        newRegistrations: validUserIds,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      message: "Internal server error",
    });
  }
};

export const getWorkshops = async (req, res) => {
  console.log("called");
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
      include: {
        workshops: true,
      },
    });
    if (!user) {
      return res.status(409).json({
        status: "error",
        message: "Invalid User",
      });
    }
    const workshopsData = JSON.parse(
      fs.readFileSync("workshops.json", "utf-8")
    );
    console.log(workshopsData);
    const workshops = user.workshops.map((workshop) => {
      return {
        workshopId: workshop.workshopId,
        workshopName: workshopsData[workshop.workshopId.toString()],
      };
    });
    console.log(workshops);
    return res.status(200).json({
      status: "success",
      message: "Workshop fetched successfully",
      data: {
        workshops: workshops,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      details: error,
    });
  }
};

// This function links the user to the payment
// export const getUserWorkshops = async (req, res) => {
//   const userId = req.id; // Ensure 'req.id' is passed correctly from the authorization middleware
//   console.log("Fetching workshops for user ID:", userId);

//   try {
//     // Fetch all workshops the user is registered for
//     const workshops = await prisma.workshop.findMany({
//       where: { userId: userId }, // Ensure the userId is passed properly
//     });
//     console.log("User's Workshops:", workshops);

//     // Fetch individual payments for the user
//     const individualPayments = await prisma.workshopPayment.findMany({
//       where: { userId: userId },
//     });
//     console.log("Individual Payments:", individualPayments);

//     //  Fetch bulk payments the user is part of
//     const workshopPaymentUsers = await prisma.workshopPaymentUser.findMany({
//       where: { userId: userId },
//       include: { workshopPayment: true },
//     });
//     console.log(
//       "Workshop Payment Users (Bulk Payments):",
//       workshopPaymentUsers
//     );

//     //Merge both individual & bulk payments
//     const allPayments = [
//       ...individualPayments,
//       ...workshopPaymentUsers.map((record) => ({
//         id: record.workshopPaymentId,
//         userId: record.userId,
//         workshopId: record.workshopPayment.workshopId,
//         status: record.workshopPayment.status,
//       })),
//     ];

//     console.log("All Merged Payments (Before Deduplication):", allPayments);

//     const uniquePayments = Array.from(
//       new Map(allPayments.map((payment) => [payment.id, payment])).values()
//     );

//     console.log("Unique Payments (After Deduplication):", uniquePayments);

//     const paymentsByWorkshop = {};
//     uniquePayments.forEach((payment) => {
//       if (!paymentsByWorkshop[payment.workshopId]) {
//         paymentsByWorkshop[payment.workshopId] = [];
//       }
//       paymentsByWorkshop[payment.workshopId].push(payment);
//     });

//     console.log("Payments Grouped by Workshop ID:", paymentsByWorkshop);

//     //Combine workshops with payment status
//     const getBestPayment = (payments) => {
//       let bestPayment = null;
//       for (const payment of payments) {
//         if (payment.status === "SUCCESS") {
//           return payment;
//         } else if (
//           payment.status === "PENDING" &&
//           (bestPayment?.status === "FAILURE" || !bestPayment)
//         ) {
//           bestPayment = payment;
//         } else if (!bestPayment) {
//           bestPayment = payment;
//         }
//       }
//       return bestPayment;
//     };

//     const bestPaymentsByWorkshop = {};
//     allPayments.forEach((payment) => {
//       const workshopId = payment.workshopId;
//       if (!bestPaymentsByWorkshop[workshopId]) {
//         bestPaymentsByWorkshop[workshopId] = payment;
//       } else {
//         bestPaymentsByWorkshop[workshopId] = getBestPayment([
//           bestPaymentsByWorkshop[workshopId],
//           payment,
//         ]);
//       }
//     });

//     console.log("Best pay for each workshop:", bestPaymentsByWorkshop);

//     const uniqueWorkshopsMap = new Map();
//     workshops.forEach((workshop) => {
//       uniqueWorkshopsMap.set(workshop.workshopId, workshop);
//     });

//     //Convert Map back to an array
//     const uniqueWorkshops = Array.from(uniqueWorkshopsMap.values());

//     //  Combine workshops with payment status
//     // const workshopsWithPayments = uniqueWorkshops.map((workshop) => {
//     //   const bestPayment = bestPaymentsByWorkshop[workshop.workshopId] || null;

//     //   return {
//     //     ...workshop,
//     //     paymentStatus: bestPayment ? bestPayment.status : "No Payment",
//     //     paymentDetails: bestPayment || {},
//     //   };
//     // });

//     const finalWorkshops = [...uniqueWorkshops, ...Object.values(bestPaymentsByWorkshop)];

//     console.log("Final :", finalWorkshops);

//     res.status(200).json({ workshops: finalWorkshops });
//   } catch (error) {
//     console.error("❌ Error fetching workshops:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getUserWorkshops = async (req, res) => {
  const userId = req.id; // User ID from authentication middleware
  console.log("Fetching workshops for user ID:", userId);

  try {
    const freeWorkshops = await prisma.workshop.findMany({
      where: { userId: userId },
    });
    console.log("Free Workshops:", freeWorkshops);

    const individualPayments = await prisma.workshopPayment.findMany({
      where: { userId: userId },
    });
    console.log("Individual Paid Workshops:", individualPayments);

    const bulkPayments = await prisma.workshopPaymentUser.findMany({
      where: { userId: userId },
      include: { workshopPayment: true },
    });
    console.log("Bulk Paid Workshops:", bulkPayments);

    const allPaidWorkshops = [
      ...individualPayments,
      ...bulkPayments.map((record) => ({
        id: record.workshopPaymentId,
        userId: record.userId,
        workshopId: record.workshopPayment.workshopId,
        status: record.workshopPayment.status,
      })),
    ];

    console.log(
      "Merged Paid Workshops (Before Deduplication):",
      allPaidWorkshops
    );

    const uniquePayments = Array.from(
      new Map(allPaidWorkshops.map((payment) => [payment.id, payment])).values()
    );
    console.log("Unique Paid Workshops (After Deduplication):", uniquePayments);

    const paymentsByWorkshop = {};
    uniquePayments.forEach((payment) => {
      if (!paymentsByWorkshop[payment.workshopId]) {
        paymentsByWorkshop[payment.workshopId] = [];
      }
      paymentsByWorkshop[payment.workshopId].push(payment);
    });

    console.log("Payments Grouped by Workshop ID:", paymentsByWorkshop);

    //Combine workshops with payment status
    const getBestPayment = (payments) => {
      let bestPayment = null;
      for (const payment of payments) {
        if (payment.status === "SUCCESS") {
          return payment;
        } else if (
          payment.status === "PENDING" &&
          (bestPayment?.status === "FAILURE" || !bestPayment)
        ) {
          bestPayment = payment;
        } else if (!bestPayment) {
          bestPayment = payment;
        }
      }
      return bestPayment;
    };

    const bestPaymentsByWorkshop = {};
    uniquePayments.forEach((payment) => {
      const workshopId = payment.workshopId;
      if (!bestPaymentsByWorkshop[workshopId]) {
        bestPaymentsByWorkshop[workshopId] = payment;
      } else {
        bestPaymentsByWorkshop[workshopId] = getBestPayment([
          bestPaymentsByWorkshop[workshopId],
          payment,
        ]);
      }
    });

    const finalWorkshops = [
      ...freeWorkshops,
      ...Object.values(bestPaymentsByWorkshop),
    ];

    console.log("Final Workshops List:", finalWorkshops);

    res.status(200).json({ workshops: finalWorkshops });
  } catch (error) {
    console.error("❌ Error fetching workshops:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
