const {Schema, model} = require('mongoose')

const User = new Schema({
    email: {type: String, unique: true, required: true},
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    score: {type: Number, default: 0, min: 0},
    roles: [{type: String, ref: 'Role'}]
})

module.exports = model('User', User)