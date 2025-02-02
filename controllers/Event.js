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

    const workshopPayment = await prisma.workshopPayment.create({
      data: {
        workshopId: parseInt(req.body.workshopId),
        transactionId: req.body.transactionId,
        paymentMobile: req.body.paymentMobile,
        status: "PENDING",
        user: { connect: { id: req.id } },
      },
    });

    return res.status(200).json({
      status: "OK",
      message: "Payment details verified",
      data: { id: workshopPayment.id },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error",
    });
  }
};

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

    // Validate unique transaction ID
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

    // Create payment record
    const workshopPayment = await prisma.workshopPayment.create({
      data: { workshopId, transactionId, paymentMobile, status: "PENDING" },
    });

    // Associate multiple users with this payment
    const userPayments = userIds.map((userId) => ({
      userId,
      workshopPaymentId: workshopPayment.id,
    }));
    await prisma.userPayment.createMany({ data: userPayments });

    res
      .status(200)
      .json({ status: "OK", message: "Bulk payment recorded successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        error: error.message,
        message: "Internal server error",
      });
  }
};

export const getWorkshops = async (req, res) => {
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
    const workshops = user.workshops.map((workshop) => {
      return {
        workshopId: workshop.workshopId,
        workshopName: workshopsData[workshop.workshopId.toString()],
      };
    });
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
