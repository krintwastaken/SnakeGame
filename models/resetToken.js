const {Schema, model} = require('mongoose')

const ResetToken = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    token: {type: String, required: true},
    createdAt: {type: Date, default: Date.now, expires: '1h'}
})

module.exports = model('ResetToken', ResetToken)