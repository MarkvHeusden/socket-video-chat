const socket = io('/')
const myPeer = new Peer(undefined, {
    secure: true,
    host: 'https://socket-video-chat.herokuapp.com/',
    port: '443'
})
const mainEl = document.querySelector('main')
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(camera => {
    addVideoStream(myVideo, camera)

    myPeer.on('call', call => {
        call.answer(camera)
        const video  = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, camera)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', userId => {
    socket.emit('join-room', roomId, userId)
})

function addVideoStream(video, camera) {
    video.srcObject = camera
    video.addEventListener('loadedmetadata', () => video.play())
    mainEl.append(video)
}

function connectToNewUser(userId, camera) {
    const call = myPeer.call(userId, camera)
    const video  = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => video.remove())

    peers[userId] = call
    console.log(peers)
}