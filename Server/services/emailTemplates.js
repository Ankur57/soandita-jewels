/**
 * Professional HTML email templates for Soandita Jewels
 */

const brandColor = "#b8860b"; // dark gold
const brandColorLight = "#d4a843";
const bgColor = "#f8f6f1";

const baseLayout = (content, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Soandita Jewels</title>
</head>
<body style="margin:0;padding:0;background-color:${bgColor};font-family:'Georgia','Times New Roman',serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${bgColor};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Gold accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${brandColor},${brandColorLight},${brandColor});"></td>
          </tr>

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding:32px 40px 16px;">
              <h1 style="margin:0;font-size:28px;font-weight:normal;font-style:italic;color:#1a1a1a;letter-spacing:1px;">
                ✦ Soandita Jewels ✦
              </h1>
              <div style="width:60px;height:2px;background:linear-gradient(90deg,${brandColor},${brandColorLight});margin:12px auto 0;border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:8px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf8f4;border-top:1px solid #eee;padding:24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:13px;color:#999;font-style:italic;">
                      Crafted with passion & precision
                    </p>
                    <p style="margin:0 0 4px;font-size:12px;color:#bbb;">
                      © ${new Date().getFullYear()} Soandita Jewels. All rights reserved.
                    </p>
                    <p style="margin:0;font-size:11px;color:#ccc;">
                      This is an automated email. Please do not reply directly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * OTP verification email for registration
 */
exports.registrationOtpEmail = (name, otp) => {
  const content = `
    <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 20px;">
      Dear <strong>${name}</strong>,
    </p>
    <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">
      Welcome to Soandita Jewels! We're delighted to have you join our exclusive community of jewelry connoisseurs. To complete your registration, please use the verification code below:
    </p>
    
    <!-- OTP Box -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:8px 0 24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#fdf8ee,#faf3e0);border:2px solid ${brandColor};border-radius:12px;padding:20px 48px;">
            <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:${brandColor};font-family:'Courier New',monospace;">
              ${otp}
            </span>
          </div>
          <p style="margin:12px 0 0;font-size:13px;color:#999;">
            This code expires in <strong style="color:#666;">10 minutes</strong>
          </p>
        </td>
      </tr>
    </table>
    
    <p style="font-size:14px;color:#777;line-height:1.6;margin:0 0 8px;">
      If you did not create an account with us, you can safely ignore this email.
    </p>
    <p style="font-size:14px;color:#777;line-height:1.6;margin:0;">
      With warm regards,<br/>
      <strong style="color:${brandColor};">The Soandita Jewels Team</strong>
    </p>
  `;

  return {
    subject: "✨ Verify Your Soandita Jewels Account",
    html: baseLayout(content, `Your verification code is ${otp}`),
  };
};

/**
 * Forgot password OTP email
 */
exports.forgotPasswordOtpEmail = (name, otp) => {
  const content = `
    <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 20px;">
      Dear <strong>${name}</strong>,
    </p>
    <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">
      We received a request to reset the password for your Soandita Jewels account. Please use the verification code below to proceed:
    </p>

    <!-- OTP Box -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:8px 0 24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#fdf8ee,#faf3e0);border:2px solid ${brandColor};border-radius:12px;padding:20px 48px;">
            <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:${brandColor};font-family:'Courier New',monospace;">
              ${otp}
            </span>
          </div>
          <p style="margin:12px 0 0;font-size:13px;color:#999;">
            This code expires in <strong style="color:#666;">10 minutes</strong>
          </p>
        </td>
      </tr>
    </table>

    <div style="background-color:#fff8f0;border-left:4px solid ${brandColor};border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">
        🔒 <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email. Your account remains secure.
      </p>
    </div>

    <p style="font-size:14px;color:#777;line-height:1.6;margin:0;">
      With warm regards,<br/>
      <strong style="color:${brandColor};">The Soandita Jewels Team</strong>
    </p>
  `;

  return {
    subject: "🔐 Reset Your Soandita Jewels Password",
    html: baseLayout(content, `Your password reset code is ${otp}`),
  };
};

/**
 * Welcome email after successful verification
 */
exports.welcomeEmail = (name) => {
  const content = `
    <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 20px;">
      Dear <strong>${name}</strong>,
    </p>
    <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px;">
      Your account has been successfully verified! Welcome to the Soandita Jewels family — where elegance meets timeless craftsmanship.
    </p>

    <div style="background:linear-gradient(135deg,#fdf8ee,#faf3e0);border-radius:12px;padding:24px;margin:0 0 24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:18px;font-style:italic;color:#333;">
        ✦ What Awaits You ✦
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
        <tr>
          <td align="center" style="padding:8px;">
            <p style="margin:0;font-size:14px;color:#666;">💎 Exclusive Collections</p>
          </td>
          <td align="center" style="padding:8px;">
            <p style="margin:0;font-size:14px;color:#666;">🎁 Members-Only Offers</p>
          </td>
          <td align="center" style="padding:8px;">
            <p style="margin:0;font-size:14px;color:#666;">📦 Order Tracking</p>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#777;line-height:1.6;margin:0;">
      With warm regards,<br/>
      <strong style="color:${brandColor};">The Soandita Jewels Team</strong>
    </p>
  `;

  return {
    subject: "💎 Welcome to Soandita Jewels!",
    html: baseLayout(content, `Welcome to Soandita Jewels, ${name}!`),
  };
};

/**
 * Order confirmation email after successful payment
 */
exports.orderConfirmationEmail = (name, order) => {
  const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
          ${item.name}
        </td>
        <td align="center" style="padding:12px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#666;">
          ${item.quantity}
        </td>
        <td align="right" style="padding:12px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;font-weight:600;">
          ₹${(item.priceAtTime * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `).join("");

  const content = `
    <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 20px;">
      Dear <strong>${name}</strong>,
    </p>
    <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 8px;">
      Thank you for your order! Your payment has been successfully processed and we're thrilled to be crafting something special for you.
    </p>

    <!-- Order Number Badge -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:16px 0 24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#fdf8ee,#faf3e0);border:2px solid ${brandColor};border-radius:12px;padding:16px 32px;">
            <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:2px;">Order Number</p>
            <span style="font-size:22px;font-weight:bold;color:${brandColor};font-family:'Courier New',monospace;">
              ${order.orderNumber}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
      <tr style="background-color:#faf8f4;">
        <td style="padding:10px 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Item</td>
        <td align="center" style="padding:10px 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</td>
        <td align="right" style="padding:10px 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Amount</td>
      </tr>
      ${itemsHtml}
    </table>

    <!-- Price Summary -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#777;">Subtotal</td>
        <td align="right" style="padding:6px 0;font-size:14px;color:#333;">₹${order.subtotal.toLocaleString("en-IN")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#777;">Shipping</td>
        <td align="right" style="padding:6px 0;font-size:14px;color:#28a745;font-weight:600;">Free</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:8px 0 0;"><div style="height:1px;background-color:#eee;"></div></td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:18px;color:#333;font-weight:bold;">Total Paid</td>
        <td align="right" style="padding:12px 0 0;font-size:18px;color:${brandColor};font-weight:bold;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
      </tr>
    </table>

    <!-- Delivery Address -->
    ${order.addressSnapshot ? `
    <div style="background-color:#faf8f4;border-radius:8px;padding:16px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Delivering to</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        <strong>${order.addressSnapshot.fullName}</strong><br/>
        ${order.addressSnapshot.addressLine1}<br/>
        ${order.addressSnapshot.city}, ${order.addressSnapshot.state} — ${order.addressSnapshot.postalCode}<br/>
        📞 ${order.addressSnapshot.mobileNumber}
      </p>
    </div>
    ` : ""}

    <!-- What's Next -->
    <div style="background:linear-gradient(135deg,#fdf8ee,#faf3e0);border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
      <p style="margin:0 0 12px;font-size:16px;font-style:italic;color:#333;">
        ✦ What Happens Next ✦
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:6px;">
            <p style="margin:0;font-size:13px;color:#666;">📦 We'll carefully pack your order</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:6px;">
            <p style="margin:0;font-size:13px;color:#666;">🚚 You'll receive shipping details via email</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:6px;">
            <p style="margin:0;font-size:13px;color:#666;">✨ Your jewelry will arrive in 5–7 business days</p>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#777;line-height:1.6;margin:0;">
      With warm regards,<br/>
      <strong style="color:${brandColor};">The Soandita Jewels Team</strong>
    </p>
  `;

  return {
    subject: `✅ Order Confirmed — ${order.orderNumber} | Soandita Jewels`,
    html: baseLayout(content, `Your order ${order.orderNumber} has been confirmed!`),
  };
};
