var express = require('express')
var fs = require('fs')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('dist/'));
app.use(express.static('dist/style/'));

app.get('/sequencer/sounds/:soundName',function(req, res) {
	var filename = 'dist/static/aud/' + req.params.soundName

	fs.stat(filename, function(err, stat) {
		if (err === null) {
			res.sendFile(filename,{ root: __dirname })
			return
		}
	res.status(404).send('Not Found')
	})
	
});

app.get('/sequencer/',function(req,res) {
	res.sendFile('dist/html/index.html',{ root: __dirname })
});

io.on('connection',function(socket) {
	console.log('a user connected')

	socket.on('soundWasDocked',function(sound) {
		console.log(sound)
		io.emit('soundWasDocked',sound)
	})

})

http.listen(process.env.PORT || 3000, function() {
	console.log('listening on *:3000')
})