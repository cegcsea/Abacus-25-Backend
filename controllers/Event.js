import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import sendEmail from "../utils/emailService.js";
import path from "path";
const prisma = new PrismaClient();
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const safeUnlink = (filePath) => {
  if (!filePath) {
    return;
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    }
  });
};

const parseJsonArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
};
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
    const eventsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8"),
    );
    // const eventsData = JSON.parse(fs.readFileSync("events.json", "utf-8"));
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
    const { claimFree } = req.body; // Frontend sends claimFree: true if ambassador wants to use their benefit

    const user = await prisma.user.findUnique({
      where: { id: req.id },
      include: {
        workshops: true,
        CampusAmbassador: true,
      },
    });

    if (!user) {
      return res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "Invalid User",
      });
    }

    if (
      user.workshops.some(
        (workshop) => workshop.workshopId === req.body.workshopId,
      )
    ) {
      return res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "User already registered for the workshop",
      });
    }

    // Check if user is trying to claim free workshop as ambassador
    if (claimFree) {
      // Find the ambassador by referral code
      const ambassador = await prisma.campusAmbassador.findUnique({
        where: { referralCode: user.referralCode },
      });

      if (!ambassador) {
        return res.status(403).json({
          status: "error",
          error: "Forbidden",
          message: "User is not a student ambassador",
        });
      }

      if (!ambassador.isEligible) {
        return res.status(403).json({
          status: "error",
          error: "Forbidden",
          message:
            "Not eligible for free workshop. Need 5 workshop referrals or already claimed.",
        });
      }

      // Double-check: Ensure they haven't already claimed a free workshop
      if (ambassador.workshopsClaimed > 0) {
        return res.status(403).json({
          status: "error",
          error: "Forbidden",
          message: "You have already claimed your free workshop benefit.",
        });
      }

      // Register the workshop for free
      await prisma.workshop.create({
        data: { userId: req.id, workshopId: req.body.workshopId },
      });

      // Reset eligibility and increment workshops claimed
      await prisma.campusAmbassador.update({
        where: { id: ambassador.id },
        data: {
          isEligible: false,
          workshopsClaimed: { increment: 1 },
        },
      });

      const workshopsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
      );

      const subject = "Abacus'26 Student Ambassador - Free Workshop Claimed";
      const text = `Congratulations! You have successfully claimed your free registration for ${
        workshopsData[req.body.workshopId.toString()]
      } workshop as a Student Ambassador benefit.`;

      sendEmail(user.email, subject, text);

      return res.status(200).json({
        status: "OK",
        message: "Free workshop registration successful!",
        data: { isFree: true },
      });
    }

    // Regular registration (user must pay)
    const data = await prisma.workshop.create({
      data: { userId: req.id, workshopId: req.body.workshopId },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
    );

    const subject = "Abacus'26 Workshop Registration Successful";
    const text = `Thank you for registering for ${
      workshopsData[req.body.workshopId.toString()]
    } workshop.`;
    sendEmail(user.email, subject, text);

    return res.status(200).json({
      status: "OK",
      message: "Workshop registration successful!",
      data: { data },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error",
    });
  }
};

