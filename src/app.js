const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const cors = require('cors')
const { OK, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('http-status-codes')

const database = require('./database')

require('./models')
require('./passport')

const app = express()

const routes = require('./routes')

// - ensure the database has connected first before starting the api
// - also ensures tests do not timeout and fail
database.connect().then(() => {
  app.emit('ready')
})

if (process.env.NODE_ENV === 'production') {
  app.use(logger('common', { skip: (req, res) => res.statusCode < BAD_REQUEST }))
} else if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'))
}

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(routes)

app.get('/', (req, res, next) => {
  res.status(OK).json({ message: 'Chat App API' })
})

// Health check
app.get('/health', (req, res) => {
  res.status(200).end()
})

// Not found handler
app.use((req, res, next) => {
  res.status(NOT_FOUND).json({ message: 'Not Found' })
})

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || INTERNAL_SERVER_ERROR).json(err)
})

module.exports = app
