import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import sendEmail from "../utils/sendEmail.js"; // Make sure to add the `.js` extension
import dotenv from "dotenv";

const prisma = new PrismaClient();

dotenv.config();

export const login = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin not Found" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      admin.password
    );
    console.log("Received Password:", req.body.password);
    console.log("Stored Password Hash:", admin.password);
    console.log("Password Valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Password. Try Again" });
    }
    const token = jwt.sign(
      { id: admin.id, role: "ADMIN" },
      process.env.JWTPRIVATEKEY
    );
    console.log("Generated Token:", token); // Log the token

    return res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
};

export const addAdmin = async (req, res) => {
  try {
    //if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    //New Admin
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const password = await bcrypt.hash(req.body.password, salt);

    const admin = await prisma.admin.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: password,
      },
    });

    const subject = "Admin added successfully";
    const text =
      "You have been granted administrative access to Reach'24\n\n Thank you\n\n";

    await sendEmail(admin.email, subject, text);

    return res.status(200).json({ message: "Admin added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
};

export const changePassword = async (req, res) => {
  try {
    console.log(req.params.id);
    const admin = await prisma.admin.findUnique({
      where: {
        id: req.id,
      },
    });

    //if password doesn't match
    const validPassword = await bcrypt.compare(
      req.body.password,
      admin.password
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Wrong Password. Try Again" });
    }

    //if old and new password are same
    if (req.body.password == req.body.newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new password cannot be same" });
    }

    //valid old password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const password = await bcrypt.hash(req.body.newPassword, salt);
    await prisma.admin.update({
      where: {
        id: req.id,
      },
      data: {
        password: password,
      },
    });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
};

export const pendingWorkshopsPayments = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        workshopPayments: {
          some: {
            status: "PENDING",
          },
        },
      },
      select: {
        abacusId: true,
        name: true,
        email: true,
        mobile: true,
        workshopPayments: {
          select: {
            workshopId: true,
            paymentMobile: true,
            screenshot: true,
            transactionId: true,
          },
          where: {
            status: "PENDING",
          },
        },
      },
    });
    const workshopsData = JSON.parse(
      fs.readFileSync("workshops.json", "utf-8")
    );
    const pendingPayments = pendingUsers.flatMap((user) => {
      return user.workshopPayments.map((workshops) => {
        return {
          abacusId: user.abacusId,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          workshopId: workshops.workshopId,
          workshopName: workshopsData[workshops.workshopId.toString()],
          transactionId: workshops.transactionId,
          paymentMobile: workshops.paymentMobile,
          screenshot: workshops.screenshot,
        };
      });
    });

    return res.status(200).json({
      message: "Pending Payment List fetched successfully",
      data: pendingPayments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
};

export const workshopUnpaid = async (req, res) => {
  try {
    const usersWithoutPayments = await prisma.user.findMany({
      where: {
        NOT: {
          workshopPayments: {
            some: {
              workshopId: req.body.workshopId,
              status: {
                in: ["SUCCESS", "PENDING"],
              },
            },
          },
        },
      },
      select: {
        id: true,
        abacusId: true,
        name: true,
        email: true,
        mobile: true,
      },
    });
    return res.status(200).json({
      message: "Users unpaid for the workshop",
      data: usersWithoutPayments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
};
export const workshopCashPayment = async (req, res) => {
  try {
    const workshopPaymentEntry = await prisma.workshopPayment.create({
      data: {
        userId: req.body.userId,
        workshopId: req.body.workshopId,
        paymentMobile: "CASH",
        screenshot: "CASH - " + Date.now(),
        status: "SUCCESS",
        verifiedBy: req.id,
        transactionId: "CASH - " + Date.now(),
      },
    });

    const workshopEntry = await prisma.workshop.create({
      data: {
        userId: req.body.userId,
        workshopId: req.body.workshopId,
      },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync("workshops.json", "utf-8")
    );
    const subject = "Reach'24 Workshop Cash Payment done successfully";
    const text =
      "You have successfully registered for " +
      workshopsData[req.body.workshopId.toString()] +
      " workshop\n\n Thank you\n\n";

    const userEmail = (
      await prisma.user.findUnique({ where: { id: req.body.userId } })
    ).email;
    await sendEmail(userEmail, subject, text);

    res.status(200).json({
      message: "Cash Payment done successful and workshop registered",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

export const workshopPaymentSuccess = async (req, res) => {
  try {
    const updateWorkshop = await prisma.workshopPayment.update({
      where: {
        transactionId: req.body.transactionId,
        status: "PENDING",
      },
      data: {
        status: "SUCCESS",
        verifiedBy: req.id,
      },
    });
    fs.unlink(
      path.join(__dirname, "../images/" + updateWorkshop.screenshot),
      (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      }
    );
    const workshopEntry = await prisma.workshop.create({
      data: {
        userId: updateWorkshop.userId,
        workshopId: updateWorkshop.workshopId,
      },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync("workshops.json", "utf-8")
    );
    const subject = "Reach'24 Workshop Payment done successfully";
    const text =
      "You have successfully registered for " +
      workshopsData[updateWorkshop.workshopId.toString()] +
      " workshop\n\n Thank you\n\n";

    const userEmail = (
      await prisma.user.findUnique({ where: { id: updateWorkshop.userId } })
    ).email;
    await sendEmail(userEmail, subject, text);

    res
      .status(200)
      .json({ message: "Payment done successful and workshop registered" });
  } catch (error) {
    if (error.code === "P2025")
      res.status(404).json({ message: "Invalid Transaction ID" });
    else res.status(500).json({ message: error.message, error });
  }
};

export const workshopPaymentFailure = async (req, res) => {
  try {
    const updateWorkshop = await prisma.workshopPayment.update({
      where: {
        transactionId: req.body.transactionId,
        status: "PENDING",
      },
      data: {
        status: "FAILURE",
        verifiedBy: req.id,
      },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync("workshops.json", "utf-8")
    );
    const subject = "Reach'24 Workshop Payment failed";
    const text =
      "Your payment for " +
      workshopsData[updateWorkshop.workshopId.toString()] +
      " workshop is failed.\n\n Thank you\n\n";

    const userEmail = (
      await prisma.user.findUnique({ where: { id: updateWorkshop.userId } })
    ).email;
    await sendEmail(userEmail, subject, text);

    res.status(200).json({ message: "Payment Failed" });
  } catch (error) {
    if (error.code === "P2025")
      res.status(404).json({ message: "Invalid Transaction ID" });
    else res.status(500).json({ message: error.message, error });
  }
};

export const workshopRegistrationList = async (req, res) => {
  try {
    const registrationList = await prisma.user.findMany({
      where: {
        workshops: {
          some: {
            workshopId: req.body.workshopId,
          },
        },
      },
      select: {
        abacusId: true,
        name: true,
        college: true,
        email: true,
        mobile: true,
        dept: true,
        year: true,
      },
    });
    res.status(200).json({
      message: "Workshop Registration List fetched successfully",
      data: registrationList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

export const workshopPaymentList = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        workshopPayments: {
          some: {
            workshopId: req.body.workshopId,
          },
        },
      },
      select: {
        abacusId: true,
        name: true,
        email: true,
        mobile: true,
        workshopPayments: {
          select: {
            workshopId: true,
            paymentMobile: true,
            screenshot: true,
            transactionId: true,
            status: true,
            admin: {
              select: {
                name: true,
              },
            },
          },
          where: {
            workshopId: req.body.workshopId,
          },
        },
      },
    });
    const workshopsData = JSON.parse(
      fs.readFileSync("workshops.json", "utf-8")
    );
    const paymentList = users.flatMap((user) => {
      return user.workshopPayments.map((workshops) => {
        return {
          abacusId: user.abacusId,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          workshopId: workshops.workshopId,
          workshopName: workshopsData[workshops.workshopId.toString()],
          transactionId: workshops.transactionId,
          paymentMobile: workshops.paymentMobile,
          screenshot: workshops.screenshot,
          admin: workshops.admin?.name,
          status: workshops.status,
        };
      });
    });
    res.status(200).json({
      message: "Workshop Payment List fetched successfully",
      data: paymentList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

export const fetchQueries = async (req, res) => {
  try {
    const queries = await prisma.queries.findMany({
      where: {
        replied: false,
      },
    });
    res
      .status(200)
      .json({ message: "Queries fetched successfully", data: queries });
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

export const setQueryReplied = async (req, res) => {
  console.log(req.body.id);
  try {
    await prisma.queries.update({
      where: {
        id: req.body.id,
      },
      data: {
        replied: true,
      },
    });
    const query = await prisma.queries.findUnique({
      where: { id: req.body.id }
    });
    console.log('Query:', query);
    
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

// Register a new user
export const Register = async (req, res) => {
  try {
    // Extract user details from request body
    const { email, name, mobile, year, dept, college, hostCollege, password } =
      req.body;

    // Validate required fields
    if (
      !email ||
      !name ||
      !mobile ||
      !year ||
      !dept ||
      !college ||
      !hostCollege ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format",
      });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User already registered with this email",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT)); // SALT = 10 (from your .env)
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        mobile,
        year: parseInt(year),
        dept,
        college,
        hostCollege,
        password: hashedPassword,
      },
    });

    // Generate a JWT for the new user
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWTPRIVATEKEY, // Your JWT secret key
      { expiresIn: "1d" } // Token valid for 1 day
    );

    // Send success response
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        abacusId: newUser.id, // Replace with your ID field
        token, // Optional: Admin may not need this token
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
