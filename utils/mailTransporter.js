import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.ADMIN_USER,
        pass: process.env.ADMIN_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export default transporter;
