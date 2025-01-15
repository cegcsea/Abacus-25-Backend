import transporter from './mailTransporter.js';
import compileMailTemplate from './compileMailTemplate.js';

const sendCustomEmail = async (subject, text, user, imageBuffer) => {
    try {
        await transporter.sendMail({
            from: process.env.ADMIN_USER,
            to: user.email,
            subject: subject,
            html: compileMailTemplate({ text: text }),
            attachments: [
                {
                    filename: `AB25${user.abacusId}.jpg`,
                    content: imageBuffer,
                    encoding: 'base64',
                },
            ],
        });
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

export default sendCustomEmail;
