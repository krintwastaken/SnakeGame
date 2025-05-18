const nodemailer = require('nodemailer');
const { smtp, emailFrom, appUrl } = require('../config');

const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
        user: smtp.auth.user,
        pass: smtp.auth.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to take our messages');
    }
});

async function sendResetPasswordEmail(email, token) {
    //const resetUrl = `https://snakegameco.netlify.app/views/reset-password.html?token=${token}`;
    const resetUrl = `http://localhost:5000/views/reset-password.html?token=${token}`;

    const mailOptions = {
        from: `"Snake Game" <${emailFrom}>`,
        to: email,
        subject: 'Сброс пароля для Snake Game',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Сброс пароля</h2>
                <p>Вы запросили сброс пароля для аккаунта Snake Game.</p>
                <p>Пожалуйста, нажмите на кнопку ниже, чтобы установить новый пароль:</p>
                <p style="margin: 20px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Сбросить пароль
                    </a>
                </p>
                <p>Или скопируйте и вставьте следующую ссылку в браузер:</p>
                <p><code>${resetUrl}</code></p>
                <p>Ссылка действительна в течение 1 часа.</p>
                <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #777;">Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset password email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

async function sendVerificationEmail(email, verificationCode) {
    const mailOptions = {
        from: `"Snake Game" <${emailFrom}>`,
        to: email,
        subject: 'Подтверждение email для Snake Game',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Подтверждение email</h2>
                <p>Спасибо за регистрацию в Snake Game!</p>
                <p>Ваш код подтверждения:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
                    ${verificationCode}
                </p>
                <p>Введите этот код на странице подтверждения, чтобы завершить регистрацию.</p>
                <p>Если вы не запрашивали регистрацию, проигнорируйте это письмо.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #777;">Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
}

module.exports = {
    sendResetPasswordEmail,
    sendVerificationEmail
};

