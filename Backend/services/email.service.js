const nodemailer = require("nodemailer")

const escapeHtml = (value) => {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}

const createWelcomeEmail = (firstName) => {
    const safeFirstName = escapeHtml(firstName)
    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`

    return `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to EasyTrip</title>
    </head>
    <body style="margin:0;background-color:#020617;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#020617;">
            <tr>
                <td align="center" style="padding:32px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;overflow:hidden;border:1px solid #1e293b;border-radius:24px;background-color:#0f172a;">
                        <tr>
                            <td style="padding:28px 32px;border-bottom:1px solid #1e293b;background-color:#071321;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="width:44px;height:44px;border-radius:14px;background-color:#22d3ee;text-align:center;font-size:22px;line-height:44px;">✈</td>
                                        <td style="padding-left:12px;font-size:24px;font-weight:800;color:#ffffff;">EasyTrip</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:42px 32px 18px;">
                                <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#67e8f9;">Your next adventure starts here</p>
                                <h1 style="margin:0;font-size:34px;line-height:1.2;color:#ffffff;">Welcome, ${safeFirstName}! 👋</h1>
                                <p style="margin:18px 0 0;font-size:17px;line-height:1.7;color:#cbd5e1;">Your EasyTrip account is ready. You now have one place to organize destinations, dates, activities, notes and budgets.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:14px 32px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="padding:18px;border:1px solid #243247;border-radius:16px;background-color:#111c2f;">
                                            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#ffffff;">🗺 Plan your trip</p>
                                            <p style="margin:0;font-size:14px;line-height:1.5;color:#94a3b8;">Choose your destination, dates and available budget.</p>
                                        </td>
                                    </tr>
                                    <tr><td style="height:12px;"></td></tr>
                                    <tr>
                                        <td style="padding:18px;border:1px solid #243247;border-radius:16px;background-color:#111c2f;">
                                            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#ffffff;">✓ Organize every detail</p>
                                            <p style="margin:0;font-size:14px;line-height:1.5;color:#94a3b8;">Add activities, useful notes and a checklist for departure.</p>
                                        </td>
                                    </tr>
                                    <tr><td style="height:12px;"></td></tr>
                                    <tr>
                                        <td style="padding:18px;border:1px solid #243247;border-radius:16px;background-color:#111c2f;">
                                            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#ffffff;">€ Keep costs under control</p>
                                            <p style="margin:0;font-size:14px;line-height:1.5;color:#94a3b8;">Compare your trip budget with planned activity costs.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding:22px 32px 40px;">
                                <a href="${dashboardUrl}" style="display:inline-block;border-radius:14px;background-color:#22d3ee;padding:14px 24px;font-size:15px;font-weight:800;color:#082f49;text-decoration:none;">Start planning</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:22px 32px;border-top:1px solid #1e293b;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
                                This automatic email was sent because you created an EasyTrip account.<br>
                                EasyTrip · Plan simply, travel better.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`
}

const createPasswordResetEmail = ({ firstName, resetUrl }) => {
    const safeFirstName = escapeHtml(firstName)
    const safeResetUrl = escapeHtml(resetUrl)

    return `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset your EasyTrip password</title>
    </head>
    <body style="margin:0;background-color:#020617;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#020617;">
            <tr>
                <td align="center" style="padding:32px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;border:1px solid #1e293b;border-radius:24px;background-color:#0f172a;">
                        <tr>
                            <td style="padding:28px 32px;border-bottom:1px solid #1e293b;font-size:24px;font-weight:800;color:#ffffff;">✈ EasyTrip</td>
                        </tr>
                        <tr>
                            <td style="padding:42px 32px 18px;">
                                <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#67e8f9;">Password recovery</p>
                                <h1 style="margin:0;font-size:32px;line-height:1.2;color:#ffffff;">Hi ${safeFirstName}, reset your password</h1>
                                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#cbd5e1;">We received a request to reset your EasyTrip password. This link is valid for 30 minutes and can only be used once.</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding:18px 32px 30px;">
                                <a href="${safeResetUrl}" style="display:inline-block;border-radius:14px;background-color:#22d3ee;padding:14px 24px;font-size:15px;font-weight:800;color:#082f49;text-decoration:none;">Choose a new password</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:22px 32px;border-top:1px solid #1e293b;font-size:12px;line-height:1.6;color:#64748b;">If you did not request this change, you can safely ignore this email. Your password will remain unchanged.</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`
}

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error("Email service is not configured")
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
}

const sendWelcomeEmail = async ({ email, firstName }) => {
    const transporter = createTransporter()

    await transporter.sendMail({
        from: `EasyTrip <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Welcome to EasyTrip, ${firstName}!`,
        html: createWelcomeEmail(firstName),
        text: `Welcome to EasyTrip, ${firstName}! Your account is ready. Start planning at ${process.env.CLIENT_URL}/dashboard`,
    })
}

const sendPasswordResetEmail = async ({ email, firstName, resetToken }) => {
    const transporter = createTransporter()
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`

    await transporter.sendMail({
        from: `EasyTrip <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your EasyTrip password",
        html: createPasswordResetEmail({ firstName, resetUrl }),
        text: `Reset your EasyTrip password using this link within 30 minutes: ${resetUrl}`,
    })
}

module.exports = {
    createWelcomeEmail,
    createPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
}
