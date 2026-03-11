const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendEmail = async (to, subject, html) => {
  await resend.emails.send({
    from: `"Soandita Jewels" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
