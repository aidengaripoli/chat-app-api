const passport = require('passport')
const { signToken } = require('../helpers')
const { OK, UNAUTHORIZED } = require('http-status-codes')

exports.authenticate = strategy => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) return next(err)
      if (!user) {
        if (strategy === 'jwt') {
          return res.status(UNAUTHORIZED).json({ errors: { message: 'Invalid Token' } })
        }
        return res.status(UNAUTHORIZED).json({ errors: { message: 'Invalid Credentials' } })
      }
      req.logIn(user, { session: false }, err => {
        if (err) return next(err)
        return next()
      })
    })(req, res, next)
  }
}

exports.login = (req, res) => {
  const token = signToken(req.user)
  res.status(OK).json({ token })
}
