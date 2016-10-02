import Grid from './grid.js'
import AudioHandler from './audiohandler.js'
import Helpers from './helpers.js'

function Sequencer() {
	this.grid = new Grid()
	this.audio = new AudioHandler(this.grid.sounds.getFileNames())
	this.direction = 'col'
	this.speed = 500
	this.loopId = null
	this.iteration = 0
	this.isPlaying = false

	this.createControls()
	this.positionControls()
	this.setupEventListeners()
	this.playDummySound()
}

Sequencer.prototype = {
	constructor: Sequencer,

	loop: function() {
		this.isPlaying = true
		this.loopId = setInterval( () => {
			let cells = this.grid.getRowOrCol(this.iteration,this.direction)

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
		this.isPlaying = false
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

	createControls: function() {
		let container = document.createElement('div'),
			controlsContainer = document.createElement('div'),
			controlIds = ['play','direction','private'],
			controlText = ['&#9995;','&#128080;','&#128075;']

		for (let i=0;i<controlIds.length;i++) {
			let el = document.createElement('p')
			el.innerHTML = controlText[i]
			el.id = controlIds[i]
			controlsContainer.appendChild(el)
		}

		container.className = 'container'
		controlsContainer.className = 'controls'

		container.appendChild(controlsContainer)
		document.body.appendChild(container)
	},

	positionControls: function() {
		let controls = document.querySelectorAll('p'),
			container = document.querySelector('.container'),
			height = parseFloat(window.getComputedStyle(controls[0]).getPropertyValue('height')),
			gridTop = this.grid.position.top

		Helpers.setStyle(container,{ top: Helpers.toPixels(gridTop/2 - height/2) })
	},

	handlePlayButton: function() {
		let play = document.querySelector('#play')
		const handlePlaying = () => { this.isPlaying ? this.pause() : this.loop() }
		play.addEventListener('click', () => {
			handlePlaying()
			this.addSelectedClass(play)
	 	})
	},

	handleDirectionButton: function() {
		let direction = document.querySelector('#direction')

		direction.addEventListener('click', () => { 
			this.toggleDirection()
			this.addSelectedClass(direction)
		})
	},

	handleResize: function() { 
		window.addEventListener('resize', () => {
			this.grid.reposition() 
			this.positionControls()
		})
	},

	setupEventListeners: function() {
		this.handleResize()
		this.handlePlayButton()
		this.handleDirectionButton()
	},

	addSelectedClass: function(el) {
		let baseClass = el.className
		el.className+= '--selected'
		setTimeout(() => { el.className = baseClass },100)
	},

	playDummySound: function() {
		let ctx = this

		const dummySound = () => {
			let buffer = ctx.audio.context.createBuffer(1,1,22050),
				source = ctx.audio.context.createBufferSource()

			source.buffer = buffer
			source.connect(ctx.audio.context.destination)
			source.start(0)
		}

		if (this.playedDummySound) {
			this.grid.sounds.container.removeEventListener('mousedown',dummySound) 
			return
		}

		this.grid.sounds.container.addEventListener('mousedown',dummySound)
		this.playedDummySound = true
	}

}

export default Sequencer