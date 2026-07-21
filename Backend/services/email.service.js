const nodemailer = require("nodemailer")

const escapeHtml = (value) => {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}

const createWelcomeEmail = (firstName, language = "en") => {
    const safeFirstName = escapeHtml(firstName)
    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`
    const isItalian = language === "it"
    const content = isItalian ? {
        eyebrow: "La tua prossima avventura inizia qui",
        title: `Benvenuto, ${safeFirstName}! 👋`,
        introduction: "Il tuo account EasyTrip è pronto. Ora hai un unico spazio per organizzare destinazioni, date, attività, note e budget.",
        plan: "🗺 Pianifica il viaggio",
        planText: "Scegli destinazione, date e budget disponibile.",
        organize: "✓ Organizza ogni dettaglio",
        costs: "€ Tieni sotto controllo i costi",
        costsText: "Confronta il budget del viaggio con i costi delle attività.",
        action: "Inizia a pianificare",
        footer: "Questa email automatica è stata inviata perché hai creato un account EasyTrip."
    } : {
        eyebrow: "Your next adventure starts here",
        title: `Welcome, ${safeFirstName}! 👋`,
        introduction: "Your EasyTrip account is ready. You now have one place to organize destinations, dates, activities, notes and budgets.",
        plan: "🗺 Plan your trip",
        planText: "Choose your destination, dates and available budget.",
        organize: "✓ Organize every detail",
        costs: "€ Keep costs under control",
        costsText: "Compare your trip budget with planned activity costs.",
        action: "Start planning",
        footer: "This automatic email was sent because you created an EasyTrip account."
    }

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
                                <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#67e8f9;">${content.eyebrow}</p>
                                <h1 style="margin:0;font-size:34px;line-height:1.2;color:#ffffff;">${content.title}</h1>
                                <p style="margin:18px 0 0;font-size:17px;line-height:1.7;color:#cbd5e1;">${content.introduction}</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:14px 32px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="padding:18px;border:1px solid #243247;border-radius:16px;background-color:#111c2f;">
                                            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#ffffff;">${content.plan}</p>
                                            <p style="margin:0;font-size:14px;line-height:1.5;color:#94a3b8;">${content.planText}</p>
                                        </td>
                                    </tr>
                                    <tr><td style="height:12px;"></td></tr>
                                    <tr>
                                        <td style="padding:18px;border:1px solid #243247;border-radius:16px;background-color:#111c2f;">
                                            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#ffffff;">${content.organize}</p>
                                            <p style="margin:0;font-size:14px;line-height:1.5;color:#94a3b8;">Add activities, useful notes and a checklist for departure.</p>
                                        </td>
                                    </tr>
                                    <tr><td style="height:12px;"></td></tr>
                                    <tr>
                                        <td style="padding:18px;border:1px solid #243247;border-radius:16px;background-color:#111c2f;">
                                            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#ffffff;">${content.costs}</p>
                                            <p style="margin:0;font-size:14px;line-height:1.5;color:#94a3b8;">${content.costsText}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding:22px 32px 40px;">
                                <a href="${dashboardUrl}" style="display:inline-block;border-radius:14px;background-color:#22d3ee;padding:14px 24px;font-size:15px;font-weight:800;color:#082f49;text-decoration:none;">${content.action}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:22px 32px;border-top:1px solid #1e293b;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
                                ${content.footer}<br>
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

const createPasswordResetEmail = ({ firstName, resetUrl, language = "en" }) => {
    const safeFirstName = escapeHtml(firstName)
    const safeResetUrl = escapeHtml(resetUrl)
    const isItalian = language === "it"
    const content = isItalian ? {
        eyebrow: "Recupero password",
        title: `Ciao ${safeFirstName}, reimposta la password`,
        description: "Abbiamo ricevuto una richiesta per reimpostare la password EasyTrip. Il link è valido per 30 minuti e può essere usato una sola volta.",
        action: "Scegli una nuova password",
        footer: "Se non hai richiesto questa modifica, puoi ignorare questa email. La password resterà invariata."
    } : {
        eyebrow: "Password recovery",
        title: `Hi ${safeFirstName}, reset your password`,
        description: "We received a request to reset your EasyTrip password. This link is valid for 30 minutes and can only be used once.",
        action: "Choose a new password",
        footer: "If you did not request this change, you can safely ignore this email. Your password will remain unchanged."
    }

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
                                <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#67e8f9;">${content.eyebrow}</p>
                                <h1 style="margin:0;font-size:32px;line-height:1.2;color:#ffffff;">${content.title}</h1>
                                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#cbd5e1;">${content.description}</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding:18px 32px 30px;">
                                <a href="${safeResetUrl}" style="display:inline-block;border-radius:14px;background-color:#22d3ee;padding:14px 24px;font-size:15px;font-weight:800;color:#082f49;text-decoration:none;">${content.action}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:22px 32px;border-top:1px solid #1e293b;font-size:12px;line-height:1.6;color:#64748b;">${content.footer}</td>
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
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
}

const sendWelcomeEmail = async ({ email, firstName, language = "en" }) => {
    const transporter = createTransporter()

    await transporter.sendMail({
        from: `EasyTrip <${process.env.EMAIL_USER}>`,
        to: email,
        subject: language === "it" ? `Benvenuto su EasyTrip, ${firstName}!` : `Welcome to EasyTrip, ${firstName}!`,
        html: createWelcomeEmail(firstName, language),
        text: language === "it" ? `Benvenuto su EasyTrip, ${firstName}! Il tuo account è pronto. Inizia da ${process.env.CLIENT_URL}/dashboard` : `Welcome to EasyTrip, ${firstName}! Your account is ready. Start planning at ${process.env.CLIENT_URL}/dashboard`,
    })
}

const sendPasswordResetEmail = async ({ email, firstName, resetToken, language = "en" }) => {
    const transporter = createTransporter()
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`

    await transporter.sendMail({
        from: `EasyTrip <${process.env.EMAIL_USER}>`,
        to: email,
        subject: language === "it" ? "Reimposta la password EasyTrip" : "Reset your EasyTrip password",
        html: createPasswordResetEmail({ firstName, resetUrl, language }),
        text: language === "it" ? `Reimposta la password EasyTrip usando questo link entro 30 minuti: ${resetUrl}` : `Reset your EasyTrip password using this link within 30 minutes: ${resetUrl}`,
    })
}

module.exports = {
    createWelcomeEmail,
    createPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
}
