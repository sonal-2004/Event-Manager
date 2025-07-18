const nodemailer = require("nodemailer");
require("dotenv").config(); // Load .env variables

// Email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send registration confirmation email
const sendRegistrationEmail = async (toEmail, userName, eventName) => {
  try {
    await transporter.sendMail({
      from: `"Event Manager" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Event Registration Successful",
      html: `<h3>Hello ${userName},</h3>
             <p>You have successfully registered for the event: <b>${eventName}</b>.</p>
             <p>Thank you for joining!</p>`,
    });
  } catch (error) {
    console.error("Error sending registration email:", error);
    throw error;
  }
};

// ✅ Function to send reminder email
const sendReminderEmail = async (toEmail, userName, eventName, eventDate) => {
  try {
    await transporter.sendMail({
      from: `"Event Manager" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Reminder: ${eventName} is Tomorrow!`,
      html: `<h3>Hello ${userName},</h3>
             <p>This is a reminder that <b>${eventName}</b> is scheduled for <b>${new Date(eventDate).toLocaleString()}</b>.</p>
             <p>Don't miss it!</p>`,
    });
  } catch (error) {
    console.error("Error sending reminder email:", error);
  }
};

module.exports = {
  sendRegistrationEmail,
  sendReminderEmail,
};
