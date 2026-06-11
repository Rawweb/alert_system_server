import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Expiry Alert System" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_RECIPIENT,
      subject: subject,
      html: html,
    });

    return true;
  } catch (error) {
    console.error(`Email failed to send: ${error.message}`);
    return false;
  }
};

export default sendEmail;
