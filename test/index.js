const app = require('../src/app.js')
const { http } = require('../src/sockets')
const expect = require('chai').expect
const client = require('socket.io-client')
const User = require('mongoose').model('User')
const { signToken } = require('../src/helpers')

describe('tests', function () {
  before(function (done) {
    app.on('ready', function () {
      http.listen(1234, () => console.log(`API listening on ${1234}`))
      done()
    })
  })

  describe('socket.io connecion', function () {
    let socket
    let user

    beforeEach(function (done) {
      user = new User({ name: 'john', email: 'okay@example.com', password: 'password' })
      user.save().then(user => {
        socket = client.connect(`http://localhost:1234`, {
          transports: ['websocket'],
          'force new connection': true,
          'reopen delay': 0,
          'reconnection delay': 0
        })

        socket.on('connect', () => {
          console.log('TEST: socket connected.')
          const token = signToken(user)
          socket.emit('authenticate', token)
          socket.on('authenticated', userId => {
            expect(userId).to.be.equal(user._id)
            done()
          })
        })
      })
    })

    it('should connect', function (done) {
      socket.on('users_online', users => {
        expect(users).to.be.an('array')
        done()
      })
    })
  })
})
