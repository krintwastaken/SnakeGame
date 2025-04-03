const User = require('./models/User')
const Role = require('./models/Role')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator')
const {secret} = require("./config")

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"} )
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }

            const {username, password, email} = req.body
            const mailCandidate = await User.findOne({email})
            if (mailCandidate) {
                return res.status(400).json({message: "Пользователь с таким email уже существует"})
            }

            const candidate = await User.findOne({username})
            if (candidate) {
                return res.status(400).json({message: "Пользователь с таким именем уже существует"})
            }

            const hashPassword = bcrypt.hashSync(password, 7)

            const userRole = await Role.findOne({value: "USER"})
            const user = new User({email, username, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})

        } catch (err) {
            console.log(err)
            res.status(400).json({message: 'Ошибка при регистрации'})
        }
    }

    async login(req, res) {
        try {
            const { password, email } = req.body;
    
            const user = await User.findOne({ email });
    
            if (!user) {
                return res.status(400).json({ message: `Пользователь с email: ${email} не найден` });
            }
    
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: `Введен неверный пароль` });
            }
    
            const token = generateAccessToken(user._id, user.roles);
            return res.json({ token, message: "ok" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Login error' });
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

            const hashPassword = bcrypt.hashSync(password, 7);
            user.password = hashPassword;
            await user.save();

            return res.json({ message: "Пароль успешно изменен" });

        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Ошибка при смене пароля' });
        }
    }
}

module.exports = new authController()
