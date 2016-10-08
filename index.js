var express = require('express')
var fs = require('fs')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

app.use(express.static('dist/'));
app.use(express.static('dist/style/'));

app.use(bodyParser.raw({ type: 'audio/wav', limit: '50mb' }))
// app.use(bodyParser.json({ limit: '50mb' }))

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

/*
	save data sent to server
*/

app.post('/sequencer/save/:filename', function(req, res) {
	var filename = __dirname + '/playground/audio/' + req.params.filename + '.wav',
		blob = req.body
		// file = new File([blob], filename)

	// blob.lastModifiedDate = new Date()
	// blob.name = req.params.filename

	// console.log('req.body', req.body)
	// console.log(file)
	// console.log('req.body.blob is', req.body.blob)

	// fs.writeFileSync(filename, blob)
})

/*
	socket handling
*/

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