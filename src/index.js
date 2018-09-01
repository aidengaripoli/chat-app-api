const express = require('express')
const logger = require('morgan')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { transports: ['websocket', 'polling'] })
const redisAdapter = require('socket.io-redis')

io.adapter(redisAdapter({ host: 'redis', port: 6379 }))

app.use(logger('dev'))

app.get('/', (req, res) => {
  res.status(200).sendFile(`${__dirname}/index.html`)
})

app.get('/health', (req, res) => {
  res.status(200).end()
})

let userCount = 0
let userIndex = 0

io.on('connection', socket => {
  let userAdded = false
  console.log('User connected.')

  // Get all messages from database and send them to users.
  // socket.emit('messages', messages)

  socket.on('addUser', username => {
    if (userAdded) { return }

    socket.user = { id: userIndex, username }
    userIndex++
    userCount++
    userAdded = true
    socket.emit('login', { userCount })

    socket.broadcast.emit('userJoined', {
      user: socket.user,
      userCount
    })
  })

  socket.on('newMessage', message => {
    console.log(`Received: ${message} from user: ${socket.user.username}`)
    // Save the new message to the database
    // messages.push(message)
    socket.broadcast.emit('message', {
      user: socket.user,
      message
    })
  })

  socket.on('typing', () => {
    socket.broadcast.emit('typing', { user: socket.user })
  })

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping', { user: socket.user })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected.')
  })
})

http.listen(3000, console.log('Listening on port 3000'))
