import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import compileMailTemplate from "./compileMailTemplate.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

// Brevo transporter
const brevoTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// NodeMailer (Gmail/other) transporter
const nodemailerTransporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE || "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Get or create email counter for today
const getEmailCounter = async () => {
  const today = getTodayDate();

  let counter = await prisma.emailCounter.findUnique({
    where: { date: today },
  });

  if (!counter) {
    counter = await prisma.emailCounter.create({
      data: { date: today, count: 0 },
    });
  }

  return counter;
};

// Increment email counter
const incrementEmailCounter = async () => {
  const today = getTodayDate();

  await prisma.emailCounter.upsert({
    where: { date: today },
    update: { count: { increment: 1 } },
    create: { date: today, count: 1 },
  });
};

// Smart email sending with automatic fallback
const sendEmail = async (email, subject, text) => {
  try {
    const counter = await getEmailCounter();
    const useBrevo = counter.count < 280;

    const mailOptions = {
      from: useBrevo ? process.env.ADMIN_USER : process.env.NODEMAILER_USER,
      to: email,
      subject: subject,
      html: compileMailTemplate({ text: text }),
      attachments: [
        {
          filename: "csea-logo.png",
          path: path.join(__dirname, "assets", "csea-logo.png"),
          cid: "csea",
        },
        {
          filename: "abacus-logo.png",
          path: path.join(__dirname, "assets", "abacus-logo.png"),
          cid: "abacus",
        },
      ],
    };

    const transporter = useBrevo ? brevoTransporter : nodemailerTransporter;

    await transporter.sendMail(mailOptions);
    await incrementEmailCounter();

    console.log(
      `Email sent successfully via ${useBrevo ? "Brevo" : "NodeMailer"} (Count: ${counter.count + 1})`,
    );
  } catch (error) {
    console.error("Error sending email:", error.message);

    // If Brevo fails and we haven't tried NodeMailer yet, try it as fallback
    if (
      error.message.includes("Brevo") ||
      error.message.includes("smtp-relay")
    ) {
      try {
        console.log("Brevo failed, trying NodeMailer fallback...");
        const mailOptions = {
          from: process.env.NODEMAILER_USER,
          to: email,
          subject: subject,
          html: compileMailTemplate({ text: text }),
          attachments: [
            {
              filename: "csea-logo.png",
              path: path.join(__dirname, "assets", "csea-logo.png"),
              cid: "csea",
            },
            {
              filename: "abacus-logo.png",
              path: path.join(__dirname, "assets", "abacus-logo.png"),
              cid: "abacus",
            },
          ],
        };

        await nodemailerTransporter.sendMail(mailOptions);
        await incrementEmailCounter();
        console.log("Email sent successfully via NodeMailer (fallback)");
      } catch (fallbackError) {
        console.error("Fallback email also failed:", fallbackError.message);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
};

// Send email with a link button (for OLPC and similar)
export const sendEmailWithLink = async (email, subject, text, link) => {
  const counter = await getEmailCounter();
  const useNodeMailer = counter.count >= 280;

  try {
    const mailOptions = {
      from: useNodeMailer
        ? process.env.NODEMAILER_USER
        : process.env.BREVO_SMTP_USER,
      to: email,
      subject: subject,
      html: compileMailTemplate({ text: text, link: link }),
      attachments: [
        {
          filename: "csea-logo.png",
          path: path.join(__dirname, "assets", "csea-logo.png"),
          cid: "csea",
        },
        {
          filename: "abacus-logo.png",
          path: path.join(__dirname, "assets", "abacus-logo.png"),
          cid: "abacus",
        },
      ],
    };

    if (useNodeMailer) {
      await nodemailerTransporter.sendMail(mailOptions);
      console.log("Email with link sent successfully via NodeMailer");
    } else {
      await brevoTransporter.sendMail(mailOptions);
      console.log("Email with link sent successfully via Brevo");
    }
    await incrementEmailCounter();
  } catch (error) {
    console.error("Error sending email with link:", error.message);
    // Fallback to NodeMailer
    if (
      error.message.includes("Brevo") ||
      error.message.includes("smtp-relay")
    ) {
      try {
        console.log("Brevo failed, trying NodeMailer fallback...");
        const fallbackOptions = {
          from: process.env.NODEMAILER_USER,
          to: email,
          subject: subject,
          html: compileMailTemplate({ text: text, link: link }),
          attachments: [
            {
              filename: "csea-logo.png",
              path: path.join(__dirname, "assets", "csea-logo.png"),
              cid: "csea",
            },
            {
              filename: "abacus-logo.png",
              path: path.join(__dirname, "assets", "abacus-logo.png"),
              cid: "abacus",
            },
          ],
        };
        await nodemailerTransporter.sendMail(fallbackOptions);
        await incrementEmailCounter();
        console.log(
          "Email with link sent successfully via NodeMailer (fallback)",
        );
      } catch (fallbackError) {
        console.error("Fallback email also failed:", fallbackError.message);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
};

// Get today's email count (for monitoring)
export const getEmailCount = async () => {
  const counter = await getEmailCounter();
  return counter.count;
};

export default sendEmail;
