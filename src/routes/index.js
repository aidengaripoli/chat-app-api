const router = require('express').Router()

const users = require('./users')
const conversations = require('./conversations')

router.use('/user', users)
router.use('/conversations', conversations)

module.exports = router
