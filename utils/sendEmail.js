import transporter from "./mailTransporter.js";
import compileMailTemplate from "./compileMailTemplate.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (email, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.ADMIN_USER,
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
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

export default sendEmail;
