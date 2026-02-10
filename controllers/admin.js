import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import sendEmail, { sendEmailWithLink } from "../utils/emailService.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

dotenv.config();
const generateReferralCode = async () => {
  const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let code;
  let exists = true;

  while (exists) {
    code = "";
    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * 26);
      code += upperCaseChars.charAt(index);
    }

    const existing = await prisma.CampusAmbassador.findFirst({
      where: { referralCode: code },
    });

    if (!existing) {
      exists = false;
    }
  }

  return code;
};

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
      admin.password,
    );
    console.log("Received Password:", req.body.password);
    console.log("Stored Password Hash:", admin.password);
    console.log("Password Valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Password. Try Again" });
    }
    const token = jwt.sign(
      { id: admin.id, role: "ADMIN" },
      process.env.JWTPRIVATEKEY,
    );
    console.log("Generated Token:", token); // Log the token

    return res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
};
export const registerCa = async (req, res) => {
  try {
    console.log(req.body.email);
    req.body.email = req.body.email.toLowerCase();
    const existingUser = await prisma.CampusAmbassador.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (existingUser) {
      res
        .status(409)
        .json({ message: "Student ambassador already registered" });
      return;
    }
    const rfcode = await generateReferralCode();
    //Register User
    const campusAmbassador = await prisma.CampusAmbassador.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        college: req.body.college,
        referralCode: rfcode,
      },
    });
    console.log(campusAmbassador);

    const subject = "Registration for Student Ambassador Successfull";
    const text =
      "<p>You have successfully completed the registration for being the <strong>Student Ambassador of ABACUS'26.</strong>\n\n Your referral code is <strong>" +
      `${rfcode}` +
      "</strong>\n\n</p>" +
      "<p><strong>Spread the word:</strong>  Share your unique referral code with your network.</p>" +
      "<p><strong>Win big: </strong>Top performers earn amazing prizes, goodies, and exclusive access to a FREE tech-boosting workshop at our symposium!</p>" +
      "<h2>Earn points:</h2><ul><li>2 points: User registrations</li><li>3 points: General event registrations</li><li>5 points: Paid event registrations</li><li>20 points: Workshop registrations</li></ul>" +
      "<p><strong>Note:</strong> Encourage users to enter your code during registration for you to receive points. Registrations are now open at <a href='https://www.abacus.org.in'>https://www.abacus.org.in</a>. They can also update their profile later if they miss it initially.</p>" +
      "<p>Let's make this a success together!</p>" +
      "Join the WhatsApp Group for more Updates: <a href='https://chat.whatsapp.com/IbNwD25NwUyBXznNaLZ1s0'>https://chat.whatsapp.com/IbNwD25NwUyBXznNaLZ1s0</a>";
    await sendEmail(campusAmbassador.email, subject, text);
    return res
      .status(200)
      .json({ message: "Student Ambassador Registered Successfully!" });
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
    console.log(existingAdmin);
    const admin = await prisma.admin.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: password,
      },
    });
    console.log(admin);
    const subject = "Admin added successfully";
    const text =
      "You have been granted administrative access to Abacus'26\\n\n Thank you\n\n";

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
      admin.password,
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
    const payments = await prisma.workshopPayment.findMany({
      where: {
        status: {
          in: ["PENDING"],
        },
      },
      select: {
        id: true,
        workshopId: true,
        paymentMobile: true,
        screenshot: true,
        transactionId: true,
        users: {
          select: {
            abacusId: true,
            name: true,
            email: true,
            mobile: true,
            //hostCollege: true
          },
        },
      },
    });
    const workshopsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
    );
    // const workshopsData = JSON.parse(
    //   fs.readFileSync("workshops.json", "utf-8")
    // );
    const pendingPayments = payments.map((payment) => {
      return {
        id: payment.id,
        users: payment.users,
        workshopId: payment.workshopId,
        workshopName: workshopsData[payment.workshopId.toString()],
        transactionId: payment.transactionId,
        paymentMobile: payment.paymentMobile,
        screenshot: payment.screenshot,
      };
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
          WorkshopPayment: {
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
  console.log(req.body);
  try {
    const connectedUsers = req.body.users.map((user) => {
      return { id: user };
    });
    const workshopPaymentEntry = await prisma.workshopPayment.create({
      data: {
        workshopId: req.body.workshopId,
        paymentMobile: "CASH",
        screenshot: "CASH - " + Date.now(),
        status: "SUCCESS",
        verifiedBy: req.id,
        transactionId: "CASH - " + Date.now(),
        users: {
          connect: connectedUsers,
        },
      },
      include: {
        users: true,
      },
    });

    const workshopsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
    );

    // Check if this is a bulk payment (workshopId: 0)
    const isBulkPayment = req.body.workshopId === 0;

    // Process each user
    for (let i = 0; i < workshopPaymentEntry.users.length; i++) {
      const user = workshopPaymentEntry.users[i];
      const userId = user.id;
      const userEmail = user.email;
      const userReferralCode = user.referralCode;

      if (isBulkPayment) {
        // Register BOTH workshops for bulk payment
        await prisma.workshop.createMany({
          data: [
            { userId: userId, workshopId: 1 },
            { userId: userId, workshopId: 2 },
          ],
          skipDuplicates: true,
        });
      } else {
        // Register single workshop
        await prisma.workshop.create({
          data: {
            userId: userId,
            workshopId: req.body.workshopId,
          },
        });
      }

      // Track referral for student ambassador if user used a referral code
      if (userReferralCode) {
        const ambassador = await prisma.campusAmbassador.findUnique({
          where: { referralCode: userReferralCode },
        });

        if (ambassador) {
          // Increment workshop referral count (count as 1 even for bulk)
          const updatedAmbassador = await prisma.campusAmbassador.update({
            where: { id: ambassador.id },
            data: {
              workshopReferrals: { increment: 1 },
            },
          });

          // Check if ambassador just reached 5 workshop referrals
          // Only grant eligibility if they haven't claimed a free workshop before
          if (
            updatedAmbassador.workshopReferrals === 5 &&
            !updatedAmbassador.isEligible &&
            updatedAmbassador.workshopsClaimed === 0
          ) {
            // Set ambassador as eligible for free workshop
            await prisma.campusAmbassador.update({
              where: { id: ambassador.id },
              data: { isEligible: true },
            });

            // Send notification email to ambassador
            const ambassadorSubject =
              "Abacus'26 Campus Ambassador - Free Workshop Unlocked!";
            const ambassadorText = `Congratulations ${ambassador.name}! 🎉\n\nYou have successfully referred 5 users who registered for workshops. As a reward, you are now eligible to register for ONE workshop completely FREE!\n\nTo claim your free workshop:\n1. Go to the workshop registration page\n2. Select your preferred workshop\n3. Choose the "Claim Free Workshop" option\n\nNote: This benefit is valid for single workshop registration only, not for bulk registrations.\n\nThank you for being an amazing Campus Ambassador!\n\nTeam Abacus'26`;

            await sendEmail(
              ambassador.email,
              ambassadorSubject,
              ambassadorText,
            );
          }
        }
      }

      // Send confirmation email to user
      const subject = "Abacus'26 Workshop Cash Payment done successfully";
      let text;

      if (isBulkPayment) {
        text = `You have successfully registered for BOTH workshops:\n- ${workshopsData["1"]}\n- ${workshopsData["2"]}\n\nTotal paid: ₹500 (Cash)\n\nThank you!\n\n`;
      } else {
        text =
          "You have successfully registered for " +
          workshopsData[req.body.workshopId.toString()] +
          " workshop\n\n Thank you\n\n";
      }

      await sendEmail(userEmail, subject, text);
    }

    return res.status(200).json({
      message: "Cash Payment done successful and workshop registered",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
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
      include: {
        users: {
          include: {
            CampusAmbassador: true,
          },
        },
      },
    });
    fs.unlink(
      path.join(__dirname, "../images/" + updateWorkshop.screenshot),
      (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      },
    );

    const workshopsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
    );

    // Process each user in the payment
    for (let i = 0; i < updateWorkshop.users.length; i++) {
      const user = updateWorkshop.users[i];
      const userId = user.id;
      const userEmail = user.email;
      const userReferralCode = user.referralCode;

      // Check if this is a bulk payment (workshopId: 0)
      const isBulkPayment = updateWorkshop.workshopId === 0;

      if (isBulkPayment) {
        // Register BOTH workshops for bulk payment
        await prisma.workshop.createMany({
          data: [
            { userId: userId, workshopId: 1 },
            { userId: userId, workshopId: 2 },
          ],
          skipDuplicates: true,
        });
      } else {
        // Register single workshop
        await prisma.workshop.create({
          data: {
            userId: userId,
            workshopId: updateWorkshop.workshopId,
          },
        });
      }

      // Track referral for student ambassador if user used a referral code
      if (userReferralCode) {
        const ambassador = await prisma.campusAmbassador.findUnique({
          where: { referralCode: userReferralCode },
        });

        if (ambassador) {
          // Increment workshop referral count (count as 1 even for bulk)
          const updatedAmbassador = await prisma.campusAmbassador.update({
            where: { id: ambassador.id },
            data: {
              workshopReferrals: { increment: 1 },
            },
          });

          // Check if ambassador just reached 5 workshop referrals
          // Only grant eligibility if they haven't claimed a free workshop before
          if (
            updatedAmbassador.workshopReferrals === 5 &&
            !updatedAmbassador.isEligible &&
            updatedAmbassador.workshopsClaimed === 0
          ) {
            // Set ambassador as eligible for free workshop
            await prisma.campusAmbassador.update({
              where: { id: ambassador.id },
              data: { isEligible: true },
            });

            // Send notification email to ambassador
            const ambassadorSubject =
              "Abacus'26 Campus Ambassador - Free Workshop Unlocked!";
            const ambassadorText = `Congratulations ${ambassador.name}! 🎉\n\nYou have successfully referred 5 users who registered for workshops. As a reward, you are now eligible to register for ONE workshop completely FREE!\n\nTo claim your free workshop:\n1. Go to the workshop registration page\n2. Select your preferred workshop\n3. Choose the "Claim Free Workshop" option\n\nNote: This benefit is valid for single workshop registration only, not for bulk registrations.\n\nThank you for being an amazing Campus Ambassador!\n\nTeam Abacus'26`;

            await sendEmail(
              ambassador.email,
              ambassadorSubject,
              ambassadorText,
            );
          }
        }
      }

      // Send confirmation email to user
      const subject = "Abacus'26 Workshop Payment done successfully";
      let text;

      if (isBulkPayment) {
        text = `You have successfully registered for BOTH workshops:\n- ${workshopsData["1"]}\n- ${workshopsData["2"]}\n\nTotal paid: ₹500 (saved ₹100!)\n\nThank you!\n\n`;
      } else {
        text =
          "You have successfully registered for " +
          workshopsData[updateWorkshop.workshopId.toString()] +
          " workshop\n\n Thank you\n\n";
      }

      await sendEmail(userEmail, subject, text);
    }

    res
      .status(200)
      .json({ message: "Payment done successful and workshop registered" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Invalid Transaction ID" });
    else return res.status(500).json({ message: error.message, error });
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
      include: {
        users: true,
      },
    });
    const workshopsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
    );
    // const workshopsData = JSON.parse(
    //   fs.readFileSync("workshops.json", "utf-8")
    // );
    const subject = "Abacus'26 Workshop Payment failed";
    const text =
      "Your payment for " +
      workshopsData[updateWorkshop.workshopId.toString()] +
      " workshop is failed.\n\n Thank you\n\n";

    for (let i = 0; i < updateWorkshop.users.length; i++) {
      const userEmail = updateWorkshop.users[i].email;
      await sendEmail(userEmail, subject, text);
    }

    return res.status(200).json({ message: "Payment Failed" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Invalid Transaction ID" });
    else return res.status(500).json({ message: error.message, error });
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
        // workshops: true,
      },
    });
    console.log(registrationList);

    const users = await prisma.user.findMany({
      where: {
        WorkshopPayment: {
          some: {
            workshopId: req.body.workshopId,
          },
        },
      },
      select: {
        abacusId: true,
        name: true,
        email: true,
        college: true,
        mobile: true,
        dept: true,
        year: true,
        WorkshopPayment: {
          select: {
            workshopId: true,
            paymentMobile: true,
            screenshot: true,
            transactionId: true,
            status: true,
            Admin: {
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
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
    );
    // const workshopsData = JSON.parse(
    //   fs.readFileSync("workshops.json", "utf-8")
    // );
    const paymentList = users.flatMap((user) => {
      return user.WorkshopPayment.map((workshops) => {
        return {
          abacusId: user.abacusId,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          college: user.college,
          dept: user.dept,
          year: user.year,
          workshopId: workshops.workshopId,
          workshopName: workshopsData[workshops.workshopId.toString()],
          transactionId: workshops.transactionId,
          paymentMobile: workshops.paymentMobile,
          screenshot: workshops.screenshot,
          Admin: workshops.Admin?.name,
          status: workshops.status,
        };
      });
    });
    // paymentList.map((user)=>{
    //   console.log(user.workshopPayments);
    // })
    console.log(registrationList, paymentList);
    const final = [...registrationList, ...paymentList];
    //console.log(final);
    return res.status(200).json({
      message: "Workshop Registration List fetched successfully",
      data: final,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const workshopPaymentList = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        WorkshopPayment: {
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
        WorkshopPayment: {
          select: {
            workshopId: true,
            paymentMobile: true,
            screenshot: true,
            transactionId: true,
            status: true,
            Admin: {
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
      fs.readFileSync(path.join(__dirname, "..", "workshops.json"), "utf-8"),
    );
    // const workshopsData = JSON.parse(
    //   fs.readFileSync("workshops.json", "utf-8")
    // );
    const paymentList = users.flatMap((user) => {
      return user.WorkshopPayment.map((workshops) => {
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
          admin: workshops.Admin?.name,
          status: workshops.status,
        };
      });
    });
    console.log(paymentList);
    return res.status(200).json({
      message: "Workshop Payment List fetched successfully",
      data: paymentList,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
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
    return res.status(500).json({ message: error.message, error });
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
      where: { id: req.body.id },
    });
    console.log("Query:", query);

    return res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

// Register a new user
export const Register = async (req, res) => {
  try {
    // Extract user details from request body
    const { email, name, mobile, year, dept, college, password, referralCode } =
      req.body;

    // Validate required fields
    if (!email || !name || !mobile || !year || !dept || !college || !password) {
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
        password: hashedPassword,
        referralCode: referralCode || null,
      },
    });

    // Generate a JWT for the new user
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWTPRIVATEKEY, // Your JWT secret key
      { expiresIn: "1d" }, // Token valid for 1 day
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

export const eventRegistrationList = async (req, res) => {
  try {
    const registrationList = await prisma.user.findMany({
      where: {
        events: {
          some: {
            eventId: req.body.eventId,
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
        // workshops: true,
      },
    });
    console.log(registrationList);
    return res.status(200).json({
      message: "Workshop Registration List fetched successfully",
      data: registrationList,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const eventsUnregistered = async (req, res) => {
  try {
    const registrationList = await prisma.user.findMany({
      where: {
        events: {
          none: {
            eventId: req.body.eventId,
          },
        },
      },
      select: {
        id: true,
        abacusId: true,
        name: true,
        college: true,
        email: true,
        mobile: true,
        dept: true,
        year: true,
        referralCode: true,
      },
    });
    return res.status(200).json({
      message: "Users haven't registered fetched successfully",
      registrationList,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const registerEvent = async (req, res) => {
  try {
    const eventEntry = await prisma.event.create({
      data: {
        userId: req.body.userId,
        eventId: req.body.eventId,
      },
    });

    return res.status(200).json({
      message: "Event registered successfully",
      eventEntry,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const pendingEventsPayments = async (req, res) => {
  try {
    const payments = await prisma.eventPayment.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        eventId: true,
        paymentMobile: true,
        screenshot: true,
        transactionId: true,
        users: {
          select: {
            abacusId: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    });
    const eventsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8"),
    );
    const pendingPayments = payments.map((payment) => {
      return {
        id: payment.id,
        users: payment.users,
        eventId: payment.eventId,
        eventName: eventsData[payment.eventId.toString()],
        transactionId: payment.transactionId,
        paymentMobile: payment.paymentMobile,
        screenshot: payment.screenshot,
      };
    });
    return res.status(200).json({
      message: "Pending Payment List fetched successfully",
      pendingPayments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const eventUnpaid = async (req, res) => {
  try {
    const usersWithoutPayments = await prisma.user.findMany({
      where: {
        eventPayments: {
          none: {
            eventId: req.body.EventId,
            status: {
              in: ["SUCCESS", "PENDING"],
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
      message: "Users unpaid for the event",
      usersWithoutPayments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const eventCashPayment = async (req, res) => {
  try {
    const connectedUsers = req.body.users.map((user) => {
      return { id: user };
    });

    const eventPaymentEntry = await prisma.eventPayment.create({
      data: {
        eventId: req.body.EventId,
        paymentMobile: "CASH",
        screenshot: "CASH - " + Date.now(),
        status: "SUCCESS",
        verifiedBy: req.id,
        transactionId: "CASH - " + Date.now(),
        users: {
          connect: connectedUsers,
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });
    const eventsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8"),
    );
    const subject = "Abacus'26 Event Cash Payment done successfully";
    const text =
      "You have successfully registered for the " +
      eventsData[req.body.EventId.toString()] +
      " event\n\n Thank you\n\n";

    // Track event referrals and register events
    for (let i = 0; i < eventPaymentEntry.users.length; i++) {
      const user = eventPaymentEntry.users[i];
      const userEmail = user.email;
      const userReferralCode = user.referralCode;

      // Register the event
      await prisma.event.create({
        data: {
          userId: user.id,
          eventId: req.body.EventId,
        },
      });

      // Track referral for student ambassador
      if (userReferralCode) {
        const ambassador = await prisma.campusAmbassador.findUnique({
          where: { referralCode: userReferralCode },
        });

        if (ambassador) {
          // Increment event referral count
          const updatedAmbassador = await prisma.campusAmbassador.update({
            where: { id: ambassador.id },
            data: {
              eventReferrals: { increment: 1 },
            },
          });

          // Check if ambassador JUST reached exactly 25 event referrals
          // This === 25 check ensures certificate email is sent ONLY ONCE
          // (at exactly 25, not at 26, 27, etc.)
          if (updatedAmbassador.eventReferrals === 25) {
            // Send certificate notification email to ambassador
            const ambassadorSubject =
              "🎉 25 Event Registrations - Certificate Earned!";
            const ambassadorText = `Hi ${ambassador.name},

🎯 25 users have registered for events using your referral code!

You are now eligible for a Selection Certificate endorsed by CSEA, CEG – Anna University, which will be provided on the day of Abacus.

Thank you for being an amazing Student Ambassador!

For any queries:
Kamalesh: +91 8610386055

Team Abacus'26`;

            await sendEmail(
              ambassador.email,
              ambassadorSubject,
              ambassadorText,
            );
          }
        }
      }

      // Send confirmation email to user
      await sendEmail(userEmail, subject, text);
    }

    return res.status(200).json({
      message: "Cash Payment done successful and event registered",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message, error });
  }
};
export const eventPaymentSuccess = async (req, res) => {
  console.log(req.body);
  try {
    const updateEvent = await prisma.eventPayment.update({
      where: {
        transactionId: req.body.transactionId,
        status: "PENDING",
      },
      data: {
        status: "SUCCESS",
        verifiedBy: req.id,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });
    console.log(updateEvent);
    fs.unlink(
      path.join(__dirname, "../images/" + updateEvent.screenshot),
      (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      },
    );

    const eventsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8"),
    );
    let subject = "Abacus'26 Event Payment done successfully";
    let text =
      "You have successfully registered for the " +
      eventsData[updateEvent.eventId.toString()] +
      " event\n\n Thank you\n\n";

    // Track event referrals and register events
    for (let i = 0; i < updateEvent.users.length; i++) {
      const user = updateEvent.users[i];
      const userEmail = user.email;
      const userReferralCode = user.referralCode;

      // Register the event
      await prisma.event.create({
        data: {
          userId: user.id,
          eventId: updateEvent.eventId,
        },
      });

      // Track referral for student ambassador
      if (userReferralCode) {
        const ambassador = await prisma.campusAmbassador.findUnique({
          where: { referralCode: userReferralCode },
        });

        if (ambassador) {
          // Increment event referral count
          const updatedAmbassador = await prisma.campusAmbassador.update({
            where: { id: ambassador.id },
            data: {
              eventReferrals: { increment: 1 },
            },
          });

          // Check if ambassador JUST reached exactly 25 event referrals
          // This === 25 check ensures certificate email is sent ONLY ONCE
          // (at exactly 25, not at 26, 27, etc.)
          if (updatedAmbassador.eventReferrals === 25) {
            // Send certificate notification email to ambassador
            const ambassadorSubject =
              "🎉 25 Event Registrations - Certificate Earned!";
            const ambassadorText = `Hi ${ambassador.name},

🎯 25 users have registered for events using your referral code!

You are now eligible for a Selection Certificate endorsed by CSEA, CEG – Anna University, which will be provided on the day of Abacus.

Thank you for being an amazing Student Ambassador!

For any queries:
Kamalesh: +91 8610386055

Team Abacus'26`;

            await sendEmail(
              ambassador.email,
              ambassadorSubject,
              ambassadorText,
            );
          }
        }
      }

      // Send confirmation email to user
      await sendEmail(userEmail, subject, text);
    }
    return res.status(200).json({
      message: "Payment done successful and event registered",
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025")
      return res.status(404).json({ message: "Invalid Transaction ID" });
    else res.status(500).json({ message: error.message, error });
  }
};
export const eventPaymentFailure = async (req, res) => {
  try {
    const updateEvent = await prisma.eventPayment.update({
      where: {
        id: req.body.id,
        status: "PENDING",
      },
      data: {
        status: "FAILURE",
        verifiedBy: req.id,
      },
      include: {
        users: true,
      },
    });
    const eventsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8"),
    );
    const subject = "Abacus'26 Event Payment failed";
    const text =
      "Your payment for the " +
      eventsData[updateEvent.eventId.toString()] +
      " event is failed.\n\n Thank you\n\n";

    for (let i = 0; i < updateEvent.users.length; i++) {
      const userEmail = updateEvent.users[i].email;
      await sendEmail(userEmail, subject, text);
    }

    return res.status(200).json({
      message: "User fetched successfully",
    });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Invalid Transaction ID" });
    else return res.status(500).json({ message: error.message, error });
  }
};
export const fetchUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        abacusId: req.body.abacusId,
      },
      select: {
        abacusId: true,
        name: true,
        college: true,
        email: true,
        mobile: true,
        dept: true,
        year: true,
        referralCode: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const getMyReferralCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email missing" });
    }

    const ca = await prisma.campusAmbassador.findUnique({
      where: { email },
      select: { referralCode: true },
    });

    if (!ca) {
      return res.status(200).json({ hasCode: false });
    }

    return res.status(200).json({
      hasCode: true,
      referralCode: ca.referralCode,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const getAmbassadorStats = async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: "referralCode required" });
    }

    const ambassador = await prisma.campusAmbassador.findUnique({
      where: { referralCode },
      select: {
        name: true,
        email: true,
        college: true,
        referralCode: true,
        isEligible: true,
        workshopsClaimed: true,
        workshopReferrals: true,
        eventReferrals: true,
        users: {
          select: {
            name: true,
            email: true,
            events: true,
            WorkshopPayment: {
              where: { status: "SUCCESS" },
            },
          },
        },
      },
    });

    if (!ambassador) {
      return res.status(404).json({ message: "Ambassador not found" });
    }

    let usersCount = 0;
    let freeEvents = 0;
    let workshops = 0;

    const userDetails = ambassador.users.map((user) => {
      usersCount += 1;
      freeEvents += user.events.length;
      workshops += user.WorkshopPayment.length;

      return {
        name: user.name,
        email: user.email,
        freeEvents: user.events.length,
        workshops: user.WorkshopPayment.length,
      };
    });

    return res.status(200).json({
      ambassador: {
        name: ambassador.name,
        email: ambassador.email,
        college: ambassador.college,
        referralCode: ambassador.referralCode,
        isEligible: ambassador.isEligible,
        workshopsClaimed: ambassador.workshopsClaimed,
        workshopReferrals: ambassador.workshopReferrals,
        eventReferrals: ambassador.eventReferrals,
      },
      stats: {
        users: usersCount,
        freeEvents,
        workshops,
        totalActivity: freeEvents + workshops,
      },
      referredUsers: userDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const checkCA20Events = async (req, res) => {
  try {
    // Use authenticated user's ID from token for security
    const userId = req.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user?.referralCode) {
      console.log("User has no referral code. Skipping CA check.");
      return res.json({ ok: true });
    }

    const ambassador = await prisma.campusAmbassador.findUnique({
      where: { referralCode: user.referralCode },
    });

    if (!ambassador) {
      console.log("No CA found for referral code:", user.referralCode);
      return res.json({ ok: true });
    }

    const distinctUsersCount = await prisma.user.count({
      where: {
        referralCode: user.referralCode,
        events: { some: {} },
      },
    });

    console.log(
      `Distinct users count for CA ${ambassador.name}:`,
      distinctUsersCount,
    );

    if (distinctUsersCount === 25) {
      console.log("Sending email to CA:", ambassador.email);

      await sendEmail(
        ambassador.email,
        "🎉 25 Distinct Registrations!",
        `Hi ${ambassador.name},

🎯 25 UNIQUE users have registered using your referral code!

You are now eligible for a certificate, which will be provided on the day of Abacus.

For any queries:
Kamalesh : +91 8610386055`,
      );

      console.log("Email sent successfully to CA:", ambassador.email);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in checkCA20Events:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

export const checkCAWorkshop = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user?.referralCode) {
      console.log("User has no referral code. Skipping CA workshop check.");
      return res.json({ ok: true });
    }

    const ambassador = await prisma.campusAmbassador.findUnique({
      where: { referralCode: user.referralCode },
    });

    if (!ambassador) {
      console.log("No CA found for referral code:", user.referralCode);
      return res.json({ ok: true });
    }

    const distinctUsersCount = await prisma.user.count({
      where: {
        referralCode: user.referralCode,
        workshops: { some: {} },
      },
    });

    console.log(
      `Distinct workshop users count for CA ${ambassador.name}:`,
      distinctUsersCount,
    );

    if (distinctUsersCount === 5) {
      console.log("Sending workshop email to CA:", ambassador.email);

      await sendEmail(
        ambassador.email,
        "🎉 5 Users Registered for Workshops!",
        `Hi ${ambassador.name},

🎯 5 UNIQUE users have registered for workshops using your referral code!

You are now eligible to register for **any one workshop for free**.

Please contact us if you have any questions.

For any queries:
Kamalesh : +91 8610386055`,
      );

      console.log("Workshop email sent successfully to CA:", ambassador.email);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in checkCAWorkshop:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.body.referralCode !== "") {
      const validReferralCode = await prisma.campusAmbassador.findUnique({
        where: {
          referralCode: req.body.referralCode,
        },
      });
      if (!validReferralCode) {
        return res.status(409).json({ message: "Invalid referral code" });
      }
    }
    const user = await prisma.user.update({
      where: {
        abacusId: req.body.abacusId,
      },
      data: {
        name: req.body.name,
        mobile: req.body.mobile,
        year: req.body.year,
        dept: req.body.dept,
        college: req.body.college,
        referralCode:
          req.body.referralCode !== "" ? req.body.referralCode : null,
      },
    });
    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const referralCodeDetails = async (req, res) => {
  try {
    var result = [];
    const ambassadors = await prisma.campusAmbassador.findMany({
      select: {
        name: true,
        email: true,
        college: true,
        users: {
          select: {
            events: true,
            eventPayments: {
              where: {
                status: {
                  in: ["SUCCESS"],
                },
                eventId: {
                  not: 20,
                },
              },
            },
            workshopPayments: {
              where: {
                status: {
                  in: ["SUCCESS"],
                },
              },
            },
          },
        },
        referralCode: true,
      },
    });
    for (const ambassador of ambassadors) {
      let events = 0;
      let workshops = 0;
      let users = 0;
      let paidEvents = 0;
      for (const user of ambassador.users) {
        users += 10;
        events += user.events.length * 3;
        paidEvents += user.eventPayments.length * 15;
        workshops += user.workshopPayments.length * 100;
      }
      result.push({
        name: ambassador.name,
        email: ambassador.email,
        college: ambassador.college,
        referralCode: ambassador.referralCode,
        users: users,
        freeEvents: events,
        paidEvents: paidEvents,
        workshops: workshops,
        total: users + events + paidEvents + workshops,
      });
    }
    result.sort(function (a, b) {
      return b.total - a.total;
    });

    return res.status(200).json({
      message: "Mail sent successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const fetchAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        abacusId: true,
        name: true,
        college: true,
        email: true,
        mobile: true,
        dept: true,
        year: true,
        referralCode: true,
      },
    });
    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};

export const registerCaFromUser = async (req, res) => {
  try {
    const { abacusId } = req.body;

    const user = await prisma.user.findUnique({
      where: { abacusId },
      select: {
        name: true,
        email: true,
        college: true,
        referralCode: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingCA = await prisma.campusAmbassador.findUnique({
      where: { email: user.email },
    });
    if (existingCA) {
      return res.status(409).json({ message: "Already a Student Ambassador" });
    }

    const referralCode = await generateReferralCode();

    const campusAmbassador = await prisma.campusAmbassador.create({
      data: {
        name: user.name,
        email: user.email,
        college: user.college,
        referralCode,
      },
    });
    return res.status(200).json({
      message: "Student Ambassador registered successfully",
      campusAmbassador,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const sendOlpcLink = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        events: {
          some: {
            eventId: 5401,
          },
        },
      },
    });
    for (let i = 0; i < users.length; i++) {
      const subject = "Abacus'26 OLPC Registration Successfull";
      const text =
        "Thank you for registering for OLPC - Online Programming Contest - Abacus'26. We're excited to have you join the competition.\n\n Put your coding skills to the test and compete for amazing prizes!  Click the button below to access the contest.\n\n We wish you all the very best for the contest. Kindly ensure that you register for the contest on GeeksForGeeks with this same email.\n\n";
      const link =
        "https://practice.geeksforgeeks.org/contest/online-programming-contest-abacus24-ceg-anna-university";
      await sendEmailWithLink(users[i].email, subject, text, link);
    }

    return res.status(200).json({
      message: "Mail sent successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
export const eventPaymentList = async (req, res) => {
  try {
    const payments = await prisma.eventPayment.findMany({
      where: {
        eventId: req.body.EventId,
      },
      select: {
        id: true,
        eventId: true,
        paymentMobile: true,
        screenshot: true,
        transactionId: true,
        status: true,
        admin: {
          select: {
            name: true,
          },
        },
        users: {
          select: {
            abacusId: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    });
    const eventsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "events.json"), "utf-8"),
    );
    let paymentList = [];
    for (let i = 0; i < payments.length; i++) {
      for (let j = 0; j < payments[i].users.length; j++) {
        paymentList.push({
          paymentId: payments[i].id,
          name: payments[i].users[j].name,
          email: payments[i].users[j].email,
          mobile: payments[i].users[j].mobile,
          abacusId: payments[i].users[j].abacusId,
          workshopId: payments[i].workshopId,
          eventName: eventsData[payments[i].eventId.toString()],
          transactionId: payments[i].transactionId,
          paymentMobile: payments[i].paymentMobile,
          screenshot: payments[i].screenshot,
          admin: payments[i].admin?.name,
          status: payments[i].status,
        });
      }
    }

    return res.status(200).json({
      message: "Event Payment List fetched successfully",
      paymentList,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error });
  }
};
