const socket = require('socket.io-client')()
import Helpers from './helpers.js'

function SocketHandler(grid) {

	this.socket = socket
	this.grid = grid
	this.SOCKET_CLIENT_ID = null
	this.ALLOW_PUBLIC_OVERRIDE = true
	this.N_CONCURRENT_CLIENTS = 3
	this.otherClientIds = []

	this.initializeEngine()
	this.initializePublicInput()
}

SocketHandler.prototype = {
	constructor: SocketHandler,

	togglePublicInput: function() {
		if (this.ALLOW_PUBLIC_OVERRIDE) {
			this.ALLOW_PUBLIC_OVERRIDE = false
		} else {
			this.ALLOW_PUBLIC_OVERRIDE = true
		}
	},

	initializeEngine: function() {
		this.socket.on('connect',() => this.SOCKET_CLIENT_ID = this.socket.id )
	},

	initializePublicInput: function() {
		this.socket.on('soundWasDocked',(e) => this.soundWasDocked(e) )
	},

	acceptPublicInput: function(incomingId) {
		if ((!this.ALLOW_PUBLIC_OVERRIDE) || (incomingId === this.SOCKET_CLIENT_ID)) return false
		let otherClientIds = this.otherClientIds
		return this.isACurrentOtherClientId(incomingId)
	},

	isACurrentOtherClientId: function(id) {
		return this.otherClientIds.indexOf(id) !== -1
	},

	updateOtherClientIds: function(id) {
		if ((id === this.SOCKET_CLIENT_ID) || 
			(this.otherClientIds.length === this.N_CONCURRENT_CLIENTS) ||
			(this.isACurrentOtherClientId(id)))
		{
			console.log('rejecting public input')
			return
		}

		this.otherClientIds.push(id)
		console.log('other ids are',this.otherClientIds)
	},

	soundWasDocked: function(sound) {
		let socketId = sound.socketClientId,
			elementId = sound.soundId

		this.updateOtherClientIds(socketId)
		if (!this.acceptPublicInput(socketId)) return;

		let element = this.grid.getSoundById(elementId)
		if (element.length === 0) return;
		if (!this.grid.cellIsEmpty(sound.row,sound.col)) return;

		element = element[0]
		this.grid.undock(element)		//	if already undocked, will not do anything

		let newPosition = this.grid.getCell(sound)

		Helpers.setStyle(element, {top: Helpers.toPixels(newPosition.top), left: Helpers.toPixels(newPosition.left) })
		this.grid.sounds.animateElementPopIn(element)	//	animate the popin
		this.grid.dock(element, { emit: false }) 	// do not emit the event
	}
}

export default SocketHandler