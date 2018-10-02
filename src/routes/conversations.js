const router = require('express').Router()

const authController = require('../controllers/authController')
const conversationsController = require('../controllers/conversationsController')

const { catchErrors } = require('../handlers')

router.get('/',
  authController.authenticate('jwt'),
  catchErrors(conversationsController.all)
)

router.post('/',
  authController.authenticate('jwt'),
  catchErrors(conversationsController.create)
)

module.exports = router
