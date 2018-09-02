const router = require('express').Router()

const usersController = require('../controllers/usersController')
const authController = require('../controllers/authController')

const { catchErrors } = require('../handlers')

router.post('/login',
  authController.authenticate('local'),
  authController.login
)

router.post('/register',
  usersController.validateRegister,
  catchErrors(usersController.register)
)

router.get('/profile',
  authController.authenticate('jwt'),
  usersController.profile
)

module.exports = router
