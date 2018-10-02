const app = require('./app')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env
const User = require('mongoose').model('User')
const Message = require('mongoose').model('Message')
const Conversation = require('mongoose').model('Conversation')
// const index = require('./algolia')

const Redis = require('ioredis')
const redis = new Redis({ host: 'redis', port: 6379 })

const http = require('http').Server(app)
const io = require('socket.io')(http, {
  transports: ['websocket'] // force socketio to use websockets
})

// use redis as a message broker for websocket connections. this allows
// the api to be horizontally scaled
const redisAdapter = require('socket.io-redis')
io.adapter(redisAdapter({ host: 'redis', port: 6379 }))

io.on('connection', async socket => {
  // authenticate user on connection
  socket.authenticated = false

  socket.on('authenticate', token => {
    jwt.verify(token, JWT_SECRET, async function (err, payload) {
      if (err) return

      socket.authenticated = true

      // attach the user object to the socket connection
      let user = await User.findById(payload.subject)
      socket.user = user

      // notify the client that is has been authenticated
      socket.emit('authenticated', socket.user._id)

      // add new user ID to redis
      await redis.sadd('online_users', socket.user._id)
      // get all user ids from redis
      const userIds = await redis.smembers('online_users')
      // then get all user objects from DB
      const users = await User.find({ _id: { $in: userIds } })
      // emit all user objects to each client
      io.emit('online_users', users)

      // messaging
      await redis.sadd(socket.user._id, socket.id) // add socket to user set

      // receive a new message
      socket.on('send_message', async msg => {
        let message = new Message({
          conversationId: msg.conversationId,
          body: msg.body,
          user: socket.user._id
        })
        await message.save()

        message = await Message.findById(message._id).populate('user')

        // search
        // const populatedMessage = await Message.populate(message, {
        //   path: 'user',
        //   select: 'name'
        // })

        // index.addObject(populatedMessage, (err, content) => {
        //   if (err) console.error(err)
        //   console.log(`object ID: ${content}`)
        // })

        // determine which clients to send the new message to
        const conversation = await Conversation.findById(msg.conversationId)
          .populate({ path: 'participants', select: '_id' })

        for (let user of conversation.participants) {
          const socketIds = await redis.smembers(user._id)
          if (socketIds) {
            for (let socketId of socketIds) {
              if (socketId !== socket.id) {
                io.to(`${socketId}`).emit('new_message', message)
              }
            }
          }
        }
      })

      // new conversation
      socket.on('new_conversation', async conversation => {
        for (let participant of conversation.participants) {
          const socketIds = await redis.smembers(participant._id)
          if (socketIds) {
            for (let socketId of socketIds) {
              if (socketId !== socket.id) {
                io.to(`${socketId}`).emit('new_conversation', conversation)
              }
            }
          }
        }
      })

      socket.on('disconnect', async () => {
        const connectedSockets = await redis.scard(socket.user._id)
        if (connectedSockets === 1) {
          await redis.del(socket.user._id)
        }
        await redis.srem(socket.user._id, socket.id)

        // remove user ID from redis
        await redis.srem('online_users', socket.user._id)
        // get all user ids from redis
        const userIds = await redis.smembers('online_users')
        // then get all user objects from DB
        const users = await User.find({ _id: { $in: userIds } })
        // emit all user objects to each client
        io.emit('online_users', users)
      })
    })
  })

  // disconnect the socket if it fails to authenticate when it connects
  setTimeout(() => {
    if (!socket.authenticated) {
      socket.disconnect()
    }
  }, 1000)
})

module.exports = {
  http,
  io
}
