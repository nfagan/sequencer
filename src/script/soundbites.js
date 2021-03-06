import Helpers from './helpers.js'
const tween = require('../../node_modules/gsap/src/minified/TweenMax.min.js')

function SoundBites(cellSize) {
	this.container = document.createElement('div')
	this.cellSize = cellSize
	this.templates = [
		{ filename: 'perc_hi_hat.mp3', color: 'teal', createN: 1 },
		{ filename: 'perc_moondog.mp3', color: '#28FA91', createN: 2 },
		{ filename: 'perc_shaker.mp3', color: '#6E77F5', createN: 1 },
		{ filename: 'perc_kick.mp3', color: '#FA2891', createN: 3 },
		{ filename: 'perc_open_hi.mp3', color: '#F5ED6E', createN: 1 },
		{ filename: 'perc_woodblock_low.mp3', color: '#2828FA', createN: 1 },
		{ filename: 'between_friends_hi.mp3', color: 'red', createN: 1 },
		{ filename: 'between_friends.mp3', color: '#B428FA', createN: 1 },
		{ filename: 'note_c.mp3', color: '#28D7FA', createN: 2 },
		{ filename: 'note_e.mp3', color: '#B2F56E', createN: 2 },
		{ filename: 'note_a.mp3', color: 'gray', createN: 2 },
		{ filename: 'note_g.mp3', color: '#D5BAFF', createN: 2 },
		{ filename: 'celeste_piano_c_e.mp3', color: '#F09D69', createN: 1 },
		{ filename: 'celeste_piano_c.mp3', color: '#F09D69', createN: 1 },
		{ filename: 'celeste_piano_g_e.mp3', color: '#F09D69', createN: 1 }
	]

	this.bites = []
	this.createBites(this.templates)

	// add bites to the document

	document.body.appendChild(this.container)
}

