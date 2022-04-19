const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const enforce = require('express-sslify')
const port = process.env.PORT || 3001

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(enforce.HTTPS({ trustProtoHeader: true }))

app.get('/', (req, res) => {
    res.render('index', { randomId: uuidV4() })
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

app.post('/join-room', (req, res) => {
    res.redirect(`/${req.body.roomId}`)
})

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
