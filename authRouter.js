const express = require('express');
const User = require('./models/User');
const router = new express.Router();
const controller = require('./authController');
const { check, validationResult } = require("express-validator");
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const path = require('path');
const loginLimiter = require('./middleware/rateLimitMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/registration', [
    check('username', "Имя пользователя не может быть пустым")
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage('Имя пользователя должно быть не менее 3 символов'),
    check('email', "Некорректный email")
        .isEmail()
        .custom(async (email) => {
            const user = await User.findOne({ email });
            if (user) throw new Error('Пользователь с таким email уже существует');
        }),
    check('password', "Пароль должен содержать от 8 до 127 символов")
        .isLength({ min: 8, max: 127 })
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/)
        .withMessage('Пароль должен содержать заглавную букву, цифру и специальный символ'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Пароли не совпадают');
        return true;
    })
], validate, controller.registration);

router.get('/profile', authMiddleware, controller.getProfile);

router.post('/login', loginLimiter, [
    check('username', "Пустое содержимое").notEmpty(),
    check('password', "Пустое содержимое").notEmpty(),
], controller.login);


router.get('/two-factor/generate', authMiddleware, controller.generateTwoFactorSecret);
router.post('/two-factor/enable', authMiddleware, controller.enableTwoFactorAuth);
router.post('/two-factor/disable', authMiddleware, controller.disableTwoFactorAuth);

router.post('/reset-password-with-token', [
    check('token', 'Токен обязателен').notEmpty(),
    check('newPassword', "Пароль должен содержать от 8 до 127 символов")
        .isLength({ min: 8, max: 127 })
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/)
        .withMessage('Пароль должен содержать заглавную букву, цифру и специальный символ')
], validate, controller.resetPasswordWithToken);

router.post('/reset_password', controller.reset_password);
router.post('/update-score', authMiddleware, controller.updateScore);
router.post('/update-fruit', authMiddleware, controller.updateSelectedFruit);
router.get('/get-fruit', authMiddleware, controller.getSelectedFruit);
router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers);
router.get('/score', authMiddleware, controller.getScore);
router.get('/leaderboard', authMiddleware, controller.getLeaderboard);
router.post('/request-password-reset', controller.requestPasswordReset);
router.get('/verify-reset-token', controller.verifyResetToken);
router.post('/verify-email', controller.verifyEmail);
router.post('/resend-verification', controller.resendVerification);

router.get('/recaptcha-site-key', (req, res) => {
    res.json({ siteKey: process.env.RECAPTCHA_SITE_KEY });
});

router.get('/recaptcha-site-key', (req, res) => {
    res.json({ siteKey: process.env.RECAPTCHA_SITE_KEY });
});

module.exports = router;