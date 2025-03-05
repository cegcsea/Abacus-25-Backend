import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import sendEmail from "../utils/sendEmail.js";
import path from "path";
const prisma = new PrismaClient();
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8")
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
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8")
    );
    // const workshopsData = JSON.parse(
    //   fs.readFileSync(path.join("workshops.json"), "utf-8")
    // );

    const subject = "Abacus'25 Workshop Registration Successful";
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
      }))
    );
    transactionId.push(
      ...(await prisma.eventPayment.findMany({
        where: {
          transactionId: req.body.transactionId,
          status: {
            in: ["SUCCESS", "PENDING"],
          },
        },
      }))
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
  console.log("workshopPayment screenshot", req.body);
  try {
    const workshopPayment = await prisma.workshopPayment.findUnique({
      where: { id: parseInt(req.params.workshopPaymentId) },
    });

    if (!workshopPayment || workshopPayment.screenshot !== null) {
      fs.unlink(
        path.join(__dirname, "../images/" + req.file.filename),
        (err) => {
          if (err) console.error("Error deleting file:", err);
        }
      );
      return res.status(409).json({ message: "Invalid Payment Id" });
    }

    await prisma.workshopPayment.update({
      data: { screenshot: req.file.filename },
      where: { id: parseInt(req.params.workshopPaymentId) },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8")
    );
    const subject = "Abacus'25 Workshop Registration Successful";
    const text = `Thank you for registering for the ${
      workshopsData[workshopPayment.workshopId.toString()]
    } workshop. Your payment details will be verified by admin soon.`;

    const user = await prisma.user.findUnique({ where: { id: req.id } });
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
      }))
    );
    transactionId.push(
      ...(await prisma.workshopPayment.findMany({
        where: {
          transactionId: req.body.transactionId,
          status: {
            in: ["SUCCESS", "PENDING"],
          },
        },
      }))
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
        }
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

    let subject, text;
    if (eventPayment.eventId === 10) {
      subject = "Abacus'25 Accommodation Registration Successful";
      text =
        "Thank you for registering for accommodation during Abacus'25. Your payment details will be verified by admin soon.";
    } else {
      const eventsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8")
      );
      subject = "Abacus'25 Event Registration Successful";
      text =
        "Thank you for registering for the " +
        eventsData[eventPayment.eventId.toString()] +
        " event. Your payment details will be verified by admin soon.";
    }

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
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8")
    );
    // const workshopsData = JSON.parse(
    // fs.readFileSync("workshops.json", "utf-8")
    // );
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
