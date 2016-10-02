import Helpers from './helpers.js'

function AudioHandler(filenames) {
	let AudioContext = window.AudioContext || window.webkitAudioContext

	filenames = Helpers.uniques(filenames)

	this.filenames = []
	this.sounds = []
	this.context = new AudioContext()
	this.loadSounds(filenames)
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
	}
}

export default AudioHandler