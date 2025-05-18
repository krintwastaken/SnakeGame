const {Schema, model} = require('mongoose')

const User = new Schema({
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    score: { type: Number, default: 0, min: 0 },
    selectedFruit: { type: String, default: 'apple' },
    roles: [{ type: String, ref: 'Role' }],
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerificationCodeExpires: { type: Date },
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false }
});

module.exports = model('User', User)
