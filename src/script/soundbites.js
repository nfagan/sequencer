import Helpers from './helpers.js'

function SoundBites(cellSize) {
	this.container = document.createElement('div')
	this.templates = [
		{filename: 'note_e_op.mp3', color: 'blue', createN: 2 },
		{filename: 'note_c_op.mp3', color: 'red', createN: 2 },
		{filename: 'note_b_op.mp3', color: 'green', createN: 2 }
	]

	this.bites = ( () => {
		let els = []

		this.templates.map( (temp) => {
			for (let i=0;i<temp.createN;i++) {

				let styleProps = {
					top: Helpers.toPixels(Helpers.randInt(0,300)),
					left: Helpers.toPixels(Helpers.randInt(0,300)),
					position: 'absolute',
					height: Helpers.toPixels(cellSize),
					width: Helpers.toPixels(cellSize),
					backgroundColor: temp.color
				}

				let el = document.createElement('div'),
					bite = {}

				bite.filename = temp.filename
				bite.isDocked = false
				bite.cellIndex = null
				bite.size = cellSize

				Helpers.setStyle(el,styleProps)

				this.container.appendChild(el)

				el.bite = bite

				els.push(el)
			}
		})
	return els
	})();

	// add bites to the document

	document.body.appendChild(this.container)
}

SoundBites.prototype = {
	constructor: SoundBites,

	setPosition: function(el,pos) {
		Helpers.setStyle(el,{position: 'fixed', top: Helpers.toPixels(pos.top), left: Helpers.toPixels(pos.left) })
	},

	sendToBackground: function(bites) {
		bites.map( (bite) => { Helpers.setStyle(bite,{ zIndex: '-1' })})
	},

	bringToForeground: function(bites) { 
		bites.map( (bite) => { Helpers.setStyle(bite,{ zIndex: '1' })})
	},

	makeDraggable: function(e) {
		this.sendToBackground(this.bites)
		this.bringToForeground([e.target])
		window.addEventListener('mousemove',this.draggable)
	},

	makeUndraggable: function(e) {
		this.bringToForeground(this.bites)
		window.removeEventListener('mousemove',this.draggable)
	},

	draggable: function(e) {
		Helpers.setStyle(e.target,
		{
			top: Helpers.toPixels(e.clientY - Math.round(e.target.bite.size/2)),
			left: Helpers.toPixels(e.clientX - Math.round(e.target.bite.size/2)),
		})
	},

	getFileNames: function() {
		return this.bites.map( (bite) => { return bite.bite.filename })
	}
}

export default SoundBites