export const bulkWorkshopPaymentVerify = async (req, res) => {
  try {
    // Parse FormData fields - workshopId and userIds are JSON stringified arrays
    let workshopIds, userIds;

    try {
      workshopIds = JSON.parse(req.body.workshopId);
      userIds = JSON.parse(req.body.userIds);
    } catch (parseError) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid data format - workshopId and userIds must be valid JSON arrays",
      });
    }

    const { transactionId, paymentMobile } = req.body;

    // Validate exactly 2 workshops
    if (!workshopIds || workshopIds.length !== 2) {
      return res.status(400).json({
        status: "error",
        message: "Bulk payment requires exactly 2 workshop IDs",
      });
    }

    // Validate workshops are 1 and 2
    const sortedIds = [...workshopIds].sort();
    if (sortedIds[0] !== 1 || sortedIds[1] !== 2) {
      return res.status(400).json({
        status: "error",
        message: "Bulk payment is only available for workshops 1 and 2",
      });
    }

    // Validate users exist
    const validUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    if (validUsers.length !== userIds.length) {
      return res.status(400).json({
        status: "error",
        message: "All provided user IDs must be valid!",
      });
    }

    // Check if any user already has bulk payment pending/success
    const existingBulkPayments = await prisma.workshopPayment.findMany({
      where: {
        workshopId: 0, // 0 indicates bulk payment
        users: {
          some: {
            id: { in: userIds },
          },
        },
        status: { in: ["SUCCESS", "PENDING"] },
      },
    });

    if (existingBulkPayments.length > 0) {
      return res.status(409).json({
        status: "error",
        message:
          "You already have a bulk workshop payment pending or completed",
      });
    }

    // Check for existing individual workshop registrations
    const existingWorkshops = await prisma.workshop.findMany({
      where: {
        userId: { in: userIds },
        workshopId: { in: [1, 2] },
      },
    });

    if (existingWorkshops.length > 0) {
      return res.status(409).json({
        status: "error",
        message:
          "You are already registered for one or both workshops individually. Bulk registration is not available.",
      });
    }

    // Check if transaction ID already exists
    const existingTransaction = await prisma.workshopPayment.findFirst({
      where: {
        transactionId,
        status: { in: ["SUCCESS", "PENDING"] },
      },
    });

    const existingEventTransaction = await prisma.eventPayment.findFirst({
      where: {
        transactionId,
        status: { in: ["SUCCESS", "PENDING"] },
      },
    });

    if (existingTransaction || existingEventTransaction) {
      return res.status(409).json({
        status: "error",
        message: "Invalid Transaction ID - already in use",
      });
    }

    // Create bulk payment record (workshopId: 0 indicates both workshops)
    const connectedUsers = userIds.map((userId) => ({ id: userId }));

    const bulkPayment = await prisma.workshopPayment.create({
      data: {
        workshopId: 0, // Special ID for bulk payment (₹500 for both workshops)
        transactionId,
        paymentMobile,
        status: "PENDING",
        users: {
          connect: connectedUsers,
        },
      },
    });

    // Return response in format expected by frontend
    return res.status(200).json({
      message:
        "Bulk payment details submitted successfully. Please upload payment screenshot.",
      payment: {
        id: bulkPayment.id,
        workshopId: 0,
        transactionId: bulkPayment.transactionId,
        totalAmount: 500,
      },
    });
  } catch (error) {
    console.error("Bulk payment verification error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
      error: "Internal server error",
    });
  }
};

