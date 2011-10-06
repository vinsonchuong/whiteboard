var
    sanitizer = require('validator').sanitize,
    io = require('socket.io').listen(4792),
    chat = io.of('/chat')
;

function sanitize(string) {
    return sanitizer(string).entityDecode()
}

chat.on('connection', function(socket) {
    socket.on('setName', function (name) {
        name = sanitize(name);
        socket.set('name', name);
        socket.broadcast.emit('receive', {
            sender:'Server',
            message:name + ' has joined.'
        })
    });

    socket.on('send', function (message) {
        socket.get('name', function(error, name) {
            if (name)
                socket.broadcast.emit('receive', {
                    sender:name,
                    message:sanitize(message)
                })
        })
    });

    socket.on('disconnect', function() {
        socket.get('name', function(error, name) {
            if (name)
                socket.broadcast.emit('receive', {
                    sender:'Server',
                    message:name + ' has left.'
                })
        })
    });
});
