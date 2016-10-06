import Helpers from './helpers.js'
import Recorder from './recorder.js'

function AudioHandler(filenames) {
	let AudioContext = window.AudioContext || window.webkitAudioContext

	filenames = Helpers.uniques(filenames)

	this.filenames = []
	this.sounds = []
	this.context = new AudioContext()
	this.loadSounds(filenames)
	this.playedDummySound = false	//	hack to make audio work in iOS
}

AudioHandler.prototype = {

	constructor: AudioHandler,

	loadSounds: function(files) { 
		files.map( (file) => { 
			this.loadSound(file)
			this.filenames.push(file)
		} 
	)},

	loadSound: function(filename) {
		if (this.filenames.indexOf(filename) !== -1) return;

		let request = new XMLHttpRequest(),
			fullfile = '/sequencer/sounds/' + filename

		request.open('GET',fullfile)
		request.responseType = 'arraybuffer'

		request.onload = () => {
			this.context.decodeAudioData(request.response, (buffer) => { 
				this.sounds.push(buffer)
			})
		}

		request.send()
	},

	playSound: function(id) {
		let source = this.context.createBufferSource(),
			index = this.filenames.indexOf(id)

		source.buffer = this.sounds[index]
		source.connect(this.context.destination)
		source.start(0)
	},

	playDummySound: function() {
		if (this.playedDummySound) return;

		let buffer = this.context.createBuffer(1,1,22050),
			source = this.context.createBufferSource()

		source.buffer = buffer
		source.connect(this.context.destination)
		source.start(0)

		this.playedDummySound = true

		console.log('played dummy sound')
	},

	recordAudio: function() {

		let id = Math.random().toString(36).substring(7)	//	generate random id

		navigator.mediaDevices.getUserMedia({ audio: true }).then( (stream) => {
			console.log('got stream')

			let mediaStreamSource = this.context.createMediaStreamSource(stream)
			let gainNode = this.context.createGain()
			gainNode.gain.value = 10
			// mediaStreamSource.connect(this.context.destination)
			mediaStreamSource.connect(gainNode)
			gainNode.connect(this.context.destination)

			let recorder = new Recorder(gainNode)

			this.recorder = recorder
			this.recorder.record()

			setTimeout( () => {
				stream.getAudioTracks()[0].stop()
				this.recorder.getBuffer( (buffer) => {
					buffer[0] = Array.prototype.slice.call(buffer[0], 30000)
					let bufferStore = this.context.createBuffer(1, buffer[0].length, this.context.sampleRate)
					bufferStore.getChannelData(0).set(buffer[0])
					this.sounds.push(bufferStore)
					this.filenames.push(id)
					console.log('stored sounds are', this.sounds.length)
					console.log('stored files are', this.filenames)
				})
		}, 1000)
	})

	return id

	},

	getSoundByFilename: function(filename) {
		let d = 10
	},

	removeSound: function(id) {
		let index = this.filenames.indexOf(id)
		this.sounds.splice(index, 1)
		this.filenames.splice(index, 1)
		console.log('stored sounds are now', this.sounds)
		console.log('stored files are now', this.filenames)
	},

	canRecord: function() {
		try {
			let id = this.recordAudio()
			setTimeout(() => this.removeSound(id), 1500)
			return true
		} catch (err) {
			return false
		}
	},

	uploadAudio: function(filename) {
		let upload = new XMLHttpRequest(),
			fullfile = '/sequencer/save/' + filename
		upload.open('POST', fullfile, true)

		upload.send()
	}
}

export default AudioHandler