// Legacy controller for JSON-based requests (kept for backward compatibility)
export const verifyWorkshopPaymentDetails = async (req, res) => {
  try {
    const validUsers = await prisma.user.findMany({
      where: { id: { in: req.body.users } },
      select: { id: true },
    });

    const validUserIds = validUsers.map((user) => user.id);

    if (validUserIds.length !== req.body.users.length) {
      return res.status(400).json({
        status: "error",
        message: "All provided user IDs must be valid!",
      });
    }
    // req.body.users.splice(0, 0, req.id)
    const user = await prisma.user.findMany({
      where: {
        id: {
          in: req.body.users,
        },
      },
      include: {
        WorkshopPayment: true,
      },
    });
    if (!user) {
      return res.status(409).json({ message: "Invalid User" });
    }
    //console.log(req.body.users);
    let connectedUsers = req.body.users.map((user) => {
      return { id: user };
    });
    //console.log(connectedUsers);
    let alreadyPaid = false;
    user.map((u) => {
      u.WorkshopPayment.map((workshopPayment) => {
        if (
          workshopPayment.workshopId === req.body.workshopId &&
          workshopPayment.status !== "FAILURE"
        ) {
          alreadyPaid = true;
        }
      });
    });
    if (alreadyPaid) {
      return res.status(409).json({
        message: "One of the users has already paid for the workshop",
      });
    }

    let transactionId = [];
    transactionId.push(
      ...(await prisma.workshopPayment.findMany({
        where: {
          transactionId: req.body.transactionId,
          status: {
            in: ["SUCCESS", "PENDING"],
          },
        },
      })),
    );
    transactionId.push(
      ...(await prisma.eventPayment.findMany({
        where: {
          transactionId: req.body.transactionId,
          status: {
            in: ["SUCCESS", "PENDING"],
          },
        },
      })),
    );
    if (transactionId.length > 0) {
      return res.status(409).json({ message: "Invalid Transaction Id" });
    }

    const workshopPayment = await prisma.workshopPayment.create({
      data: {
        workshopId: parseInt(req.body.workshopId),
        transactionId: req.body.transactionId,
        paymentMobile: req.body.paymentMobile,
        status: "PENDING",
        users: {
          connect: connectedUsers,
        },
      },
    });
    //console.log(workshopPayment);
    return res
      .status(200)
      .json({ message: "Payment details verified", id: workshopPayment.id });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const workshopPaymentScreenshot = async (req, res) => {
  try {
    const workshopPayment = await prisma.workshopPayment.findUnique({
      where: { id: parseInt(req.params.workshopPaymentId) },
    });

    if (!workshopPayment || workshopPayment.screenshot !== null) {
      fs.unlink(
        path.join(__dirname, "../images/" + req.file.filename),
        (err) => {
          if (err) console.error("Error deleting file:", err);
        },
      );
      return res.status(409).json({ message: "Invalid Payment Id" });
    }

    await prisma.workshopPayment.update({
      data: { screenshot: req.file.filename },
      where: { id: parseInt(req.params.workshopPaymentId) },
    });

    const user = await prisma.user.findUnique({ where: { id: req.id } });
    const subject = "Abacus'26 Workshop Registration Successful";

    // Check if this is a bulk payment (workshopId: 0)
    let text;
    if (workshopPayment.workshopId === 0) {
      text = `Thank you for registering for BOTH workshops (Bulk Registration)! You've saved ₹100 by choosing the bulk package. Your payment details will be verified by admin soon. Total Amount: ₹500`;
    } else {
      const workshopsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
      );
      text = `Thank you for registering for the ${
        workshopsData[workshopPayment.workshopId.toString()]
      } workshop. Your payment details will be verified by admin soon.`;
    }

    sendEmail(user.email, subject, text);

    return res
      .status(200)
      .json({ message: "Screenshot uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const verifyEventPaymentDetails = async (req, res) => {
  try {
    const validUsers = await prisma.user.findMany({
      where: { id: { in: req.body.users } },
      select: { id: true },
    });

    const validUserIds = validUsers.map((user) => user.id);

    if (validUserIds.length !== req.body.users.length) {
      return res.status(400).json({
        status: "error",
        message: "All provided user IDs must be valid!",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: req.body.users,
        },
      },
      include: {
        eventPayments: true,
      },
    });

    if (!users || users.length === 0) {
      return res.status(409).json({ message: "Invalid User" });
    }

    const connectedUsers = req.body.users.map((user) => {
      return { id: user };
    });

    let alreadyPaid = false;
    users.forEach((u) => {
      u.eventPayments.forEach((eventPayment) => {
        if (
          eventPayment.eventId === req.body.eventId &&
          eventPayment.status !== "FAILURE"
        ) {
          alreadyPaid = true;
        }
      });
    });
    if (alreadyPaid) {
      return res.status(409).json({
        message: "One of the users has already paid for the event",
      });
    }

    let transactionId = [];
    transactionId.push(
      ...(await prisma.eventPayment.findMany({
        where: {
          transactionId: req.body.transactionId,
          status: {
            in: ["SUCCESS", "PENDING"],
          },
        },
      })),
    );
    transactionId.push(
      ...(await prisma.workshopPayment.findMany({
        where: {
          transactionId: req.body.transactionId,
          status: {
            in: ["SUCCESS", "PENDING"],
          },
        },
      })),
    );
    if (transactionId.length > 0) {
      return res.status(409).json({ message: "Invalid Transaction Id" });
    }

    const eventPayment = await prisma.eventPayment.create({
      data: {
        eventId: parseInt(req.body.eventId),
        transactionId: req.body.transactionId,
        paymentMobile: req.body.paymentMobile,
        status: "PENDING",
        users: {
          connect: connectedUsers,
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Payment details verified", id: eventPayment.id });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const eventPaymentScreenshot = async (req, res) => {
  try {
    const eventPayment = await prisma.eventPayment.findUnique({
      where: {
        id: parseInt(req.params.eventPaymentId),
      },
    });

    if (!eventPayment || eventPayment.screenshot !== null) {
      fs.unlink(
        path.join(__dirname, "../images/" + req.file.filename),
        (err) => {
          if (err) console.error("Error deleting file:", err);
        },
      );
      return res.status(409).json({ message: "Invalid Payment Id" });
    }

    await prisma.eventPayment.update({
      data: {
        screenshot: req.file.filename,
      },
      where: {
        id: parseInt(req.params.eventPaymentId),
      },
    });

    const eventsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8"),
    );
    const subject = "Abacus'26 Event Registration Successful";
    const text =
      "Thank you for registering for the " +
      eventsData[eventPayment.eventId.toString()] +
      " event. Your payment details will be verified by admin soon.";

    const user = await prisma.user.findUnique({
      where: { id: req.id },
    });
    sendEmail(user.email, subject, text);

    return res
      .status(200)
      .json({ message: "Screenshot uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
