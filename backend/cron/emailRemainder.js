const cron = require("node-cron");
const { sendReminderEmail } = require("../utils/emailService");
const Event = require("../models/Event");
const User = require("../models/User"); // optional, if user info is separate
const Registration = require("../models/Registration"); // your registration model
const mongoose = require("mongoose");

cron.schedule("0 9 * * *", async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Find events happening tomorrow
    const upcomingEvents = await Event.find({
      eventDate: { $gte: tomorrow, $lt: dayAfter },
    });

    for (const event of upcomingEvents) {
      const registrations = await Registration.find({ eventId: event._id });

      for (const reg of registrations) {
        await sendReminderEmail(reg.email, reg.userName, event.eventName, event.eventDate);
      }
    }

    console.log("Reminder emails sent successfully.");
  } catch (err) {
    console.error("Error sending reminder emails:", err);
  }
});
