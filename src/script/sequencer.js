import Grid from './grid.js'
import AudioHandler from './audiohandler.js'
import Helpers from './helpers.js'
const interact = require('interact.js')

function Sequencer() {
	this.grid = new Grid(this.defineGridSize())
	this.audio = new AudioHandler(this.grid.sounds.getFileNames())
	this.direction = 'col'
	this.speed = 500
	this.minSpeed = 100
	this.maxSpeed = 800
	this.speedStep = 50
	this.loopId = null
	this.iteration = 0
	this.isPlaying = false

	this.createControls()
	this.positionControls()
	this.setupEventListeners()
	this.playDummySound()	//	for proper iOS functionality
}

Sequencer.prototype = {
	constructor: Sequencer,

	defineGridSize: function() {
		let h = window.innerHeight
		if (h < 600) return { cellSize: 50, rows: 6, cols: 6 };
		return { cellSize: 50, rows: 6, cols: 6 }
	},

	loop: function() {
		this.isPlaying = true
		this.loopId = setInterval( () => {
			let cells = this.grid.getRowOrCol(this.iteration,this.direction)

			this.iteration++

			if (this.iteration > (this.grid.dimensions[this.direction + 's'] - 1)) this.iteration = 0;

			if (cells.length > 0) {
				for (let i=0;i<cells.length;i++) {
					this.audio.playSound(cells[i].containedSound.bite.filename)
					this.grid.sounds.animateElementPlaying(cells[i].containedSound)
				}
			}

		},this.speed)
	},

	pause: function() {
		clearInterval(this.loopId)
		this.isPlaying = false
	},

	changeSpeed: function(make) {
		let keepPlaying = false,
			newSpeed = 0

		if (this.isPlaying) {
			this.pause()
			keepPlaying = true
		}

		if (make === 'faster') {
			newSpeed = this.speed - this.speedStep
		} else if (make === 'slower') {
			newSpeed = this.speed + this.speedStep
		} else {
			newSpeed = this.minSpeed
		}

		if (newSpeed > this.maxSpeed) newSpeed = this.maxSpeed;
		if (newSpeed < this.minSpeed) newSpeed = this.minSpeed;

		this.speed = newSpeed

		if (keepPlaying) this.loop();
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

		let directionAndPublicControls = {
			containerClassName: 'container',
			controlsContainerClassName: 'controls',
			controlIds: ['play','direction','private'],
			controlText : ['&#9995;','&#128080;','&#128075;']
		}

		let bpmControls = {
			containerClassName: 'bpmContainer',
			controlsContainerClassName: 'controls',
			controlIds: ['minus','plus'],
			controlText : ['&#9876;','&#9935;']
		}

		const controlCreator = (props) => {
			let container = document.createElement('div'),
			controlsContainer = document.createElement('div'),
			controlIds = props.controlIds,
			controlText = props.controlText

			const elementGenerator = (ids,text,container) => {
				for (let i=0;i<ids.length;i++) {
					let el = document.createElement('p')
					el.innerHTML = text[i]
					el.id = ids[i]
					container.appendChild(el)
				}
				return container
			}

			controlsContainer = elementGenerator(controlIds,controlText,controlsContainer)
			container.className = props.containerClassName
			controlsContainer.className = props.controlsContainerClassName

			container.appendChild(controlsContainer)
			document.body.appendChild(container)
		}

		//	actually create the elements

		let allControls = [directionAndPublicControls,bpmControls]

		for (let i=0;i<allControls.length;i++) {
			controlCreator(allControls[i])
		}
	},

	positionControls: function() {
		let controls = document.querySelectorAll('p'),
			container = document.querySelector('.container'),
			bpmContainer = document.querySelector('.bpmContainer'),
			height = parseFloat(window.getComputedStyle(controls[0]).getPropertyValue('height')),
			gridTop = this.grid.position.top,
			gridHeight = this.grid.canvas.height

		// Helpers.setStyle(container,{ top: Helpers.toPixels(gridTop/2 - height/2) })
		// Helpers.setStyle(bpmContainer,{ top: Helpers.toPixels(gridTop + gridHeight + height/2) })
		Helpers.setStyle(container,{ top: Helpers.toPixels(gridTop - 85) })
		Helpers.setStyle(bpmContainer,{ top: Helpers.toPixels(gridTop + gridHeight + 20) })
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

	handlePrivateButton: function() {
		let button = document.querySelector('#private')
		button.addEventListener('click', () => {
			this.grid.socketHandler.togglePublicInput()
			this.addSelectedClass(button)

			if (!this.grid.socketHandler.ALLOW_PUBLIC_OVERRIDE) {
				document.body.style.backgroundColor = '#CCC8C8'
			} else {
				document.body.style.backgroundColor = 'white'
			}
		})
	},

	handleBPMIncreaseButton: function() {
		let button = document.querySelector('#plus')
		button.addEventListener('click', () => {
			this.changeSpeed('faster')
			this.addSelectedClass(button)
		})
	},

	handlBPMDecreaseButton: function() {
		let button = document.querySelector('#minus')
		button.addEventListener('click', () => {
			this.changeSpeed('slower')
			this.addSelectedClass(button)
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
		this.handleBPMIncreaseButton()
		this.handlBPMDecreaseButton()
		this.handlePrivateButton()
	},

	addSelectedClass: function(el) {
		let baseClass = el.className
		el.className+= '--selected'
		setTimeout(() => { el.className = baseClass },100)
	},

	playDummySound: function() {

		// TODO: change the target of the event listener to something
		// that ios recognizes as a valid trigger

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