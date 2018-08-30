const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { transports: ['websocket', 'polling'] })
const redisAdapter = require('socket.io-redis')

io.adapter(redisAdapter({ host: 'redis', port: 6379 }))

app.get('/', (req, res) => {
  res.status(200).sendFile(`${__dirname}/index.html`)
})

app.get('/health', (req, res) => {
  res.status(200).end()
})

io.on('connection', socket => {
  console.log('User connected.')

  socket.on('message', message => {
    console.log(`Recevved: ${message}`)
    socket.broadcast.emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected.')
  })
})

http.listen(3000, console.log('Listening on port 3000'))
