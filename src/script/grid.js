import Helpers from './helpers.js'
import SoundBites from './soundbites.js'
const interact = require('interact.js')

function Grid(dimensions) {
	this.dimensions = dimensions

	this.canvas = ( () => {
		let canvas = document.createElement('canvas')

		canvas.id = 'canvas'
		canvas.width = this.dimensions.cellSize * this.dimensions.cols
		canvas.height = this.dimensions.cellSize * this.dimensions.rows
		canvas.style.position = 'fixed'
		canvas.style.zIndex = '0'

		document.body.appendChild(canvas)
		return canvas
	})();

	this.cells = ( () => {
		let matrix = Helpers.getMatrixRepresentation(this.dimensions.rows,this.dimensions.cols)

		let cells = matrix.map( (cell) => {
			return { top: 0, left: 0, row: cell.row, col: cell.col, isEmpty: true, containedSound: null }
		})
		return cells
	})();

	this.sounds = new SoundBites(this.dimensions.cellSize)

	this.position = Helpers.getElementCenterInViewport(this.canvas.width,this.canvas.height)

	// position the canvas, set the cell boundaries, and raw the grid

	this.reposition()
	this.draw()

	// configure event listeners

	this.handleElements()
}

Grid.prototype = {
	constructor: Grid,

	draw: function() {
		this.cells.map( (cell) => {
			let x = cell.col * this.dimensions.cellSize,
				y = cell.row * this.dimensions.cellSize,
				ctx = this.canvas.getContext('2d')

			ctx.fillStyle = Helpers.toRGB(20,200, Helpers.randInt(0,255))
			ctx.fillRect(x,y,this.dimensions.cellSize,this.dimensions.cellSize)
		})
	},

	positionCanvas: function() {
		this.position = Helpers.getElementCenterInViewport(canvas.width, canvas.height)
		Helpers.setStyle(canvas,
			{	left: Helpers.toPixels(this.position.left),
				top: Helpers.toPixels(this.position.top), 
				position: 'absolute'
			})
	},

	setCellBounds: function() {
		this.cells = this.cells.map( (cell) => {
			let x = cell.col * this.dimensions.cellSize,
				y = cell.row * this.dimensions.cellSize,
				offsetX = this.position.left,
				offsetY = this.position.top

			cell.top = y + offsetY
			cell.left = x + offsetX

			return cell
		})
	},

	isWithinGrid: function(position) {
		let gridPosition = this.position

		gridPosition.right = gridPosition.left + canvas.width
		gridPosition.bottom = gridPosition.top + canvas.height

		//	pad calculation so that we still snap to the grid when at the grid edges

		//	position is returned from getBoundingClientRect(), and must
		//	be converted to a regular object first

		let objPosition = {}

		objPosition.left = position.left + this.dimensions.cellSize/2
		objPosition.top = position.top + this.dimensions.cellSize/2

		if (objPosition.left < gridPosition.left) return false;
		if (objPosition.top < gridPosition.top) return false;
		if (objPosition.left > gridPosition.right) return false;
		if (objPosition.top > gridPosition.bottom) return false;

		return true
	},

	nearestCell: function(el) {

		var position = el.getBoundingClientRect()

		if (!this.isWithinGrid(position)) return -1;

		let cells = this.getEmptyCells()

		let min = cells.reduce( (offsets, cell, i) => {
			let x = Math.abs(position.left - cell.left),
				y = Math.abs(position.top - cell.top)

			if ((i === 0) || ((x <= offsets.x) && (y <= offsets.y))) {
				Object.assign(offsets,{x: x, y: y, row: cell.row, col: cell.col })
			}
			return offsets
		},{})

		return cells.filter( (cell) => { return cell.row === min.row & cell.col === min.col })[0]
	},

	findCell: function(closest) {
		let index = this.cells.findIndex( (cell) => {
			return closest.row === cell.row & closest.col === cell.col
		})
		return index
	},

	undock: function(el) {
		if (el.bite.isDocked === false) return;

		let index = el.bite.cellIndex

		this.cells[index].containedSound = null
		this.cells[index].isEmpty = true
	},

	dock: function(el) {
		let closest = this.nearestCell(el)

		if (closest === -1) return;
		
		let index = this.findCell(closest)

		this.cells[index].containedSound = el
		this.cells[index].isEmpty = false

		el.bite.isDocked = true
		el.bite.cellIndex = index

		this.sounds.setPosition(el,closest)
	},

	getEmptyCells: function() {
		return this.cells.filter( (cell) => { return cell.isEmpty === true })
	},

	getNonEmptyCells: function() {
		return this.cells.filter( (cell) => { return cell.isEmpty === false })
	},

	getRowOrCol: function(n, rowOrCol) {
		return this.cells.filter( (cell) => { return cell[rowOrCol] === n & !cell.isEmpty })
	},

	setContainedElementPositions: function() {
		let cells = this.getNonEmptyCells()
		if (cells.length === 0) return;
		cells.map( (cell) => this.sounds.setPosition(cell.containedSound,cell))
	},

	checkIfEmpty: function(index) {
		return this.cells[index].isEmpty
	},

	reposition: function() { this.positionCanvas(); this.setCellBounds(); this.setContainedElementPositions(); },

	// configure handling of element pickup and release from grid

	handleElements: function() {
		let bites = this.sounds.bites,
			ctx = this

		const elementPickup = (e) => {
			e.target.bite.beganWithMouseDown = true
			ctx.sounds.sendToBackground(bites)
			ctx.sounds.bringToForeground([e.target])
			ctx.sounds.setSelectedStyle(e.target)
			ctx.undock(e.target)
		}

		const elementRelease = (e) => {
			if (!e.target.bite.beganWithMouseDown) return;
			e.target.bite.beganWithMouseDown = false
			ctx.sounds.bringToForeground(bites)
			ctx.sounds.setUnselectedStyle(e.target)
			this.dock(e.target)
		}

		for (let i=0;i<bites.length;i++) {
			let drag = interact(bites[i])
				.on('down', elementPickup)
				.draggable({ enabled: true, onmove: this.sounds.dragMoveListener })
				.on('up', elementRelease)
		}
	}
}

export default Grid