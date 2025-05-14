const jwt = require('jsonwebtoken')
const {secret} = require('../config')
const User = require('../models/user');

module.exports = async function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({message: "Пользователь не авторизован"});
        }
        const decodedData = jwt.verify(token, secret);
    
        // Проверяем, подтвержден ли email
        const user = await User.findById(decodedData.id);
    if (!user.isEmailVerified) {
        return res.status(403).json({message: "Email не подтвержден"});
    }
    
    req.user = decodedData;
    next();
    } catch (err) {
        console.log(err);
        return res.status(403).json({message: "Пользователь не авторизован"});
    }
}