SoundBites.prototype = {
	constructor: SoundBites,

	createBites: function(templates, defaultProps) {
		let count = this.bites.length,
			windowHeight = Math.round(window.innerHeight)

		templates.map( (temp) => {
			for (let i=0;i<temp.createN;i++) {

				let styleProps = {
					top: Helpers.toPixels(Helpers.randInt(0,300)),
					left: Helpers.toPixels(Helpers.randInt(0,300)),
					position: 'absolute',
					height: Helpers.toPixels(this.cellSize),
					width: Helpers.toPixels(this.cellSize),
					backgroundColor: temp.color,
					zIndex: '1'
				}

				if (defaultProps) Object.assign(styleProps, defaultProps);

				let el = document.createElement('div'),
					bite = {}

				el.className = 'soundbite'

				el.id = 'sound' + count.toString()

				bite.filename = temp.filename
				bite.color = temp.color
				bite.isDocked = false
				bite.cellIndex = null
				bite.size = this.cellSize
				bite.beganWithMouseDown = false
				bite.isSelected = false

				Helpers.setStyle(el,styleProps)

				this.container.appendChild(el)

				el.bite = bite

				this.animateRestingElement(el)

				this.bites.push(el)

				count++
			}
		})
	},

	createRandomizedBite: function(id) {
		let color = Helpers.toRGB(Helpers.randInt(0,255), Helpers.randInt(0, 255), Helpers.randInt(0, 255))
		this.createBites([{ filename: id, color: color, createN: 1 }],
			{
				top: Helpers.toPixels(window.innerHeight/2 - this.cellSize/2),
				left: Helpers.toPixels(window.innerWidth/2 - this.cellSize/2)
			 })
		this.sendToBackground(this.bites)
		this.bringToForeground([this.bites[this.bites.length-1]])
	},

	setPosition: function(el, pos) {
		Helpers.setStyle(el,
			{
				position: 'fixed', 
				top: Helpers.toPixels(pos.top),
				left: Helpers.toPixels(pos.left),
				transform: 'none'
			})
		el.setAttribute('data-x', 0)
		el.setAttribute('data-y', 0)
	},

	sendToBackground: function(bites) {
		bites.map( (bite) => { Helpers.setStyle(bite,{ zIndex: '1' }) })
	},

	bringToForeground: function(bites) { 
		bites.map( (bite) => { Helpers.setStyle(bite,{ zIndex: '2' })})
	},

	dragMoveListener: function(e) {
		let target = e.target,
        	x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx,
        	y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy

        target.style.webkitTransform =
    	target.style.transform =
      		'translate(' + x + 'px, ' + y + 'px)';

		target.setAttribute('data-x', x);
    	target.setAttribute('data-y', y);
	},

	getFileNames: function() {
		return this.bites.map( (bite) => { return bite.bite.filename })
	},

	getAllBitesExcept: function(filename) {
		return this.bites.filter( (bite) => bite.bite.filename !== filename )
	},

	clearPlayingAnimation: function(el) {
		if (!el.bite.timeline) return;
		el.bite.timeline.seek(0)
		el.bite.timeline.kill()
	},

	animateElementPlaying: function(el) {
		let tl = new TimelineMax(),
			originalColor = el.bite.color

		tl.to(el, .4, { css: { 'transform': 'scale(1.1,1.1)', 'backgroundColor': 'white' } })
			.to(el, .4, { css: { 'transform': 'scale(1,1)', 'backgroundColor': originalColor } })

		el.bite.timeline = tl
	},

	animateElementPopIn: function(el) {

		let circle = document.createElement('div')
		console.log(el.style.top)
			Helpers.setStyle(circle,
			{
				position: 'fixed',
				top: el.style.top, 
				left: el.style.left,
				borderRadius: '50%',
				borderWidth: 'thick',
				borderColor: 'black',
				opacity: '1',
				backgroundColor: 'gray',
				height: el.style.height,
				width: el.style.width
			})

		document.body.appendChild(circle)

		let tl = new TimelineMax()
		tl.to(circle, .4, { css: { 'transform': 'scale(2,2)', 'opacity': '0' } })
		setTimeout( () => document.body.removeChild(circle),400)
	},

	setSelectedStyle: function(el) {
		tween.to(el, .1, { height: el.bite.size*1.15, width: el.bite.size*1.15 })
	},

	setUnselectedStyle: function(el) { 
		tween.to(el, .1, { height: el.bite.size, width: el.bite.size })
	},

	animateRestingElement: function(el) {
		let anim = new TimelineMax(),
			amt = Helpers.randInt(1,8),
			expression = '+=.' + amt.toString()

		anim.to(el,.5,{ css: { 'borderRadius': '20%' }, yoyo: true, repeat: -1 },expression)
		el.bite.playingAnimation = anim
	},

	clearRestingAnimation: function(el) {
		el.bite.playingAnimation.seek(0)
		el.bite.playingAnimation.kill()
	},

	queryZIndices: function() {
		let zIndices = []
		this.bites.map( (bite) => { 
			let zIndex = bite.style.zIndex
			zIndices.push(zIndex)
		})
		console.log(zIndices)
	}
}

export default SoundBites


	// this.bites = ( () => {
	// 	let els = [],
	// 		count = 0,
	// 		windowHeight = Math.round(window.innerHeight)

	// 	this.templates.map( (temp) => {
	// 		for (let i=0;i<temp.createN;i++) {

	// 			let styleProps = {
	// 				top: Helpers.toPixels(Helpers.randInt(0,300)),
	// 				left: Helpers.toPixels(Helpers.randInt(0,300)),
	// 				position: 'absolute',
	// 				height: Helpers.toPixels(cellSize),
	// 				width: Helpers.toPixels(cellSize),
	// 				backgroundColor: temp.color,
	// 				zIndex: 1
	// 			}

	// 			let el = document.createElement('div'),
	// 				bite = {}

	// 			el.className = 'soundbite'

	// 			el.id = 'sound' + count.toString()

	// 			bite.filename = temp.filename
	// 			bite.color = temp.color
	// 			bite.isDocked = false
	// 			bite.cellIndex = null
	// 			bite.size = cellSize
	// 			bite.beganWithMouseDown = false
	// 			bite.isSelected = false

	// 			Helpers.setStyle(el,styleProps)

	// 			this.container.appendChild(el)

	// 			el.bite = bite

	// 			this.animateRestingElement(el)

	// 			els.push(el)

	// 			count++
	// 		}
	// 	})
	// return els
	// })();