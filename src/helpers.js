const { validationResult } = require('express-validator/check')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env
const { UNPROCESSABLE_ENTITY } = require('http-status-codes')

exports.signToken = user => {
  return jwt.sign({
    issuer: 'alpha',
    subject: user._id
  },
  JWT_SECRET,
  { expiresIn: '1d' })
}

exports.validationErrors = (req, res, next) => {
  const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return msg
  }
  const errors = validationResult(req).formatWith(errorFormatter)
  if (!errors.isEmpty()) {
    return res.status(UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
  }
  next()
}
