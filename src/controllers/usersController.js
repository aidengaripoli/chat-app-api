const { body } = require('express-validator/check')
const User = require('mongoose').model('User')
const { signToken, validationErrors } = require('../helpers')
const { OK, CREATED } = require('http-status-codes')

exports.validateRegister = [
  [
    body('name', 'Name cannot be empty')
      .exists()
      .not().isEmpty(),

    body('email')
      .isEmail().withMessage('Invalid Email address')
      .trim()
      .normalizeEmail()
      .custom(email => {
        return User.findOne({ email }).then(user => {
          if (user) throw new Error('Email already in use')
          return true
        })
      }),

    body('password', 'Password must be at least 8 characts long')
      .exists()
      .isLength({ min: 8 }),

    body('passwordConfirm', 'Passwords do not match')
      .exists()
      .custom((password, { req }) => password === req.body.password)
  ],
  validationErrors
]

exports.register = async (req, res) => {
  const user = new User(req.body)
  await user.save()

  const token = signToken(user)
  res.status(CREATED).json({ token })
}

exports.profile = (req, res) => {
  res.status(OK).json({ user: req.user })
}
