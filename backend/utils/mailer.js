const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendBookingEmail(to, booking) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Booking Confirmation',
    text: `Your booking is confirmed for ${booking.room?.title}.
Check-in: ${new Date(booking.checkIn).toDateString()}
Check-out: ${new Date(booking.checkOut).toDateString()}
Guests: ${booking.guests}
Total: $${booking.totalPrice}`
  });
}

module.exports = { sendBookingEmail };
