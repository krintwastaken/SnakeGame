require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET,
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    },
    emailFrom: process.env.EMAIL_FROM,
    appUrl: process.env.APP_URL
}
