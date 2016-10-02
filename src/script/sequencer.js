import Grid from './grid.js'
import AudioHandler from './audiohandler.js'

function Sequencer() {
	this.grid = new Grid()
	this.audio = new AudioHandler(this.grid.sounds.getFileNames())
	this.direction = 'col'
	this.speed = 500
	this.loopId = null
	this.iteration = 0

	this.setupEventListeners()
}

Sequencer.prototype = {
	constructor: Sequencer,

	loop: function() {
		this.loopId = setInterval( () => {
			let cells = this.grid.getRowOrCol(this.iteration,this.direction)

			console.log(cells.length)

			this.iteration++

			if (this.iteration > this.grid.dimensions[this.direction + 's']) this.iteration = 0;

			if (cells.length > 0) {
				for (let i=0;i<cells.length;i++) {
					this.audio.playSound(cells[i].containedSound.bite.filename)
				}
			}

		},this.speed)
	},

	pause: function() {
		clearInterval(this.loopId)
	},

	toggleDirection: function() {
		this.pause()
		if (this.direction === 'col') { 
			this.direction = 'row'
		} else {
			this.direction = 'col'
		}
		this.loop()
	},

	handleResize: function() { this.grid.reposition() },

	setupEventListeners: function() {
		window.addEventListener('resize',( () => { this.handleResize() }))
	}
}

export default Sequencer