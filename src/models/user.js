const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
    required: 'Please enter a name'
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Please enter a valid email'
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  age: {
    type: Number,
    trim: true,
    default: 18
  },
  height: {
    type: Number,
    trim: true,
    default: 160
  },
  weight: {
    type: Number,
    trim: true,
    default: 50
  }
})

userSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

userSchema.methods.checkPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (err) {
    throw new Error(err)
  }
}

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)
