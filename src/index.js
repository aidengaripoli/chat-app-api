const app = require('./app')
const http = require('./sockets')

const { PORT } = process.env

let server = null

app.on('ready', () => {
  console.log('INDEX: APP READY')
  // server = app.listen(PORT, () => console.log(`API listening on ${PORT}`))
  http.listen(PORT, () => console.log(`API listening on ${PORT}`))
})

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
  console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString())
  shutdown()
})

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
  console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString())
  shutdown()
})

// shut down server
function shutdown () {
  server.close(function onServerClosed (err) {
    if (err) {
      console.error(err)
      process.exitCode = 1
    }
    process.exit()
  })
}
