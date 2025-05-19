
const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { secret } = require("./config");
const ResetToken = require('./models/resetToken');
const { v4: uuidv4 } = require('uuid');
const { sendResetPasswordEmail, sendVerificationEmail } = require('./services/emailService');

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, { expiresIn: "24h" })
}

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

class authController {
    async registration(req, res) {
        try {
            const { username, email, password } = req.body;

            const hashPassword = bcrypt.hashSync(password, 7);
            const verificationCode = generateVerificationCode();
            const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const user = new User({
                email,
                username,
                password: hashPassword,
                roles: "USER",
                emailVerificationCode: verificationCode,
                emailVerificationCodeExpires: verificationCodeExpires
            });

            await user.save();

            const emailSent = await sendVerificationEmail(email, verificationCode);
            if (!emailSent) {
                return res.status(500).json({ message: 'Ошибка при отправке кода подтверждения' });
            }

            return res.json({ 
                message: "Код подтверждения отправлен на вашу почту",
                email: email
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Ошибка при регистрации' });
        }
    }

    async login(req, res) {
        try {
            const { password, username, twoFactorCode } = req.body; // Получаем twoFactorCode

        // Добавляем валидацию для полей username и password
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: `Пользователь с именем: ${username} не найден` });
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: `Введен неверный пароль` });
            }

            if (!user.isEmailVerified) {
                return res.status(403).json({ // 403 Forbidden
                    message: 'Email не подтвержден',
                    email: user.email, //  Возвращаем email для перенаправления
                    requiresVerification: true // Флаг, указывающий на необходимость верификации
                });
            }

            if (user.isTwoFactorEnabled) {
                if (!twoFactorCode) {
                    return res.status(403).json({ message: 'Требуется код двухфакторной аутентификации' });
                }

                const verified = speakeasy.totp.verify({
                    secret: user.twoFactorSecret,
                    encoding: 'base32',
                    token: twoFactorCode,
                    window: 2
                });

                if (!verified) {
                    return res.status(400).json({ message: 'Неверный код двухфакторной аутентификации' });
                }
            }

            const token = generateAccessToken(user._id, user.roles);
            return res.json({ token, message: "ok" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Login error' });
        }
    }


    async generateTwoFactorSecret(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const secret = speakeasy.generateSecret({ length: 20 });

            QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Ошибка при генерации QR-кода' });
                }

                return res.json({
                    secret: secret.base32,
                    qrCode: data_url
                });
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при генерации секретного ключа 2FA' });
        }
    }

    async enableTwoFactorAuth(req, res) {
        try {
            const userId = req.user.id;
            const { secret, token } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 2  // Проверка в пределах двух временных окон (60 секунд)
            });

            if (!verified) {
                return res.status(400).json({ message: 'Неверный код подтверждения' });
            }

            user.twoFactorSecret = secret;
            user.isTwoFactorEnabled = true;
            await user.save();

            return res.json({ message: 'Двухфакторная аутентификация включена' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при включении 2FA' });
        }
    }

    async disableTwoFactorAuth(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.twoFactorSecret = undefined;
            user.isTwoFactorEnabled = false;
            await user.save();

            return res.json({ message: 'Двухфакторная аутентификация выключена' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при выключении 2FA' });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find()
            res.json(users)
        } catch (err) {
            console.log(err)
        }
    }

    async reset_password(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: `Пользователь с email: ${email} не найден` });
            }

              //  Добавляем проверку длины пароля
              if (password.length < 8 || password.length > 127) {
                return res.status(400).json({
                    message: "Пароль должен содержать от 8 до 127 символов."
                });
            }

            const hashPassword = bcrypt.hashSync(password, 7);
            user.password = hashPassword;
            await user.save();

            return res.json({ message: "Пароль успешно изменен" });

        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Ошибка при смене пароля' });
        }
    }

    async updateScore(req, res) {
        try {
            const userId = req.user.id;
            const scoreIncrement = req.body.score;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.score += scoreIncrement;
            await user.save();

            return res.json({ message: 'Score updated successfully', newScore: user.score });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to update score' });
        }
    }

    async updateSelectedFruit(req, res) {
        try {
            const userId = req.user.id;
            const { fruitType } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.selectedFruit = fruitType;
            await user.save();

            return res.json({ message: 'Fruit updated successfully', selectedFruit: user.selectedFruit });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to update fruit' });
        }
    }

    async getSelectedFruit(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.json({ selectedFruit: user.selectedFruit });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to get selected fruit' });
        }
    }

    async getScore(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.json({ score: user.score });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to get score' });
        }
    }

    async getLeaderboard(req, res) {
        try {
            const users = await User.find({}, 'username score').sort({ score: -1 }).limit(10);
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to fetch leaderboard' });
        }
    }

    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Пользователь с таким email не найден' });
            }

            // Удаляем старые токены для этого пользователя
            await ResetToken.deleteMany({ userId: user._id });

            // Создаем новый токен
            const token = uuidv4();
            const resetToken = new ResetToken({
                userId: user._id,
                token: token
            });
            await resetToken.save();

            // Отправляем email
            const emailSent = await sendResetPasswordEmail(email, token);
            if (!emailSent) {
                return res.status(500).json({ message: 'Ошибка при отправке email' });
            }

            return res.json({ message: 'Ссылка для сброса пароля отправлена на ваш email' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при запросе сброса пароля' });
        }
    }

    async verifyResetToken(req, res) {
        try {
            const { token } = req.query;

            const resetToken = await ResetToken.findOne({ token });
            if (!resetToken) {
                return res.status(400).json({ message: 'Неверный или истекший токен сброса пароля' });
            }

            return res.json({ valid: true, userId: resetToken.userId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при проверке токена' });
        }
    }

    async resetPasswordWithToken(req, res) {
        try {
            const { token, newPassword } = req.body;

            // 1. Найти токен в базе
            const resetToken = await ResetToken.findOne({ token });
            if (!resetToken) {
                return res.status(400).json({
                    message: 'Неверный или истекший токен сброса пароля'
                });
            }

            // 2. Найти пользователя
            const user = await User.findById(resetToken.userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

               //  Добавляем проверку длины пароля
               if (newPassword.length < 8 || newPassword.length > 127) {
                return res.status(400).json({
                    message: "Пароль должен содержать от 8 до 127 символов."
                });
            }
    
            // 3. Обновить пароль
            const hashPassword = bcrypt.hashSync(newPassword, 7);
            user.password = hashPassword;
            await user.save();

            // 4. Удалить использованный токен
            await ResetToken.deleteOne({ _id: resetToken._id });

            return res.json({ message: 'Пароль успешно изменен' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при сбросе пароля' });
        }
    }

    async verifyEmail(req, res) {
        try {
            const { email, code } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({ message: 'Email уже подтвержден' });
            }

            if (user.emailVerificationCode !== code) {
                return res.status(400).json({ message: 'Неверный код подтверждения' });
            }

            if (new Date() > user.emailVerificationCodeExpires) {
                return res.status(400).json({ message: 'Срок действия кода истек' });
            }

            user.isEmailVerified = true;
            user.emailVerificationCode = undefined;
            user.emailVerificationCodeExpires = undefined;
            await user.save();

            return res.json({ message: 'Email успешно подтвержден' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при подтверждении email' });
        }
    }

    async resendVerification(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({ message: 'Email уже подтвержден' });
            }

            const verificationCode = generateVerificationCode();
            const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            user.emailVerificationCode = verificationCode;
            user.emailVerificationCodeExpires = verificationCodeExpires;
            await user.save();

            const emailSent = await sendVerificationEmail(email, verificationCode);
            if (!emailSent) {
                return res.status(500).json({ message: 'Ошибка при отправке кода подтверждения' });
            }

            return res.json({ message: 'Новый код подтверждения отправлен на вашу почту' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при повторной отправке кода' });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Отправляем только нужные данные
            return res.json({
                username: user.username,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при получении профиля' });
        }
    }
}

module.exports = new authController()
