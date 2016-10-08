import Grid from './grid.js'
import AudioHandler from './audiohandler.js'
import Helpers from './helpers.js'
const tween = require('../../node_modules/gsap/src/minified/TweenMax.min.js')


/*

	TODO:
		-	* only record audio if recording is supported *
		-	remove ability to record sound until testing has finished
		-	remove ability to record if more than N number of sounds present
		-	In audiohandler, remove return from removeSound
		-	In audiohandler, add <return> to removeSound, uncomment uploadSound()
*/

function Sequencer() {
	this.grid = new Grid(this.defineGridSize())
	this.audio = new AudioHandler(this.grid.sounds.getFileNames())
	this.direction = 'col'
	this.speed = 400
	this.minSpeed = 100
	this.maxSpeed = 800
	this.speedStep = 50
	this.loopId = null
	this.iteration = 0
	this.isPlaying = false
	this.recordingEnabled = true

	this.testAbilityToRecord()
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

		let controlIds = ['minus','plus'],
			controlText = ['&#9876;','&#9935;']

		if (this.recordingEnabled) {
			controlIds = ['minus','record','plus']
			controlText = ['&#9876;','&#128519;','&#9935;']
		}

		let bpmControls = {
			containerClassName: 'bpmContainer',
			controlsContainerClassName: 'controls',
			controlIds: controlIds,
			controlText : controlText
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
			gridHeight = this.grid.canvas.height,
			halfTop = gridTop/2 - height/2,
			absoluteTop = gridTop - 85,
			setTop = Helpers.max([halfTop, absoluteTop])

		Helpers.setStyle(container, { top: Helpers.toPixels(setTop) })
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

	handleRecordButton: function() {
		if (!this.recordingEnabled) return;

		let button = document.querySelector('#record'),
			ctx = this

		tween.to(button, 1, { css: { 'opacity': '1' } })

		record.onclick = () => {

			let backdrop = document.createElement('div')

			Helpers.setStyle(backdrop,
			{
				height: '100vh',
				width: '100vw',
				zIndex: 100,
				opacity: '.7',
				position: 'fixed',
				backgroundColor: 'red'
			})
			document.body.appendChild(backdrop)

			this.recordAudio()

			setTimeout( () => {
				document.body.removeChild(backdrop)
			},2000)

			if (ctx.grid.maxNSounds - ctx.grid.sounds.bites.length === 1) {
				ctx.disableRecording()
				return
			}
		}
	},

	setupEventListeners: function() {
		this.handleResize()
		this.handlePlayButton()
		this.handleDirectionButton()
		this.handleBPMIncreaseButton()
		this.handlBPMDecreaseButton()
		this.handlePrivateButton()
		setTimeout( () => { this.handleRecordButton() }, 2500)
	},

	addSelectedClass: function(el) {
		let baseClass = el.className
		el.className+= '--selected'
		setTimeout(() => { el.className = baseClass },100)
	},

	playDummySound: function() {
		let ctx = this
		ctx.grid.canvas.addEventListener('click',() => ctx.audio.playDummySound() )
	},

	recordAudio: function() {

		let wasPlaying = this.isPlaying
		this.pause()

		let id = this.audio.recordAudio()
		setTimeout( () => {
			this.grid.sounds.createRandomizedBite(id)
			this.grid.handleElements([this.grid.sounds.bites[this.grid.sounds.bites.length-1]])
			this.grid.sounds.animateElementPopIn(this.grid.sounds.bites[this.grid.sounds.bites.length-1])

			if (wasPlaying) this.loop();

		},2000)
	},

	disableRecording: function() {
		this.recordingEnabled = false
		let button = document.querySelector('#record')
		button.innerHTML = '&#128683;'
		button.classList.add('controls--disabled')
		button.onclick = null
		button.style.opacity = '.1'
		button.style.cursor = 'not-allowed'
	},

	testAbilityToRecord: function() {
		if (!this.audio.canRecord()) this.recordingEnabled = false;
	}

}

export default Sequencer