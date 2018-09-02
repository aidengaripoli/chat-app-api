const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true
  }
})

module.exports = mongoose.model('Message', messageSchema)
