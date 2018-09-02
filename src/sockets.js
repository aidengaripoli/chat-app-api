const app = require('./app')

const http = require('http').Server(app)
const io = require('socket.io')(http, { transports: ['websocket', 'polling'] })
const redisAdapter = require('socket.io-redis')

io.adapter(redisAdapter({ host: 'redis', port: 6379 }))

let userCount = 0
let userIndex = 0

io.on('connection', async socket => {
  let userAdded = false
  console.log('User connected.')

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

module.exports = http
