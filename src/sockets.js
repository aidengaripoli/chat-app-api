const app = require('./app')

const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env
const User = require('mongoose').model('User')

// const Redis = require('ioredis')
// const redis = new Redis({ host: 'redis', port: 6379 })

const http = require('http').Server(app)
const io = require('socket.io')(http, {
  transports: ['websocket'] // force socketio to use websockets
})

// use redis as a message broker for websocket connections. this allows
// the api to be horizontally scaled
const redisAdapter = require('socket.io-redis')
io.adapter(redisAdapter({ host: 'redis', port: 6379 }))

// io.use((socket, next) => {})

io.on('connection', async socket => {
  // authenticate user on connection
  socket.authenticated = false
  socket.on('authenticate', token => {
    jwt.verify(token, JWT_SECRET, async function (err, payload) {
      if (err) return

      socket.authenticated = true
      let user = await User.findById(payload.subject)
      socket.user = user
      socket.emit('authenticated', user._id)

      io.of('/').adapter.clients((err, clients) => {
        if (err) return console.error(err)

        const onlineUsers = []
        clients.forEach(client => {
          onlineUsers.push(io.sockets.connected[client].user)
        })
        io.emit('online_users', onlineUsers)
      })

      socket.on('disconnect', () => {
        console.log(`User: ${socket.user._id} - ${socket.user.name} left.`)
        io.of('/').adapter.clients((err, clients) => {
          if (err) return console.error(err)

          const onlineUsers = []
          clients.forEach(client => {
            onlineUsers.push(io.sockets.connected[client].user)
          })
          io.emit('online_users', onlineUsers)
        })
      })
    })
  })

  // disconnect the socket if it fails to authenticate when it connects
  setTimeout(() => {
    if (!socket.authenticated) {
      console.log(`Disconnecting socket: ${socket.id}`)
      socket.disconnect()
    }
  }, 1000)
})

module.exports = http
