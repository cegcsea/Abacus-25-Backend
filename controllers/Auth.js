import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import sendEmail from "../utils/sendEmail.js";
const prisma = new PrismaClient();

export const Register = async (req, res) => {
  try {
    req.params.email = req.params.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (user) {
      return res.status(409).json({
        status: "error",
        error: "conflict",
        message: "User already registered",
      });
    } else if (req.body.referralCode !== "") {
      const validReferralCode = await prisma.campusAmbassador.findUnique({
        where: {
          referralCode: req.body.referralCode,
        },
      });
      if (!validReferralCode) {
        return res.status(409).json({
          status: "error",
          error: "conflict",
          message: "Invalid referral code",
        });
      }
    } else {
      const token = await prisma.registrationToken.findUnique({
        where: {
          email: req.body.email,
          token: req.body.token,
        },
      });
      const expiration = new Date();
      expiration.setMinutes(expiration.getMinutes() - 10);
      if (!token) {
        return req.status(410).json({
          status: "error",
          error: "Not found",
          message: "Invalid link or link expired",
        });
      } else if (token.createdAt < expiration) {
        await prisma.registrationToken.delete({
          where: {
            email: req.params.email,
          },
        });
        return res.status(410).json({
          status: "error",
          error: "Not found",
          message: "link expired",
        });
      } else {
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const password = await bcrypt.hash(req.body.password, salt);
        const user = await prisma.user.create({
          data: {
            name: req.body.name,
            email: req.params.email,
            mobile: req.body.mobile,
            // hostCollege: req.body.hostCollege,
            year: req.body.year,
            dept: req.body.dept,
            college: req.body.college,
            password: password,
            referralCode: req.body?.referralCode || null,
            accomodation: req.body.accomodation,
          },
        });
        await prisma.registrationToken.delete({
          where: {
            email: req.params.email,
          },
        });
        const subject = "Abacus'25: Registration Successfull!";
        const text =
          "You have successfully completed Abacus'25 registration.\n\n Your Abacus ID is " +
          `${user.abacusId}` +
          "\n\n";
        // await sendEmailWithAttachment(subject, text, user, imageBuffer)
        await sendEmail(user.email, subject, text);
        const token = jwt.sign({ id: user.id }, process.env.JWTPRIVATEKEY);
        return res.status(200).json({
          status: "success",
          message: "User Registered Successfully!",
          token: token,
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      error: "something went wrong." + { error },
      message: "Internal Server error",
    });
  }
};

export const Login = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
      select: {
        id: true,
        email: true,
        abacusId: true,
        name: true,
        mobile: true,
        password: true,
        year: true,
        dept: true,
        college: true,
        accomodation: true,
        //hostCollege: true,
        eventPayments: true,
        WorkshopPayment: true,
        workshops: true,
        events: true,
        referralCode: true,
        accDetails: true,
      },
    });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: "Not found",
        message: "User not Found",
      });
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({
        status: "error",
        error: "Unauthorized",
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWTPRIVATEKEY);

    return res.status(200).json({
      status: "ok",
      message: "Login successful",
      token: token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: "Something went wrong" + error,
      message: "Internal Server Error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    // Check if user exists or not
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: "Not Found",
        message: "User not Found",
      });
    }

    // Check if token exists
    const token = await prisma.forgotPasswordToken.findUnique({
      where: {
        userId: user.id,
      },
    });

    let secretKey;

    // Token expiration time
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() - 10);

    if (token && expiration < token.createdAt) {
      // If token exists and not expired, then send mail again with same token
      secretKey = token.token;
    } else {
      // If token exists but expired or doesn't exist, delete token and create new one
      if (token) {
        await prisma.forgotPasswordToken.delete({
          where: {
            userId: user.id,
          },
        });
      }
      secretKey = crypto.randomBytes(32).toString("hex");
      await prisma.forgotPasswordToken.create({
        data: {
          userId: user.id,
          token: secretKey,
        },
      });
    }
    const link = `${process.env.BASE_URL}/reset-password/${user.id}/${secretKey}`;
    await sendEmail(
      req.body.email,
      "Reset Password Link",
      "Click the link below to reset password for your Abacus'25 account\n" +
        link
    );
    return res.status(200).json({
      status: "OK",
      message: "Reset Password link sent successfully!",
      data: { link: link },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}:${error}`,
      message: "Internal server error",
    });
  }
};

export const forgotPasswordReset = async (req, res) => {
  try {
    if (req.body.confirmPassword !== req.body.newPassword) {
      return res.status(410).json({
        status: "error",
        error: "Gone",
        message: "Password and confirm password don't match",
      });
    }

    // Verify token
    const token = await prisma.forgotPasswordToken.findUnique({
      where: {
        userId: parseInt(req.params.userId),
        token: req.params.token,
      },
    });

    // Expiration time
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() - 10);

    // If token not exists
    if (!token) {
      return res.status(410).json({
        status: "error",
        error: "Gone",
        message: "Invalid Link or Link Expired",
      });
    }

    // If token exists but expired
    if (expiration > token.createdAt) {
      await prisma.forgotPasswordToken.delete({
        where: {
          userId: parseInt(req.params.userId),
        },
      });
      return res.status(410).json({
        status: "error",
        error: "Gone",
        message: "Reset-link expired",
      });
    } else {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const password = await bcrypt.hash(req.body.newPassword, salt);

      await prisma.user.update({
        where: { id: parseInt(req.params.userId) },
        data: { password: password },
      });

      // Delete token
      await prisma.forgotPasswordToken.delete({
        where: {
          userId: parseInt(req.params.userId),
        },
      });

      return res.status(200).json({
        status: "OK",
        message: "Password reseted successfully",
        data: {},
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}:${error}`,
      message: "Internal server error",
    });
  }
};
export const postQuery = async (req, res) => {
  try {
    const query = await prisma.queries.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        title: req.body.title,
        message: req.body.message,
      },
    });
    return res.status(200).json({
      status: "OK",
      message: "Query submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error.message,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.body.referralCode && req.body.referralCode !== null) {
      console.log("enters not null", req.body.referralCode);
      const validReferralCode = await prisma.campusAmbassador.findUnique({
        where: {
          referralCode: req.body.referralCode,
        },
      });
      if (!validReferralCode) {
        return res.status(409).json({
          status: "error",
          error: "conflict",
          message: "Invalid referral code",
        });
      }
    }
    console.log(req.id);
    const updatedUser = await prisma.user.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.body.name,
        mobile: req.body.mobile,
        year: req.body.year,
        dept: req.body.dept,
        college: req.body.college,
        accomodation: req.body.accomodation || false,
      },
    });
    return res.status(200).json({
      status: "OK",
      message: "Profile updated successfully",
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      error: error.message,
      message: "Internal server error",
    });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
      select: {
        id: true,
        email: true,
        abacusId: true,
        name: true,
        mobile: true,
        year: true,
        dept: true,
        college: true,
        //hostCollege: true,
        WorkshopPayment: true,
        accomodation: true,
        eventPayments: true,
        workshops: true,
        events: true,
        referralCode: true,
        accDetails: true,
      },
    });
    return res.status(200).json({
      status: "OK",
      message: "Profile: ",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error.message,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  console.log(req);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
    });

    // If password doesn't match
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({
        status: "error",
        error: "Unauthorized",
        message: "Wrong Password. Try Again",
      });
    }

    // If old and new password are the same
    if (req.body.password === req.body.newPassword) {
      return res.status(400).json({
        status: "error",
        error: "Bad Request",
        message: "Old and new password cannot be the same",
      });
    }

    // Valid old password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const password = await bcrypt.hash(req.body.newPassword, salt);
    await prisma.user.update({
      where: {
        id: req.id,
      },
      data: {
        password: password,
      },
    });
    return res.status(200).json({
      status: "OK",
      message: "Password changed successfully",
      data: {},
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error.message,
      message: "Internal server error",
    });
  }
};
export const getRegistrationLink = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    console.log(user);
    if (user) {
      res.status(409).json({
        status: "error",
        error: "Conflict",
        message: "User already registered",
      });
      return;
    }
    let token = await prisma.registrationToken.findUnique({
      where: {
        email: req.body.email,
      },
    });
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() - 10);
    console.log(expiration);

    let secretKey;
    if (token && expiration < token.createdAt) {
      secretKey = token.token;
    } else {
      if (token) {
        await prisma.registrationToken.delete({
          where: { email: req.body.email },
        });
      }
      secretKey = crypto.randomBytes(32).toString("hex");
      await prisma.registrationToken.create({
        data: { email: req.body.email, token: secretKey },
      });
    }
    console.log(secretKey);
    const link = `${process.env.BASE_URL}/register/${req.body.email}/${secretKey}`;
    await sendEmail(
      req.body.email,
      "Abacus'25: Registration Link",
      `Click the link below to complete your registration for Abacus'25\n\n${link}`
    );
    console.log("mail sent");
    res.status(200).json({
      status: "OK",
      message: "Registration link sent successfully!",
      data: { link, secretKey },
    });
  } catch (error) {
    console.log("direct");
    res.status(500).json({
      status: "error",
      error: `Something went wrong.\n${error.message}`,
      message: "Internal server error",
    });
  }
};
export const accomodationDetails = async (req, res) => {
  console.log(req.id, req.body);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
    });
    console.log(user);
    if (!user) {
      return res.status(409).json({ message: "Invalid User", data: {} });
    }
    const accomodationDetails = await prisma.accomodation.create({
      data: {
        userId: req.id,
        day0: req.body.day0,
        day1: req.body.day1,
        day2: req.body.day2,
        day3: req.body.day3,
        food: req.body.food,
        amount: req.body.amount,
      },
    });
    console.log(accomodationDetails);
    return res.status(200).json({
      message: "Accommodation details inserted successfully",
      data: { accomodationDetails },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Accomodation registration failed!", error });
  }
};
