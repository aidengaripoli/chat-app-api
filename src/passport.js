const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const { ExtractJwt } = require('passport-jwt')
const LocalStrategy = require('passport-local').Strategy
const User = require('mongoose').model('User')
const { JWT_SECRET } = process.env

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('authorization'),
  secretOrKey: JWT_SECRET
}

const localOptions = {
  usernameField: 'email'
}

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.subject)
    if (!user) return done(null, false)
    done(null, user)
  } catch (err) {
    done(err, false)
  }
}))

passport.use(new LocalStrategy(localOptions, async (email, password, done) => {
  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user) return done(null, false)
    const isPasswordCorrect = await user.checkPassword(password)
    if (!isPasswordCorrect) return done(null, false)
    done(null, user)
  } catch (err) {
    done(err, false)
  }
}))
