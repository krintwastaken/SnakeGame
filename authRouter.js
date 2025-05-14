const Router = require('express');
const router = new Router();
const controller = require('./authController');
const { check, validationResult } = require("express-validator");
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const { sendResetPasswordEmail } = require('./services/emailService');
const path = require('path');


router.post('/registration', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть от 5 до 12 символов").isLength({ min: 5, max: 12 }),
    check('email', "Некорректный email").isEmail()
], controller.registration);

router.post('/login', [
    check('password', "Пароль должен быть от 5 до 12 символов").isLength({ min: 5, max: 12 }),
    check('email', "Некорректный email").isEmail()
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, controller.login);

router.post('/reset_password', controller.reset_password);

router.post('/update-score', authMiddleware, controller.updateScore);
router.post('/update-fruit', authMiddleware, controller.updateSelectedFruit);
router.get('/get-fruit', authMiddleware, controller.getSelectedFruit);

router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers);

router.get('/score', authMiddleware, controller.getScore);

router.get('/leaderboard', authMiddleware, controller.getLeaderboard);

router.post('/request-password-reset', controller.requestPasswordReset);
router.get('/verify-reset-token', controller.verifyResetToken);
router.post('/reset-password-with-token', controller.resetPasswordWithToken);

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send('Токен отсутствует');
    }
    res.sendFile(path.join(__dirname, '/views/reset-password.html'));
});

router.post('/verify-email', controller.verifyEmail);
router.post('/resend-verification', controller.resendVerification);

module.exports = router;