/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _sequencer = __webpack_require__(1);

	var _sequencer2 = _interopRequireDefault(_sequencer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var sequencer = new _sequencer2.default();

	// :)

	sequencer.loop();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _grid = __webpack_require__(2);

	var _grid2 = _interopRequireDefault(_grid);

	var _audiohandler = __webpack_require__(57);

	var _audiohandler2 = _interopRequireDefault(_audiohandler);

	var _helpers = __webpack_require__(3);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var interact = __webpack_require__(55);

	function Sequencer() {
		this.grid = new _grid2.default(this.defineGridSize());
		this.audio = new _audiohandler2.default(this.grid.sounds.getFileNames());
		this.direction = 'col';
		this.speed = 500;
		this.minSpeed = 100;
		this.maxSpeed = 800;
		this.speedStep = 50;
		this.loopId = null;
		this.iteration = 0;
		this.isPlaying = false;

		this.createControls();
		this.positionControls();
		this.setupEventListeners();
		this.playDummySound(); //	for proper iOS functionality
	}

	Sequencer.prototype = {
		constructor: Sequencer,

		defineGridSize: function defineGridSize() {
			var h = window.innerHeight;
			if (h < 600) return { cellSize: 50, rows: 6, cols: 6 };
			return { cellSize: 50, rows: 7, cols: 6 };
		},

		loop: function loop() {
			var _this = this;

			this.isPlaying = true;
			this.loopId = setInterval(function () {
				var cells = _this.grid.getRowOrCol(_this.iteration, _this.direction);

				_this.iteration++;

				if (_this.iteration > _this.grid.dimensions[_this.direction + 's'] - 1) _this.iteration = 0;

				if (cells.length > 0) {
					for (var i = 0; i < cells.length; i++) {
						_this.audio.playSound(cells[i].containedSound.bite.filename);
						_this.grid.sounds.animateElementPlaying(cells[i].containedSound);
					}
				}
			}, this.speed);
		},

		pause: function pause() {
			clearInterval(this.loopId);
			this.isPlaying = false;
		},

		changeSpeed: function changeSpeed(make) {
			var keepPlaying = false,
			    newSpeed = 0;

			if (this.isPlaying) {
				this.pause();
				keepPlaying = true;
			}

			if (make === 'faster') {
				newSpeed = this.speed - this.speedStep;
			} else if (make === 'slower') {
				newSpeed = this.speed + this.speedStep;
			} else {
				newSpeed = this.minSpeed;
			}

			if (newSpeed > this.maxSpeed) newSpeed = this.maxSpeed;
			if (newSpeed < this.minSpeed) newSpeed = this.minSpeed;

			this.speed = newSpeed;

			if (keepPlaying) this.loop();
		},

		toggleDirection: function toggleDirection() {
			this.pause();
			if (this.direction === 'col') {
				this.direction = 'row';
			} else {
				this.direction = 'col';
			}
			this.loop();
		},

		createControls: function createControls() {

			var directionAndPublicControls = {
				containerClassName: 'container',
				controlsContainerClassName: 'controls',
				controlIds: ['play', 'direction', 'private'],
				controlText: ['&#9995;', '&#128080;', '&#128075;']
			};

			var bpmControls = {
				containerClassName: 'bpmContainer',
				controlsContainerClassName: 'controls',
				controlIds: ['minus', 'plus'],
				controlText: ['&#9876;', '&#9935;']
			};

			var controlCreator = function controlCreator(props) {
				var container = document.createElement('div'),
				    controlsContainer = document.createElement('div'),
				    controlIds = props.controlIds,
				    controlText = props.controlText;

				var elementGenerator = function elementGenerator(ids, text, container) {
					for (var i = 0; i < ids.length; i++) {
						var el = document.createElement('p');
						el.innerHTML = text[i];
						el.id = ids[i];
						container.appendChild(el);
					}
					return container;
				};

				controlsContainer = elementGenerator(controlIds, controlText, controlsContainer);
				container.className = props.containerClassName;
				controlsContainer.className = props.controlsContainerClassName;

				container.appendChild(controlsContainer);
				document.body.appendChild(container);
			};

			//	actually create the elements

			var allControls = [directionAndPublicControls, bpmControls];

			for (var i = 0; i < allControls.length; i++) {
				controlCreator(allControls[i]);
			}
		},

		positionControls: function positionControls() {
			var controls = document.querySelectorAll('p'),
			    container = document.querySelector('.container'),
			    bpmContainer = document.querySelector('.bpmContainer'),
			    height = parseFloat(window.getComputedStyle(controls[0]).getPropertyValue('height')),
			    gridTop = this.grid.position.top,
			    gridHeight = this.grid.canvas.height,
			    halfTop = gridTop / 2 - height / 2,
			    absoluteTop = gridTop - 85,
			    setTop = _helpers2.default.max([halfTop, absoluteTop]);

			_helpers2.default.setStyle(container, { top: _helpers2.default.toPixels(setTop) });
			// Helpers.setStyle(container,{ top: Helpers.toPixels(gridTop/2 - height/2) })
			// Helpers.setStyle(bpmContainer,{ top: Helpers.toPixels(gridTop + gridHeight + height/2) })
			// Helpers.setStyle(container,{ top: Helpers.toPixels(gridTop - 85) })
			_helpers2.default.setStyle(bpmContainer, { top: _helpers2.default.toPixels(gridTop + gridHeight + 20) });
		},

		handlePlayButton: function handlePlayButton() {
			var _this2 = this;

			var play = document.querySelector('#play');
			var handlePlaying = function handlePlaying() {
				_this2.isPlaying ? _this2.pause() : _this2.loop();
			};
			play.addEventListener('click', function () {
				handlePlaying();
				_this2.addSelectedClass(play);
			});
		},

		handleDirectionButton: function handleDirectionButton() {
			var _this3 = this;

			var direction = document.querySelector('#direction');

			direction.addEventListener('click', function () {
				_this3.toggleDirection();
				_this3.addSelectedClass(direction);
			});
		},

		handlePrivateButton: function handlePrivateButton() {
			var _this4 = this;

			var button = document.querySelector('#private');
			button.addEventListener('click', function () {
				_this4.grid.socketHandler.togglePublicInput();
				_this4.addSelectedClass(button);

				if (!_this4.grid.socketHandler.ALLOW_PUBLIC_OVERRIDE) {
					document.body.style.backgroundColor = '#CCC8C8';
				} else {
					document.body.style.backgroundColor = 'white';
				}
			});
		},

		handleBPMIncreaseButton: function handleBPMIncreaseButton() {
			var _this5 = this;

			var button = document.querySelector('#plus');
			button.addEventListener('click', function () {
				_this5.changeSpeed('faster');
				_this5.addSelectedClass(button);
			});
		},

		handlBPMDecreaseButton: function handlBPMDecreaseButton() {
			var _this6 = this;

			var button = document.querySelector('#minus');
			button.addEventListener('click', function () {
				_this6.changeSpeed('slower');
				_this6.addSelectedClass(button);
			});
		},

		handleResize: function handleResize() {
			var _this7 = this;

			window.addEventListener('resize', function () {
				_this7.grid.reposition();
				_this7.positionControls();
			});
		},

		setupEventListeners: function setupEventListeners() {
			this.handleResize();
			this.handlePlayButton();
			this.handleDirectionButton();
			this.handleBPMIncreaseButton();
			this.handlBPMDecreaseButton();
			this.handlePrivateButton();
		},

		addSelectedClass: function addSelectedClass(el) {
			var baseClass = el.className;
			el.className += '--selected';
			setTimeout(function () {
				el.className = baseClass;
			}, 100);
		},

		playDummySound: function playDummySound() {

			// TODO: change the target of the event listener to something
			// that ios recognizes as a valid trigger

			var ctx = this;

			var dummySound = function dummySound() {
				var buffer = ctx.audio.context.createBuffer(1, 1, 22050),
				    source = ctx.audio.context.createBufferSource();

				source.buffer = buffer;
				source.connect(ctx.audio.context.destination);
				source.start(0);
			};

			if (this.playedDummySound) {
				this.grid.sounds.container.removeEventListener('mousedown', dummySound);
				return;
			}

			this.grid.sounds.container.addEventListener('mousedown', dummySound);
			this.playedDummySound = true;
		}

	};

	exports.default = Sequencer;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _helpers = __webpack_require__(3);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _soundbites = __webpack_require__(4);

	var _soundbites2 = _interopRequireDefault(_soundbites);

	var _sockethandler = __webpack_require__(5);

	var _sockethandler2 = _interopRequireDefault(_sockethandler);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var interact = __webpack_require__(55);
	var tween = __webpack_require__(56);

	function Grid(dimensions) {
		var _this = this;

		this.dimensions = dimensions;

		this.socketHandler = new _sockethandler2.default(this);

		this.canvas = function () {
			var canvas = document.createElement('canvas');

			canvas.id = 'canvas';
			canvas.width = _this.dimensions.cellSize * _this.dimensions.cols;
			canvas.height = _this.dimensions.cellSize * _this.dimensions.rows;
			canvas.style.position = 'fixed';
			canvas.style.zIndex = '0';

			document.body.appendChild(canvas);
			return canvas;
		}();

		this.cells = function () {
			var matrix = _helpers2.default.getMatrixRepresentation(_this.dimensions.rows, _this.dimensions.cols);

			var cells = matrix.map(function (cell) {
				return { top: 0, left: 0, row: cell.row, col: cell.col, isEmpty: true, containedSound: null };
			});
			return cells;
		}();

		this.sounds = new _soundbites2.default(this.dimensions.cellSize);

		this.position = _helpers2.default.getElementCenterInViewport(this.canvas.width, this.canvas.height);

		// position the canvas, set the cell boundaries, and raw the grid

		this.reposition();
		this.draw();

		// configure event listeners

		this.handleElements();
	}

	Grid.prototype = {
		constructor: Grid,

		draw: function draw() {
			var _this2 = this;

			this.cells.map(function (cell) {
				var x = cell.col * _this2.dimensions.cellSize,
				    y = cell.row * _this2.dimensions.cellSize,
				    ctx = _this2.canvas.getContext('2d');

				ctx.fillStyle = _helpers2.default.toRGB(20, 200, _helpers2.default.randInt(0, 255));
				ctx.fillRect(x, y, _this2.dimensions.cellSize, _this2.dimensions.cellSize);
			});
		},

		positionCanvas: function positionCanvas() {
			this.position = _helpers2.default.getElementCenterInViewport(canvas.width, canvas.height);
			_helpers2.default.setStyle(canvas, { left: _helpers2.default.toPixels(this.position.left),
				top: _helpers2.default.toPixels(this.position.top),
				position: 'absolute'
			});
		},

		setCellBounds: function setCellBounds() {
			var _this3 = this;

			this.cells = this.cells.map(function (cell) {
				var x = cell.col * _this3.dimensions.cellSize,
				    y = cell.row * _this3.dimensions.cellSize,
				    offsetX = _this3.position.left,
				    offsetY = _this3.position.top;

				cell.top = y + offsetY;
				cell.left = x + offsetX;

				return cell;
			});
		},

		isWithinGrid: function isWithinGrid(position) {
			var gridPosition = this.position;

			gridPosition.right = gridPosition.left + canvas.width;
			gridPosition.bottom = gridPosition.top + canvas.height;

			//	pad calculation so that we still snap to the grid when at the grid edges

			//	position is returned from getBoundingClientRect(), and must
			//	be converted to a regular object first

			var objPosition = {};

			objPosition.left = position.left + this.dimensions.cellSize / 2;
			objPosition.top = position.top + this.dimensions.cellSize / 2;

			if (objPosition.left < gridPosition.left) return false;
			if (objPosition.top < gridPosition.top) return false;
			if (objPosition.left > gridPosition.right) return false;
			if (objPosition.top > gridPosition.bottom) return false;

			return true;
		},

		nearestCell: function nearestCell(el) {

			var position = el.getBoundingClientRect();

			if (!this.isWithinGrid(position)) return -1;

			var cells = this.getEmptyCells();

			var min = cells.reduce(function (offsets, cell, i) {
				var x = Math.abs(position.left - cell.left),
				    y = Math.abs(position.top - cell.top);

				if (i === 0 || x <= offsets.x && y <= offsets.y) {
					Object.assign(offsets, { x: x, y: y, row: cell.row, col: cell.col });
				}
				return offsets;
			}, {});

			return cells.filter(function (cell) {
				return cell.row === min.row & cell.col === min.col;
			})[0];
		},

		findCell: function findCell(closest) {
			var index = this.cells.findIndex(function (cell) {
				return closest.row === cell.row & closest.col === cell.col;
			});
			return index;
		},

		getCell: function getCell(element) {
			var index = this.findCell(element);
			return this.cells[index];
		},

		undock: function undock(el) {
			if (el.bite.isDocked === false) return;

			var index = el.bite.cellIndex;

			this.cells[index].containedSound = null;
			this.cells[index].isEmpty = true;
		},

		dock: function dock(el, props) {
			var defaults = { emit: true };

			if (props) {
				props = Object.assign(defaults, props);
			} else {
				props = defaults;
			}

			var closest = this.nearestCell(el);

			if (closest === -1) return;

			var index = this.findCell(closest);

			this.cells[index].containedSound = el;
			this.cells[index].isEmpty = false;

			el.bite.isDocked = true;
			el.bite.cellIndex = index;

			this.sounds.setPosition(el, closest);

			// don't emit if the emitter source is the current client

			if (!props.emit) return;

			var row = this.cells[index].row,
			    col = this.cells[index].col;

			this.socketHandler.socket.emit('soundWasDocked', {
				soundId: el.id,
				row: row,
				col: col,
				socketClientId: this.socketHandler.SOCKET_CLIENT_ID
			});
		},

		getEmptyCells: function getEmptyCells() {
			return this.cells.filter(function (cell) {
				return cell.isEmpty === true;
			});
		},

		getNonEmptyCells: function getNonEmptyCells() {
			return this.cells.filter(function (cell) {
				return cell.isEmpty === false;
			});
		},

		getRowOrCol: function getRowOrCol(n, rowOrCol) {
			return this.cells.filter(function (cell) {
				return cell[rowOrCol] === n & !cell.isEmpty;
			});
		},

		getSoundById: function getSoundById(id) {
			return this.sounds.bites.filter(function (sound) {
				return sound.id === id;
			});
		},

		setContainedElementPositions: function setContainedElementPositions() {
			var _this4 = this;

			var cells = this.getNonEmptyCells();
			if (cells.length === 0) return;
			cells.map(function (cell) {
				return _this4.sounds.setPosition(cell.containedSound, cell);
			});
		},

		cellIsEmpty: function cellIsEmpty(row, col) {
			if (row > this.dimensions.row || col > this.dimensions.col) return null;
			return this.cells.filter(function (cell) {
				return cell.row === row & cell.col === col;
			})[0].isEmpty;
		},

		reposition: function reposition() {
			this.positionCanvas();this.setCellBounds();this.setContainedElementPositions();
		},

		// configure handling of element pickup and release from grid

		handleElements: function handleElements() {
			var _this5 = this;

			var bites = this.sounds.bites,
			    ctx = this;

			var elementPickup = function elementPickup(e) {
				ctx.sounds.clearPlayingAnimation(e.target);
				e.target.bite.beganWithMouseDown = true;
				e.target.bite.isSelected = true;
				ctx.sounds.sendToBackground(bites);
				ctx.sounds.bringToForeground([e.target]);
				ctx.sounds.setSelectedStyle(e.target);
				ctx.undock(e.target);
			};

			var elementRelease = function elementRelease(e) {
				if (!e.target.bite.beganWithMouseDown) return;
				e.target.bite.beganWithMouseDown = false;
				e.target.bite.isSelected = false;
				ctx.sounds.bringToForeground(bites);
				ctx.sounds.setUnselectedStyle(e.target);
				_this5.dock(e.target);
			};

			for (var i = 0; i < bites.length; i++) {
				var drag = interact(bites[i]).on('down', elementPickup).draggable({ enabled: true, onmove: this.sounds.dragMoveListener }).on('up', elementRelease);
			}
		}
	};

	exports.default = Grid;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var Helpers = function () {

		return {

			setStyle: function setStyle(el, properties) {
				var keys = Object.keys(properties);
				keys.map(function (key) {
					el.style[key] = properties[key];
				});
			},

			toPixels: function toPixels(number) {
				return number.toString() + 'px';
			},

			randInt: function randInt(min, max) {
				return Math.round(Math.random() * (max - min) + min);
			},

			toRGB: function toRGB(r, g, b) {
				return 'rgb(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ')';
			},

			getElementCenterInViewport: function getElementCenterInViewport(width, height) {
				var w = window.innerWidth,
				    h = window.innerHeight;
				return { top: (h - height) / 2, left: (w - width) / 2 };
			},

			getMatrixRepresentation: function getMatrixRepresentation(rows, cols) {
				var matrix = [];
				for (var i = 0; i < rows; i++) {
					for (var k = 0; k < cols; k++) {
						matrix.push({ row: i, col: k });
					}
				}
				return matrix;
			},

			getElementPosition: function getElementPosition(el) {
				return {
					// top: window.getComputedStyle
				};
			},

			min: function min(arr) {
				if (arr.length === 0) return;
				if (arr.length === 1) return arr[0];

				var min = arr[0];

				for (var i = 1; i < arr.length; i++) {
					min = Math.min(min, arr[i]);
				}
				return min;
			},

			max: function max(arr) {
				if (arr.length === 0) return;
				if (arr.length === 1) return arr[0];

				var max = arr[0];

				for (var i = 1; i < arr.length; i++) {
					max = Math.max(max, arr[i]);
				}
				return max;
			},

			uniques: function uniques(arr) {
				return arr.filter(function (val, i, self) {
					return self.indexOf(val) === i;
				});
			}
		};
	}();

	exports.default = Helpers;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _helpers = __webpack_require__(3);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var tween = __webpack_require__(56);

	function SoundBites(cellSize) {
		var _this = this;

		this.container = document.createElement('div');
		this.templates = [{ filename: 'note_e_op.mp3', color: 'teal', createN: 2 }, { filename: 'note_c_op.mp3', color: '#28FA91', createN: 2 }, { filename: 'note_g_op.mp3', color: '#6E77F5', createN: 2 }, { filename: 'perc_kick.mp3', color: '#FA2891', createN: 3 }, { filename: 'perc_open_hi.mp3', color: '#F5ED6E', createN: 2 }];

		this.bites = function () {
			var els = [],
			    count = 0;

			_this.templates.map(function (temp) {
				for (var i = 0; i < temp.createN; i++) {

					var styleProps = {
						top: _helpers2.default.toPixels(_helpers2.default.randInt(0, 300)),
						left: _helpers2.default.toPixels(_helpers2.default.randInt(0, 300)),
						position: 'absolute',
						height: _helpers2.default.toPixels(cellSize),
						width: _helpers2.default.toPixels(cellSize),
						backgroundColor: temp.color,
						zIndex: 1
					};

					var el = document.createElement('div'),
					    bite = {};

					el.className = 'soundbite';

					el.id = 'sound' + count.toString();

					bite.filename = temp.filename;
					bite.color = temp.color;
					bite.isDocked = false;
					bite.cellIndex = null;
					bite.size = cellSize;
					bite.beganWithMouseDown = false;
					bite.isSelected = false;

					_helpers2.default.setStyle(el, styleProps);

					_this.container.appendChild(el);

					el.bite = bite;

					els.push(el);

					count++;
				}
			});
			return els;
		}();

		// add bites to the document

		document.body.appendChild(this.container);
	}

	SoundBites.prototype = {
		constructor: SoundBites,

		setPosition: function setPosition(el, pos) {
			_helpers2.default.setStyle(el, {
				position: 'fixed',
				top: _helpers2.default.toPixels(pos.top),
				left: _helpers2.default.toPixels(pos.left),
				transform: 'none'
			});
			el.setAttribute('data-x', 0);
			el.setAttribute('data-y', 0);
		},

		sendToBackground: function sendToBackground(bites) {
			bites.map(function (bite) {
				_helpers2.default.setStyle(bite, { zIndex: '1' });
			});
		},

		bringToForeground: function bringToForeground(bites) {
			bites.map(function (bite) {
				_helpers2.default.setStyle(bite, { zIndex: '2' });
			});
		},

		dragMoveListener: function dragMoveListener(e) {
			var target = e.target,
			    x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx,
			    y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;

			target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);
		},

		getFileNames: function getFileNames() {
			return this.bites.map(function (bite) {
				return bite.bite.filename;
			});
		},

		clearPlayingAnimation: function clearPlayingAnimation(el) {
			if (!el.bite.timeline) return;
			el.bite.timeline.seek(0);
			el.bite.timeline.kill();
		},

		animateElementPlaying: function animateElementPlaying(el) {
			var tl = new TimelineMax(),
			    originalColor = el.bite.color;

			tl.to(el, .4, { css: { 'transform': 'scale(1.1,1.1)', 'backgroundColor': 'white' } }).to(el, .4, { css: { 'transform': 'scale(1,1)', 'backgroundColor': originalColor } });

			el.bite.timeline = tl;
		},

		animateElementPopIn: function animateElementPopIn(el) {

			var circle = document.createElement('div');
			console.log(el.style.top);
			_helpers2.default.setStyle(circle, {
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
			});

			document.body.appendChild(circle);

			var tl = new TimelineMax();
			tl.to(circle, .4, { css: { 'transform': 'scale(2,2)', 'opacity': '0' } });
			setTimeout(function () {
				return document.body.removeChild(circle);
			}, 400);
		},

		setSelectedStyle: function setSelectedStyle(el) {
			tween.to(el, .1, { height: el.bite.size * 1.15, width: el.bite.size * 1.15 });
		},
		setUnselectedStyle: function setUnselectedStyle(el) {
			tween.to(el, .1, { height: el.bite.size, width: el.bite.size });
		}
	};

	exports.default = SoundBites;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _helpers = __webpack_require__(3);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var socket = __webpack_require__(6)();


	function SocketHandler(grid) {

		this.socket = socket;
		this.grid = grid;
		this.SOCKET_CLIENT_ID = null;
		this.ALLOW_PUBLIC_OVERRIDE = true;
		this.N_CONCURRENT_CLIENTS = 3;
		this.otherClientIds = [];

		this.initializeEngine();
		this.initializePublicInput();
	}

	SocketHandler.prototype = {
		constructor: SocketHandler,

		togglePublicInput: function togglePublicInput() {
			if (this.ALLOW_PUBLIC_OVERRIDE) {
				this.ALLOW_PUBLIC_OVERRIDE = false;
			} else {
				this.ALLOW_PUBLIC_OVERRIDE = true;
			}
		},

		initializeEngine: function initializeEngine() {
			var _this = this;

			this.socket.on('connect', function () {
				return _this.SOCKET_CLIENT_ID = _this.socket.id;
			});
		},

		initializePublicInput: function initializePublicInput() {
			var _this2 = this;

			this.socket.on('soundWasDocked', function (e) {
				return _this2.soundWasDocked(e);
			});
		},

		acceptPublicInput: function acceptPublicInput(incomingId) {
			if (!this.ALLOW_PUBLIC_OVERRIDE || incomingId === this.SOCKET_CLIENT_ID) return false;
			var otherClientIds = this.otherClientIds;
			return this.isACurrentOtherClientId(incomingId);
		},

		isACurrentOtherClientId: function isACurrentOtherClientId(id) {
			return this.otherClientIds.indexOf(id) !== -1;
		},

		updateOtherClientIds: function updateOtherClientIds(id) {
			if (id === this.SOCKET_CLIENT_ID || this.otherClientIds.length === this.N_CONCURRENT_CLIENTS || this.isACurrentOtherClientId(id)) {
				console.log('rejecting public input');
				return;
			}

			this.otherClientIds.push(id);
			console.log('other ids are', this.otherClientIds);
		},

		soundWasDocked: function soundWasDocked(sound) {
			var socketId = sound.socketClientId,
			    elementId = sound.soundId;

			this.updateOtherClientIds(socketId);
			if (!this.acceptPublicInput(socketId)) return;

			var element = this.grid.getSoundById(elementId);
			if (element.length === 0) return;
			if (!this.grid.cellIsEmpty(sound.row, sound.col)) return;

			element = element[0];

			if (element.bite.isSelected) return;

			this.grid.undock(element); //	if already undocked, will not do anything

			var newPosition = this.grid.getCell(sound);

			_helpers2.default.setStyle(element, { top: _helpers2.default.toPixels(newPosition.top), left: _helpers2.default.toPixels(newPosition.left) });
			this.grid.sounds.animateElementPopIn(element); //	animate the popin
			this.grid.dock(element, { emit: false }); // do not emit the event
		}
	};

	exports.default = SocketHandler;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var url = __webpack_require__(7);
	var parser = __webpack_require__(12);
	var Manager = __webpack_require__(20);
	var debug = __webpack_require__(9)('socket.io-client');

	/**
	 * Module exports.
	 */

	module.exports = exports = lookup;

	/**
	 * Managers cache.
	 */

	var cache = exports.managers = {};

	/**
	 * Looks up an existing `Manager` for multiplexing.
	 * If the user summons:
	 *
	 *   `io('http://localhost/a');`
	 *   `io('http://localhost/b');`
	 *
	 * We reuse the existing instance based on same scheme/port/host,
	 * and we initialize sockets for each namespace.
	 *
	 * @api public
	 */

	function lookup(uri, opts) {
	  if (typeof uri == 'object') {
	    opts = uri;
	    uri = undefined;
	  }

	  opts = opts || {};

	  var parsed = url(uri);
	  var source = parsed.source;
	  var id = parsed.id;
	  var path = parsed.path;
	  var sameNamespace = cache[id] && path in cache[id].nsps;
	  var newConnection = opts.forceNew || opts['force new connection'] ||
	                      false === opts.multiplex || sameNamespace;

	  var io;

	  if (newConnection) {
	    debug('ignoring socket cache for %s', source);
	    io = Manager(source, opts);
	  } else {
	    if (!cache[id]) {
	      debug('new io instance for %s', source);
	      cache[id] = Manager(source, opts);
	    }
	    io = cache[id];
	  }

	  return io.socket(parsed.path);
	}

	/**
	 * Protocol version.
	 *
	 * @api public
	 */

	exports.protocol = parser.protocol;

	/**
	 * `connect`.
	 *
	 * @param {String} uri
	 * @api public
	 */

	exports.connect = lookup;

	/**
	 * Expose constructors for standalone build.
	 *
	 * @api public
	 */

	exports.Manager = __webpack_require__(20);
	exports.Socket = __webpack_require__(47);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module dependencies.
	 */

	var parseuri = __webpack_require__(8);
	var debug = __webpack_require__(9)('socket.io-client:url');

	/**
	 * Module exports.
	 */

	module.exports = url;

	/**
	 * URL parser.
	 *
	 * @param {String} url
	 * @param {Object} An object meant to mimic window.location.
	 *                 Defaults to window.location.
	 * @api public
	 */

	function url(uri, loc){
	  var obj = uri;

	  // default to window.location
	  var loc = loc || global.location;
	  if (null == uri) uri = loc.protocol + '//' + loc.host;

	  // relative path support
	  if ('string' == typeof uri) {
	    if ('/' == uri.charAt(0)) {
	      if ('/' == uri.charAt(1)) {
	        uri = loc.protocol + uri;
	      } else {
	        uri = loc.host + uri;
	      }
	    }

	    if (!/^(https?|wss?):\/\//.test(uri)) {
	      debug('protocol-less url %s', uri);
	      if ('undefined' != typeof loc) {
	        uri = loc.protocol + '//' + uri;
	      } else {
	        uri = 'https://' + uri;
	      }
	    }

	    // parse
	    debug('parse %s', uri);
	    obj = parseuri(uri);
	  }

	  // make sure we treat `localhost:80` and `localhost` equally
	  if (!obj.port) {
	    if (/^(http|ws)$/.test(obj.protocol)) {
	      obj.port = '80';
	    }
	    else if (/^(http|ws)s$/.test(obj.protocol)) {
	      obj.port = '443';
	    }
	  }

	  obj.path = obj.path || '/';

	  var ipv6 = obj.host.indexOf(':') !== -1;
	  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

	  // define unique id
	  obj.id = obj.protocol + '://' + host + ':' + obj.port;
	  // define href
	  obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

	  return obj;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * Parses an URI
	 *
	 * @author Steven Levithan <stevenlevithan.com> (MIT license)
	 * @api private
	 */

	var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

	var parts = [
	    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
	];

	module.exports = function parseuri(str) {
	    var src = str,
	        b = str.indexOf('['),
	        e = str.indexOf(']');

	    if (b != -1 && e != -1) {
	        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
	    }

	    var m = re.exec(str || ''),
	        uri = {},
	        i = 14;

	    while (i--) {
	        uri[parts[i]] = m[i] || '';
	    }

	    if (b != -1 && e != -1) {
	        uri.source = src;
	        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
	        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
	        uri.ipv6uri = true;
	    }

	    return uri;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(10);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(11);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var debug = __webpack_require__(9)('socket.io-parser');
	var json = __webpack_require__(13);
	var isArray = __webpack_require__(16);
	var Emitter = __webpack_require__(17);
	var binary = __webpack_require__(18);
	var isBuf = __webpack_require__(19);

	/**
	 * Protocol version.
	 *
	 * @api public
	 */

	exports.protocol = 4;

	/**
	 * Packet types.
	 *
	 * @api public
	 */

	exports.types = [
	  'CONNECT',
	  'DISCONNECT',
	  'EVENT',
	  'ACK',
	  'ERROR',
	  'BINARY_EVENT',
	  'BINARY_ACK'
	];

	/**
	 * Packet type `connect`.
	 *
	 * @api public
	 */

	exports.CONNECT = 0;

	/**
	 * Packet type `disconnect`.
	 *
	 * @api public
	 */

	exports.DISCONNECT = 1;

	/**
	 * Packet type `event`.
	 *
	 * @api public
	 */

	exports.EVENT = 2;

	/**
	 * Packet type `ack`.
	 *
	 * @api public
	 */

	exports.ACK = 3;

	/**
	 * Packet type `error`.
	 *
	 * @api public
	 */

	exports.ERROR = 4;

	/**
	 * Packet type 'binary event'
	 *
	 * @api public
	 */

	exports.BINARY_EVENT = 5;

	/**
	 * Packet type `binary ack`. For acks with binary arguments.
	 *
	 * @api public
	 */

	exports.BINARY_ACK = 6;

	/**
	 * Encoder constructor.
	 *
	 * @api public
	 */

	exports.Encoder = Encoder;

	/**
	 * Decoder constructor.
	 *
	 * @api public
	 */

	exports.Decoder = Decoder;

	/**
	 * A socket.io Encoder instance
	 *
	 * @api public
	 */

	function Encoder() {}

	/**
	 * Encode a packet as a single string if non-binary, or as a
	 * buffer sequence, depending on packet type.
	 *
	 * @param {Object} obj - packet object
	 * @param {Function} callback - function to handle encodings (likely engine.write)
	 * @return Calls callback with Array of encodings
	 * @api public
	 */

	Encoder.prototype.encode = function(obj, callback){
	  debug('encoding packet %j', obj);

	  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	    encodeAsBinary(obj, callback);
	  }
	  else {
	    var encoding = encodeAsString(obj);
	    callback([encoding]);
	  }
	};

	/**
	 * Encode packet as string.
	 *
	 * @param {Object} packet
	 * @return {String} encoded
	 * @api private
	 */

	function encodeAsString(obj) {
	  var str = '';
	  var nsp = false;

	  // first is type
	  str += obj.type;

	  // attachments if we have them
	  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	    str += obj.attachments;
	    str += '-';
	  }

	  // if we have a namespace other than `/`
	  // we append it followed by a comma `,`
	  if (obj.nsp && '/' != obj.nsp) {
	    nsp = true;
	    str += obj.nsp;
	  }

	  // immediately followed by the id
	  if (null != obj.id) {
	    if (nsp) {
	      str += ',';
	      nsp = false;
	    }
	    str += obj.id;
	  }

	  // json data
	  if (null != obj.data) {
	    if (nsp) str += ',';
	    str += json.stringify(obj.data);
	  }

	  debug('encoded %j as %s', obj, str);
	  return str;
	}

	/**
	 * Encode packet as 'buffer sequence' by removing blobs, and
	 * deconstructing packet into object with placeholders and
	 * a list of buffers.
	 *
	 * @param {Object} packet
	 * @return {Buffer} encoded
	 * @api private
	 */

	function encodeAsBinary(obj, callback) {

	  function writeEncoding(bloblessData) {
	    var deconstruction = binary.deconstructPacket(bloblessData);
	    var pack = encodeAsString(deconstruction.packet);
	    var buffers = deconstruction.buffers;

	    buffers.unshift(pack); // add packet info to beginning of data list
	    callback(buffers); // write all the buffers
	  }

	  binary.removeBlobs(obj, writeEncoding);
	}

	/**
	 * A socket.io Decoder instance
	 *
	 * @return {Object} decoder
	 * @api public
	 */

	function Decoder() {
	  this.reconstructor = null;
	}

	/**
	 * Mix in `Emitter` with Decoder.
	 */

	Emitter(Decoder.prototype);

	/**
	 * Decodes an ecoded packet string into packet JSON.
	 *
	 * @param {String} obj - encoded packet
	 * @return {Object} packet
	 * @api public
	 */

	Decoder.prototype.add = function(obj) {
	  var packet;
	  if ('string' == typeof obj) {
	    packet = decodeString(obj);
	    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
	      this.reconstructor = new BinaryReconstructor(packet);

	      // no attachments, labeled binary but no binary data to follow
	      if (this.reconstructor.reconPack.attachments === 0) {
	        this.emit('decoded', packet);
	      }
	    } else { // non-binary full packet
	      this.emit('decoded', packet);
	    }
	  }
	  else if (isBuf(obj) || obj.base64) { // raw binary data
	    if (!this.reconstructor) {
	      throw new Error('got binary data when not reconstructing a packet');
	    } else {
	      packet = this.reconstructor.takeBinaryData(obj);
	      if (packet) { // received final buffer
	        this.reconstructor = null;
	        this.emit('decoded', packet);
	      }
	    }
	  }
	  else {
	    throw new Error('Unknown type: ' + obj);
	  }
	};

	/**
	 * Decode a packet String (JSON data)
	 *
	 * @param {String} str
	 * @return {Object} packet
	 * @api private
	 */

	function decodeString(str) {
	  var p = {};
	  var i = 0;

	  // look up type
	  p.type = Number(str.charAt(0));
	  if (null == exports.types[p.type]) return error();

	  // look up attachments if type binary
	  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
	    var buf = '';
	    while (str.charAt(++i) != '-') {
	      buf += str.charAt(i);
	      if (i == str.length) break;
	    }
	    if (buf != Number(buf) || str.charAt(i) != '-') {
	      throw new Error('Illegal attachments');
	    }
	    p.attachments = Number(buf);
	  }

	  // look up namespace (if any)
	  if ('/' == str.charAt(i + 1)) {
	    p.nsp = '';
	    while (++i) {
	      var c = str.charAt(i);
	      if (',' == c) break;
	      p.nsp += c;
	      if (i == str.length) break;
	    }
	  } else {
	    p.nsp = '/';
	  }

	  // look up id
	  var next = str.charAt(i + 1);
	  if ('' !== next && Number(next) == next) {
	    p.id = '';
	    while (++i) {
	      var c = str.charAt(i);
	      if (null == c || Number(c) != c) {
	        --i;
	        break;
	      }
	      p.id += str.charAt(i);
	      if (i == str.length) break;
	    }
	    p.id = Number(p.id);
	  }

	  // look up json data
	  if (str.charAt(++i)) {
	    try {
	      p.data = json.parse(str.substr(i));
	    } catch(e){
	      return error();
	    }
	  }

	  debug('decoded %s as %j', str, p);
	  return p;
	}

	/**
	 * Deallocates a parser's resources
	 *
	 * @api public
	 */

	Decoder.prototype.destroy = function() {
	  if (this.reconstructor) {
	    this.reconstructor.finishedReconstruction();
	  }
	};

	/**
	 * A manager of a binary event's 'buffer sequence'. Should
	 * be constructed whenever a packet of type BINARY_EVENT is
	 * decoded.
	 *
	 * @param {Object} packet
	 * @return {BinaryReconstructor} initialized reconstructor
	 * @api private
	 */

	function BinaryReconstructor(packet) {
	  this.reconPack = packet;
	  this.buffers = [];
	}

	/**
	 * Method to be called when binary data received from connection
	 * after a BINARY_EVENT packet.
	 *
	 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
	 * @return {null | Object} returns null if more binary data is expected or
	 *   a reconstructed packet object if all buffers have been received.
	 * @api private
	 */

	BinaryReconstructor.prototype.takeBinaryData = function(binData) {
	  this.buffers.push(binData);
	  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
	    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
	    this.finishedReconstruction();
	    return packet;
	  }
	  return null;
	};

	/**
	 * Cleans up binary packet reconstruction variables.
	 *
	 * @api private
	 */

	BinaryReconstructor.prototype.finishedReconstruction = function() {
	  this.reconPack = null;
	  this.buffers = [];
	};

	function error(data){
	  return {
	    type: exports.ERROR,
	    data: 'parser error'
	  };
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
	;(function () {
	  // Detect the `define` function exposed by asynchronous module loaders. The
	  // strict `define` check is necessary for compatibility with `r.js`.
	  var isLoader = "function" === "function" && __webpack_require__(15);

	  // A set of types used to distinguish objects from primitives.
	  var objectTypes = {
	    "function": true,
	    "object": true
	  };

	  // Detect the `exports` object exposed by CommonJS implementations.
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  // Use the `global` object exposed by Node (including Browserify via
	  // `insert-module-globals`), Narwhal, and Ringo as the default context,
	  // and the `window` object in browsers. Rhino exports a `global` function
	  // instead.
	  var root = objectTypes[typeof window] && window || this,
	      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

	  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
	    root = freeGlobal;
	  }

	  // Public: Initializes JSON 3 using the given `context` object, attaching the
	  // `stringify` and `parse` functions to the specified `exports` object.
	  function runInContext(context, exports) {
	    context || (context = root["Object"]());
	    exports || (exports = root["Object"]());

	    // Native constructor aliases.
	    var Number = context["Number"] || root["Number"],
	        String = context["String"] || root["String"],
	        Object = context["Object"] || root["Object"],
	        Date = context["Date"] || root["Date"],
	        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
	        TypeError = context["TypeError"] || root["TypeError"],
	        Math = context["Math"] || root["Math"],
	        nativeJSON = context["JSON"] || root["JSON"];

	    // Delegate to the native `stringify` and `parse` implementations.
	    if (typeof nativeJSON == "object" && nativeJSON) {
	      exports.stringify = nativeJSON.stringify;
	      exports.parse = nativeJSON.parse;
	    }

	    // Convenience aliases.
	    var objectProto = Object.prototype,
	        getClass = objectProto.toString,
	        isProperty, forEach, undef;

	    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
	    var isExtended = new Date(-3509827334573292);
	    try {
	      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
	      // results for certain dates in Opera >= 10.53.
	      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
	        // Safari < 2.0.2 stores the internal millisecond time value correctly,
	        // but clips the values returned by the date methods to the range of
	        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
	        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
	    } catch (exception) {}

	    // Internal: Determines whether the native `JSON.stringify` and `parse`
	    // implementations are spec-compliant. Based on work by Ken Snyder.
	    function has(name) {
	      if (has[name] !== undef) {
	        // Return cached feature test result.
	        return has[name];
	      }
	      var isSupported;
	      if (name == "bug-string-char-index") {
	        // IE <= 7 doesn't support accessing string characters using square
	        // bracket notation. IE 8 only supports this for primitives.
	        isSupported = "a"[0] != "a";
	      } else if (name == "json") {
	        // Indicates whether both `JSON.stringify` and `JSON.parse` are
	        // supported.
	        isSupported = has("json-stringify") && has("json-parse");
	      } else {
	        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
	        // Test `JSON.stringify`.
	        if (name == "json-stringify") {
	          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
	          if (stringifySupported) {
	            // A test function object with a custom `toJSON` method.
	            (value = function () {
	              return 1;
	            }).toJSON = value;
	            try {
	              stringifySupported =
	                // Firefox 3.1b1 and b2 serialize string, number, and boolean
	                // primitives as object literals.
	                stringify(0) === "0" &&
	                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
	                // literals.
	                stringify(new Number()) === "0" &&
	                stringify(new String()) == '""' &&
	                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
	                // does not define a canonical JSON representation (this applies to
	                // objects with `toJSON` properties as well, *unless* they are nested
	                // within an object or array).
	                stringify(getClass) === undef &&
	                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
	                // FF 3.1b3 pass this test.
	                stringify(undef) === undef &&
	                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
	                // respectively, if the value is omitted entirely.
	                stringify() === undef &&
	                // FF 3.1b1, 2 throw an error if the given value is not a number,
	                // string, array, object, Boolean, or `null` literal. This applies to
	                // objects with custom `toJSON` methods as well, unless they are nested
	                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
	                // methods entirely.
	                stringify(value) === "1" &&
	                stringify([value]) == "[1]" &&
	                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
	                // `"[null]"`.
	                stringify([undef]) == "[null]" &&
	                // YUI 3.0.0b1 fails to serialize `null` literals.
	                stringify(null) == "null" &&
	                // FF 3.1b1, 2 halts serialization if an array contains a function:
	                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
	                // elides non-JSON values from objects and arrays, unless they
	                // define custom `toJSON` methods.
	                stringify([undef, getClass, null]) == "[null,null,null]" &&
	                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
	                // where character escape codes are expected (e.g., `\b` => `\u0008`).
	                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
	                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
	                stringify(null, value) === "1" &&
	                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
	                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
	                // serialize extended years.
	                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
	                // The milliseconds are optional in ES 5, but required in 5.1.
	                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
	                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
	                // four-digit years instead of six-digit years. Credits: @Yaffle.
	                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
	                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
	                // values less than 1000. Credits: @Yaffle.
	                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
	            } catch (exception) {
	              stringifySupported = false;
	            }
	          }
	          isSupported = stringifySupported;
	        }
	        // Test `JSON.parse`.
	        if (name == "json-parse") {
	          var parse = exports.parse;
	          if (typeof parse == "function") {
	            try {
	              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
	              // Conforming implementations should also coerce the initial argument to
	              // a string prior to parsing.
	              if (parse("0") === 0 && !parse(false)) {
	                // Simple parsing test.
	                value = parse(serialized);
	                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
	                if (parseSupported) {
	                  try {
	                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
	                    parseSupported = !parse('"\t"');
	                  } catch (exception) {}
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
	                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
	                      // certain octal literals.
	                      parseSupported = parse("01") !== 1;
	                    } catch (exception) {}
	                  }
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
	                      // points. These environments, along with FF 3.1b1 and 2,
	                      // also allow trailing commas in JSON objects and arrays.
	                      parseSupported = parse("1.") !== 1;
	                    } catch (exception) {}
	                  }
	                }
	              }
	            } catch (exception) {
	              parseSupported = false;
	            }
	          }
	          isSupported = parseSupported;
	        }
	      }
	      return has[name] = !!isSupported;
	    }

	    if (!has("json")) {
	      // Common `[[Class]]` name aliases.
	      var functionClass = "[object Function]",
	          dateClass = "[object Date]",
	          numberClass = "[object Number]",
	          stringClass = "[object String]",
	          arrayClass = "[object Array]",
	          booleanClass = "[object Boolean]";

	      // Detect incomplete support for accessing string characters by index.
	      var charIndexBuggy = has("bug-string-char-index");

	      // Define additional utility methods if the `Date` methods are buggy.
	      if (!isExtended) {
	        var floor = Math.floor;
	        // A mapping between the months of the year and the number of days between
	        // January 1st and the first of the respective month.
	        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	        // Internal: Calculates the number of days between the Unix epoch and the
	        // first day of the given month.
	        var getDay = function (year, month) {
	          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
	        };
	      }

	      // Internal: Determines if a property is a direct property of the given
	      // object. Delegates to the native `Object#hasOwnProperty` method.
	      if (!(isProperty = objectProto.hasOwnProperty)) {
	        isProperty = function (property) {
	          var members = {}, constructor;
	          if ((members.__proto__ = null, members.__proto__ = {
	            // The *proto* property cannot be set multiple times in recent
	            // versions of Firefox and SeaMonkey.
	            "toString": 1
	          }, members).toString != getClass) {
	            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
	            // supports the mutable *proto* property.
	            isProperty = function (property) {
	              // Capture and break the object's prototype chain (see section 8.6.2
	              // of the ES 5.1 spec). The parenthesized expression prevents an
	              // unsafe transformation by the Closure Compiler.
	              var original = this.__proto__, result = property in (this.__proto__ = null, this);
	              // Restore the original prototype chain.
	              this.__proto__ = original;
	              return result;
	            };
	          } else {
	            // Capture a reference to the top-level `Object` constructor.
	            constructor = members.constructor;
	            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
	            // other environments.
	            isProperty = function (property) {
	              var parent = (this.constructor || constructor).prototype;
	              return property in this && !(property in parent && this[property] === parent[property]);
	            };
	          }
	          members = null;
	          return isProperty.call(this, property);
	        };
	      }

	      // Internal: Normalizes the `for...in` iteration algorithm across
	      // environments. Each enumerated key is yielded to a `callback` function.
	      forEach = function (object, callback) {
	        var size = 0, Properties, members, property;

	        // Tests for bugs in the current environment's `for...in` algorithm. The
	        // `valueOf` property inherits the non-enumerable flag from
	        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
	        (Properties = function () {
	          this.valueOf = 0;
	        }).prototype.valueOf = 0;

	        // Iterate over a new instance of the `Properties` class.
	        members = new Properties();
	        for (property in members) {
	          // Ignore all properties inherited from `Object.prototype`.
	          if (isProperty.call(members, property)) {
	            size++;
	          }
	        }
	        Properties = members = null;

	        // Normalize the iteration algorithm.
	        if (!size) {
	          // A list of non-enumerable properties inherited from `Object.prototype`.
	          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
	          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
	          // properties.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, length;
	            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
	            for (property in object) {
	              // Gecko <= 1.0 enumerates the `prototype` property of functions under
	              // certain conditions; IE does not.
	              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for each non-enumerable property.
	            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
	          };
	        } else if (size == 2) {
	          // Safari <= 2.0.4 enumerates shadowed properties twice.
	          forEach = function (object, callback) {
	            // Create a set of iterated properties.
	            var members = {}, isFunction = getClass.call(object) == functionClass, property;
	            for (property in object) {
	              // Store each property name to prevent double enumeration. The
	              // `prototype` property of functions is not enumerated due to cross-
	              // environment inconsistencies.
	              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	          };
	        } else {
	          // No bugs detected; use the standard `for...in` algorithm.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
	            for (property in object) {
	              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for the `constructor` property due to
	            // cross-environment inconsistencies.
	            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
	              callback(property);
	            }
	          };
	        }
	        return forEach(object, callback);
	      };

	      // Public: Serializes a JavaScript `value` as a JSON string. The optional
	      // `filter` argument may specify either a function that alters how object and
	      // array members are serialized, or an array of strings and numbers that
	      // indicates which properties should be serialized. The optional `width`
	      // argument may be either a string or number that specifies the indentation
	      // level of the output.
	      if (!has("json-stringify")) {
	        // Internal: A map of control characters and their escaped equivalents.
	        var Escapes = {
	          92: "\\\\",
	          34: '\\"',
	          8: "\\b",
	          12: "\\f",
	          10: "\\n",
	          13: "\\r",
	          9: "\\t"
	        };

	        // Internal: Converts `value` into a zero-padded string such that its
	        // length is at least equal to `width`. The `width` must be <= 6.
	        var leadingZeroes = "000000";
	        var toPaddedString = function (width, value) {
	          // The `|| 0` expression is necessary to work around a bug in
	          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
	          return (leadingZeroes + (value || 0)).slice(-width);
	        };

	        // Internal: Double-quotes a string `value`, replacing all ASCII control
	        // characters (characters with code unit values between 0 and 31) with
	        // their escaped equivalents. This is an implementation of the
	        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
	        var unicodePrefix = "\\u00";
	        var quote = function (value) {
	          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
	          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
	          for (; index < length; index++) {
	            var charCode = value.charCodeAt(index);
	            // If the character is a control character, append its Unicode or
	            // shorthand escape sequence; otherwise, append the character as-is.
	            switch (charCode) {
	              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
	                result += Escapes[charCode];
	                break;
	              default:
	                if (charCode < 32) {
	                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
	                  break;
	                }
	                result += useCharIndex ? symbols[index] : value.charAt(index);
	            }
	          }
	          return result + '"';
	        };

	        // Internal: Recursively serializes an object. Implements the
	        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
	        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
	          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	          try {
	            // Necessary for host object support.
	            value = object[property];
	          } catch (exception) {}
	          if (typeof value == "object" && value) {
	            className = getClass.call(value);
	            if (className == dateClass && !isProperty.call(value, "toJSON")) {
	              if (value > -1 / 0 && value < 1 / 0) {
	                // Dates are serialized according to the `Date#toJSON` method
	                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
	                // for the ISO 8601 date time string format.
	                if (getDay) {
	                  // Manually compute the year, month, date, hours, minutes,
	                  // seconds, and milliseconds if the `getUTC*` methods are
	                  // buggy. Adapted from @Yaffle's `date-shim` project.
	                  date = floor(value / 864e5);
	                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
	                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
	                  date = 1 + date - getDay(year, month);
	                  // The `time` value specifies the time within the day (see ES
	                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
	                  // to compute `A modulo B`, as the `%` operator does not
	                  // correspond to the `modulo` operation for negative numbers.
	                  time = (value % 864e5 + 864e5) % 864e5;
	                  // The hours, minutes, seconds, and milliseconds are obtained by
	                  // decomposing the time within the day. See section 15.9.1.10.
	                  hours = floor(time / 36e5) % 24;
	                  minutes = floor(time / 6e4) % 60;
	                  seconds = floor(time / 1e3) % 60;
	                  milliseconds = time % 1e3;
	                } else {
	                  year = value.getUTCFullYear();
	                  month = value.getUTCMonth();
	                  date = value.getUTCDate();
	                  hours = value.getUTCHours();
	                  minutes = value.getUTCMinutes();
	                  seconds = value.getUTCSeconds();
	                  milliseconds = value.getUTCMilliseconds();
	                }
	                // Serialize extended years correctly.
	                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
	                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
	                  // Months, dates, hours, minutes, and seconds should have two
	                  // digits; milliseconds should have three.
	                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
	                  // Milliseconds are optional in ES 5.0, but required in 5.1.
	                  "." + toPaddedString(3, milliseconds) + "Z";
	              } else {
	                value = null;
	              }
	            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
	              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
	              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
	              // ignores all `toJSON` methods on these objects unless they are
	              // defined directly on an instance.
	              value = value.toJSON(property);
	            }
	          }
	          if (callback) {
	            // If a replacement function was provided, call it to obtain the value
	            // for serialization.
	            value = callback.call(object, property, value);
	          }
	          if (value === null) {
	            return "null";
	          }
	          className = getClass.call(value);
	          if (className == booleanClass) {
	            // Booleans are represented literally.
	            return "" + value;
	          } else if (className == numberClass) {
	            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
	            // `"null"`.
	            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
	          } else if (className == stringClass) {
	            // Strings are double-quoted and escaped.
	            return quote("" + value);
	          }
	          // Recursively serialize objects and arrays.
	          if (typeof value == "object") {
	            // Check for cyclic structures. This is a linear search; performance
	            // is inversely proportional to the number of unique nested objects.
	            for (length = stack.length; length--;) {
	              if (stack[length] === value) {
	                // Cyclic structures cannot be serialized by `JSON.stringify`.
	                throw TypeError();
	              }
	            }
	            // Add the object to the stack of traversed objects.
	            stack.push(value);
	            results = [];
	            // Save the current indentation level and indent one additional level.
	            prefix = indentation;
	            indentation += whitespace;
	            if (className == arrayClass) {
	              // Recursively serialize array elements.
	              for (index = 0, length = value.length; index < length; index++) {
	                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
	                results.push(element === undef ? "null" : element);
	              }
	              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
	            } else {
	              // Recursively serialize object members. Members are selected from
	              // either a user-specified list of property names, or the object
	              // itself.
	              forEach(properties || value, function (property) {
	                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
	                if (element !== undef) {
	                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
	                  // is not the empty string, let `member` {quote(property) + ":"}
	                  // be the concatenation of `member` and the `space` character."
	                  // The "`space` character" refers to the literal space
	                  // character, not the `space` {width} argument provided to
	                  // `JSON.stringify`.
	                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
	                }
	              });
	              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
	            }
	            // Remove the object from the traversed object stack.
	            stack.pop();
	            return result;
	          }
	        };

	        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
	        exports.stringify = function (source, filter, width) {
	          var whitespace, callback, properties, className;
	          if (objectTypes[typeof filter] && filter) {
	            if ((className = getClass.call(filter)) == functionClass) {
	              callback = filter;
	            } else if (className == arrayClass) {
	              // Convert the property names array into a makeshift set.
	              properties = {};
	              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
	            }
	          }
	          if (width) {
	            if ((className = getClass.call(width)) == numberClass) {
	              // Convert the `width` to an integer and create a string containing
	              // `width` number of space characters.
	              if ((width -= width % 1) > 0) {
	                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
	              }
	            } else if (className == stringClass) {
	              whitespace = width.length <= 10 ? width : width.slice(0, 10);
	            }
	          }
	          // Opera <= 7.54u2 discards the values associated with empty string keys
	          // (`""`) only if they are used directly within an object member list
	          // (e.g., `!("" in { "": 1})`).
	          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
	        };
	      }

	      // Public: Parses a JSON source string.
	      if (!has("json-parse")) {
	        var fromCharCode = String.fromCharCode;

	        // Internal: A map of escaped control characters and their unescaped
	        // equivalents.
	        var Unescapes = {
	          92: "\\",
	          34: '"',
	          47: "/",
	          98: "\b",
	          116: "\t",
	          110: "\n",
	          102: "\f",
	          114: "\r"
	        };

	        // Internal: Stores the parser state.
	        var Index, Source;

	        // Internal: Resets the parser state and throws a `SyntaxError`.
	        var abort = function () {
	          Index = Source = null;
	          throw SyntaxError();
	        };

	        // Internal: Returns the next token, or `"$"` if the parser has reached
	        // the end of the source string. A token may be a string, number, `null`
	        // literal, or Boolean literal.
	        var lex = function () {
	          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
	          while (Index < length) {
	            charCode = source.charCodeAt(Index);
	            switch (charCode) {
	              case 9: case 10: case 13: case 32:
	                // Skip whitespace tokens, including tabs, carriage returns, line
	                // feeds, and space characters.
	                Index++;
	                break;
	              case 123: case 125: case 91: case 93: case 58: case 44:
	                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
	                // the current position.
	                value = charIndexBuggy ? source.charAt(Index) : source[Index];
	                Index++;
	                return value;
	              case 34:
	                // `"` delimits a JSON string; advance to the next character and
	                // begin parsing the string. String tokens are prefixed with the
	                // sentinel `@` character to distinguish them from punctuators and
	                // end-of-string tokens.
	                for (value = "@", Index++; Index < length;) {
	                  charCode = source.charCodeAt(Index);
	                  if (charCode < 32) {
	                    // Unescaped ASCII control characters (those with a code unit
	                    // less than the space character) are not permitted.
	                    abort();
	                  } else if (charCode == 92) {
	                    // A reverse solidus (`\`) marks the beginning of an escaped
	                    // control character (including `"`, `\`, and `/`) or Unicode
	                    // escape sequence.
	                    charCode = source.charCodeAt(++Index);
	                    switch (charCode) {
	                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
	                        // Revive escaped control characters.
	                        value += Unescapes[charCode];
	                        Index++;
	                        break;
	                      case 117:
	                        // `\u` marks the beginning of a Unicode escape sequence.
	                        // Advance to the first character and validate the
	                        // four-digit code point.
	                        begin = ++Index;
	                        for (position = Index + 4; Index < position; Index++) {
	                          charCode = source.charCodeAt(Index);
	                          // A valid sequence comprises four hexdigits (case-
	                          // insensitive) that form a single hexadecimal value.
	                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
	                            // Invalid Unicode escape sequence.
	                            abort();
	                          }
	                        }
	                        // Revive the escaped character.
	                        value += fromCharCode("0x" + source.slice(begin, Index));
	                        break;
	                      default:
	                        // Invalid escape sequence.
	                        abort();
	                    }
	                  } else {
	                    if (charCode == 34) {
	                      // An unescaped double-quote character marks the end of the
	                      // string.
	                      break;
	                    }
	                    charCode = source.charCodeAt(Index);
	                    begin = Index;
	                    // Optimize for the common case where a string is valid.
	                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
	                      charCode = source.charCodeAt(++Index);
	                    }
	                    // Append the string as-is.
	                    value += source.slice(begin, Index);
	                  }
	                }
	                if (source.charCodeAt(Index) == 34) {
	                  // Advance to the next character and return the revived string.
	                  Index++;
	                  return value;
	                }
	                // Unterminated string.
	                abort();
	              default:
	                // Parse numbers and literals.
	                begin = Index;
	                // Advance past the negative sign, if one is specified.
	                if (charCode == 45) {
	                  isSigned = true;
	                  charCode = source.charCodeAt(++Index);
	                }
	                // Parse an integer or floating-point value.
	                if (charCode >= 48 && charCode <= 57) {
	                  // Leading zeroes are interpreted as octal literals.
	                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
	                    // Illegal octal literal.
	                    abort();
	                  }
	                  isSigned = false;
	                  // Parse the integer component.
	                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
	                  // Floats cannot contain a leading decimal point; however, this
	                  // case is already accounted for by the parser.
	                  if (source.charCodeAt(Index) == 46) {
	                    position = ++Index;
	                    // Parse the decimal component.
	                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal trailing decimal.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Parse exponents. The `e` denoting the exponent is
	                  // case-insensitive.
	                  charCode = source.charCodeAt(Index);
	                  if (charCode == 101 || charCode == 69) {
	                    charCode = source.charCodeAt(++Index);
	                    // Skip past the sign following the exponent, if one is
	                    // specified.
	                    if (charCode == 43 || charCode == 45) {
	                      Index++;
	                    }
	                    // Parse the exponential component.
	                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal empty exponent.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Coerce the parsed value to a JavaScript number.
	                  return +source.slice(begin, Index);
	                }
	                // A negative sign may only precede numbers.
	                if (isSigned) {
	                  abort();
	                }
	                // `true`, `false`, and `null` literals.
	                if (source.slice(Index, Index + 4) == "true") {
	                  Index += 4;
	                  return true;
	                } else if (source.slice(Index, Index + 5) == "false") {
	                  Index += 5;
	                  return false;
	                } else if (source.slice(Index, Index + 4) == "null") {
	                  Index += 4;
	                  return null;
	                }
	                // Unrecognized token.
	                abort();
	            }
	          }
	          // Return the sentinel `$` character if the parser has reached the end
	          // of the source string.
	          return "$";
	        };

	        // Internal: Parses a JSON `value` token.
	        var get = function (value) {
	          var results, hasMembers;
	          if (value == "$") {
	            // Unexpected end of input.
	            abort();
	          }
	          if (typeof value == "string") {
	            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
	              // Remove the sentinel `@` character.
	              return value.slice(1);
	            }
	            // Parse object and array literals.
	            if (value == "[") {
	              // Parses a JSON array, returning a new JavaScript array.
	              results = [];
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing square bracket marks the end of the array literal.
	                if (value == "]") {
	                  break;
	                }
	                // If the array literal contains elements, the current token
	                // should be a comma separating the previous element from the
	                // next.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "]") {
	                      // Unexpected trailing `,` in array literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each array element.
	                    abort();
	                  }
	                }
	                // Elisions and leading commas are not permitted.
	                if (value == ",") {
	                  abort();
	                }
	                results.push(get(value));
	              }
	              return results;
	            } else if (value == "{") {
	              // Parses a JSON object, returning a new JavaScript object.
	              results = {};
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing curly brace marks the end of the object literal.
	                if (value == "}") {
	                  break;
	                }
	                // If the object literal contains members, the current token
	                // should be a comma separator.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "}") {
	                      // Unexpected trailing `,` in object literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each object member.
	                    abort();
	                  }
	                }
	                // Leading commas are not permitted, object property names must be
	                // double-quoted strings, and a `:` must separate each property
	                // name and value.
	                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
	                  abort();
	                }
	                results[value.slice(1)] = get(lex());
	              }
	              return results;
	            }
	            // Unexpected token encountered.
	            abort();
	          }
	          return value;
	        };

	        // Internal: Updates a traversed object member.
	        var update = function (source, property, callback) {
	          var element = walk(source, property, callback);
	          if (element === undef) {
	            delete source[property];
	          } else {
	            source[property] = element;
	          }
	        };

	        // Internal: Recursively traverses a parsed JSON object, invoking the
	        // `callback` function for each value. This is an implementation of the
	        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
	        var walk = function (source, property, callback) {
	          var value = source[property], length;
	          if (typeof value == "object" && value) {
	            // `forEach` can't be used to traverse an array in Opera <= 8.54
	            // because its `Object#hasOwnProperty` implementation returns `false`
	            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
	            if (getClass.call(value) == arrayClass) {
	              for (length = value.length; length--;) {
	                update(value, length, callback);
	              }
	            } else {
	              forEach(value, function (property) {
	                update(value, property, callback);
	              });
	            }
	          }
	          return callback.call(source, property, value);
	        };

	        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
	        exports.parse = function (source, callback) {
	          var result, value;
	          Index = 0;
	          Source = "" + source;
	          result = get(lex());
	          // If a JSON string contains multiple tokens, it is invalid.
	          if (lex() != "$") {
	            abort();
	          }
	          // Reset the parser state.
	          Index = Source = null;
	          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
	        };
	      }
	    }

	    exports["runInContext"] = runInContext;
	    return exports;
	  }

	  if (freeExports && !isLoader) {
	    // Export for CommonJS environments.
	    runInContext(root, freeExports);
	  } else {
	    // Export for web browsers and JavaScript engines.
	    var nativeJSON = root.JSON,
	        previousJSON = root["JSON3"],
	        isRestored = false;

	    var JSON3 = runInContext(root, (root["JSON3"] = {
	      // Public: Restores the original value of the global `JSON` object and
	      // returns a reference to the `JSON3` object.
	      "noConflict": function () {
	        if (!isRestored) {
	          isRestored = true;
	          root.JSON = nativeJSON;
	          root["JSON3"] = previousJSON;
	          nativeJSON = previousJSON = null;
	        }
	        return JSON3;
	      }
	    }));

	    root.JSON = {
	      "parse": JSON3.parse,
	      "stringify": JSON3.stringify
	    };
	  }

	  // Export for asynchronous module loaders.
	  if (isLoader) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return JSON3;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)(module), (function() { return this; }())))

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks[event] = this._callbacks[event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  var self = this;
	  this._callbacks = this._callbacks || {};

	  function on() {
	    self.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks[event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks[event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks[event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks[event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*global Blob,File*/

	/**
	 * Module requirements
	 */

	var isArray = __webpack_require__(16);
	var isBuf = __webpack_require__(19);

	/**
	 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
	 * Anything with blobs or files should be fed through removeBlobs before coming
	 * here.
	 *
	 * @param {Object} packet - socket.io event packet
	 * @return {Object} with deconstructed packet and list of buffers
	 * @api public
	 */

	exports.deconstructPacket = function(packet){
	  var buffers = [];
	  var packetData = packet.data;

	  function _deconstructPacket(data) {
	    if (!data) return data;

	    if (isBuf(data)) {
	      var placeholder = { _placeholder: true, num: buffers.length };
	      buffers.push(data);
	      return placeholder;
	    } else if (isArray(data)) {
	      var newData = new Array(data.length);
	      for (var i = 0; i < data.length; i++) {
	        newData[i] = _deconstructPacket(data[i]);
	      }
	      return newData;
	    } else if ('object' == typeof data && !(data instanceof Date)) {
	      var newData = {};
	      for (var key in data) {
	        newData[key] = _deconstructPacket(data[key]);
	      }
	      return newData;
	    }
	    return data;
	  }

	  var pack = packet;
	  pack.data = _deconstructPacket(packetData);
	  pack.attachments = buffers.length; // number of binary 'attachments'
	  return {packet: pack, buffers: buffers};
	};

	/**
	 * Reconstructs a binary packet from its placeholder packet and buffers
	 *
	 * @param {Object} packet - event packet with placeholders
	 * @param {Array} buffers - binary buffers to put in placeholder positions
	 * @return {Object} reconstructed packet
	 * @api public
	 */

	exports.reconstructPacket = function(packet, buffers) {
	  var curPlaceHolder = 0;

	  function _reconstructPacket(data) {
	    if (data && data._placeholder) {
	      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
	      return buf;
	    } else if (isArray(data)) {
	      for (var i = 0; i < data.length; i++) {
	        data[i] = _reconstructPacket(data[i]);
	      }
	      return data;
	    } else if (data && 'object' == typeof data) {
	      for (var key in data) {
	        data[key] = _reconstructPacket(data[key]);
	      }
	      return data;
	    }
	    return data;
	  }

	  packet.data = _reconstructPacket(packet.data);
	  packet.attachments = undefined; // no longer useful
	  return packet;
	};

	/**
	 * Asynchronously removes Blobs or Files from data via
	 * FileReader's readAsArrayBuffer method. Used before encoding
	 * data as msgpack. Calls callback with the blobless data.
	 *
	 * @param {Object} data
	 * @param {Function} callback
	 * @api private
	 */

	exports.removeBlobs = function(data, callback) {
	  function _removeBlobs(obj, curKey, containingObject) {
	    if (!obj) return obj;

	    // convert any blob
	    if ((global.Blob && obj instanceof Blob) ||
	        (global.File && obj instanceof File)) {
	      pendingBlobs++;

	      // async filereader
	      var fileReader = new FileReader();
	      fileReader.onload = function() { // this.result == arraybuffer
	        if (containingObject) {
	          containingObject[curKey] = this.result;
	        }
	        else {
	          bloblessData = this.result;
	        }

	        // if nothing pending its callback time
	        if(! --pendingBlobs) {
	          callback(bloblessData);
	        }
	      };

	      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
	    } else if (isArray(obj)) { // handle array
	      for (var i = 0; i < obj.length; i++) {
	        _removeBlobs(obj[i], i, obj);
	      }
	    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
	      for (var key in obj) {
	        _removeBlobs(obj[key], key, obj);
	      }
	    }
	  }

	  var pendingBlobs = 0;
	  var bloblessData = data;
	  _removeBlobs(bloblessData);
	  if (!pendingBlobs) {
	    callback(bloblessData);
	  }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 19 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	module.exports = isBuf;

	/**
	 * Returns true if obj is a buffer or an arraybuffer.
	 *
	 * @api private
	 */

	function isBuf(obj) {
	  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var eio = __webpack_require__(21);
	var Socket = __webpack_require__(47);
	var Emitter = __webpack_require__(48);
	var parser = __webpack_require__(12);
	var on = __webpack_require__(50);
	var bind = __webpack_require__(51);
	var debug = __webpack_require__(9)('socket.io-client:manager');
	var indexOf = __webpack_require__(45);
	var Backoff = __webpack_require__(54);

	/**
	 * IE6+ hasOwnProperty
	 */

	var has = Object.prototype.hasOwnProperty;

	/**
	 * Module exports
	 */

	module.exports = Manager;

	/**
	 * `Manager` constructor.
	 *
	 * @param {String} engine instance or engine uri/opts
	 * @param {Object} options
	 * @api public
	 */

	function Manager(uri, opts){
	  if (!(this instanceof Manager)) return new Manager(uri, opts);
	  if (uri && ('object' == typeof uri)) {
	    opts = uri;
	    uri = undefined;
	  }
	  opts = opts || {};

	  opts.path = opts.path || '/socket.io';
	  this.nsps = {};
	  this.subs = [];
	  this.opts = opts;
	  this.reconnection(opts.reconnection !== false);
	  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
	  this.reconnectionDelay(opts.reconnectionDelay || 1000);
	  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
	  this.randomizationFactor(opts.randomizationFactor || 0.5);
	  this.backoff = new Backoff({
	    min: this.reconnectionDelay(),
	    max: this.reconnectionDelayMax(),
	    jitter: this.randomizationFactor()
	  });
	  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
	  this.readyState = 'closed';
	  this.uri = uri;
	  this.connecting = [];
	  this.lastPing = null;
	  this.encoding = false;
	  this.packetBuffer = [];
	  this.encoder = new parser.Encoder();
	  this.decoder = new parser.Decoder();
	  this.autoConnect = opts.autoConnect !== false;
	  if (this.autoConnect) this.open();
	}

	/**
	 * Propagate given event to sockets and emit on `this`
	 *
	 * @api private
	 */

	Manager.prototype.emitAll = function() {
	  this.emit.apply(this, arguments);
	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
	    }
	  }
	};

	/**
	 * Update `socket.id` of all sockets
	 *
	 * @api private
	 */

	Manager.prototype.updateSocketIds = function(){
	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].id = this.engine.id;
	    }
	  }
	};

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Manager.prototype);

	/**
	 * Sets the `reconnection` config.
	 *
	 * @param {Boolean} true/false if it should automatically reconnect
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnection = function(v){
	  if (!arguments.length) return this._reconnection;
	  this._reconnection = !!v;
	  return this;
	};

	/**
	 * Sets the reconnection attempts config.
	 *
	 * @param {Number} max reconnection attempts before giving up
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnectionAttempts = function(v){
	  if (!arguments.length) return this._reconnectionAttempts;
	  this._reconnectionAttempts = v;
	  return this;
	};

	/**
	 * Sets the delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnectionDelay = function(v){
	  if (!arguments.length) return this._reconnectionDelay;
	  this._reconnectionDelay = v;
	  this.backoff && this.backoff.setMin(v);
	  return this;
	};

	Manager.prototype.randomizationFactor = function(v){
	  if (!arguments.length) return this._randomizationFactor;
	  this._randomizationFactor = v;
	  this.backoff && this.backoff.setJitter(v);
	  return this;
	};

	/**
	 * Sets the maximum delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnectionDelayMax = function(v){
	  if (!arguments.length) return this._reconnectionDelayMax;
	  this._reconnectionDelayMax = v;
	  this.backoff && this.backoff.setMax(v);
	  return this;
	};

	/**
	 * Sets the connection timeout. `false` to disable
	 *
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.timeout = function(v){
	  if (!arguments.length) return this._timeout;
	  this._timeout = v;
	  return this;
	};

	/**
	 * Starts trying to reconnect if reconnection is enabled and we have not
	 * started reconnecting yet
	 *
	 * @api private
	 */

	Manager.prototype.maybeReconnectOnOpen = function() {
	  // Only try to reconnect if it's the first time we're connecting
	  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
	    // keeps reconnection from firing twice for the same reconnection loop
	    this.reconnect();
	  }
	};


	/**
	 * Sets the current transport `socket`.
	 *
	 * @param {Function} optional, callback
	 * @return {Manager} self
	 * @api public
	 */

	Manager.prototype.open =
	Manager.prototype.connect = function(fn){
	  debug('readyState %s', this.readyState);
	  if (~this.readyState.indexOf('open')) return this;

	  debug('opening %s', this.uri);
	  this.engine = eio(this.uri, this.opts);
	  var socket = this.engine;
	  var self = this;
	  this.readyState = 'opening';
	  this.skipReconnect = false;

	  // emit `open`
	  var openSub = on(socket, 'open', function() {
	    self.onopen();
	    fn && fn();
	  });

	  // emit `connect_error`
	  var errorSub = on(socket, 'error', function(data){
	    debug('connect_error');
	    self.cleanup();
	    self.readyState = 'closed';
	    self.emitAll('connect_error', data);
	    if (fn) {
	      var err = new Error('Connection error');
	      err.data = data;
	      fn(err);
	    } else {
	      // Only do this if there is no fn to handle the error
	      self.maybeReconnectOnOpen();
	    }
	  });

	  // emit `connect_timeout`
	  if (false !== this._timeout) {
	    var timeout = this._timeout;
	    debug('connect attempt will timeout after %d', timeout);

	    // set timer
	    var timer = setTimeout(function(){
	      debug('connect attempt timed out after %d', timeout);
	      openSub.destroy();
	      socket.close();
	      socket.emit('error', 'timeout');
	      self.emitAll('connect_timeout', timeout);
	    }, timeout);

	    this.subs.push({
	      destroy: function(){
	        clearTimeout(timer);
	      }
	    });
	  }

	  this.subs.push(openSub);
	  this.subs.push(errorSub);

	  return this;
	};

	/**
	 * Called upon transport open.
	 *
	 * @api private
	 */

	Manager.prototype.onopen = function(){
	  debug('open');

	  // clear old subs
	  this.cleanup();

	  // mark as open
	  this.readyState = 'open';
	  this.emit('open');

	  // add new subs
	  var socket = this.engine;
	  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
	  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
	  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
	  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
	  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
	  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
	};

	/**
	 * Called upon a ping.
	 *
	 * @api private
	 */

	Manager.prototype.onping = function(){
	  this.lastPing = new Date;
	  this.emitAll('ping');
	};

	/**
	 * Called upon a packet.
	 *
	 * @api private
	 */

	Manager.prototype.onpong = function(){
	  this.emitAll('pong', new Date - this.lastPing);
	};

	/**
	 * Called with data.
	 *
	 * @api private
	 */

	Manager.prototype.ondata = function(data){
	  this.decoder.add(data);
	};

	/**
	 * Called when parser fully decodes a packet.
	 *
	 * @api private
	 */

	Manager.prototype.ondecoded = function(packet) {
	  this.emit('packet', packet);
	};

	/**
	 * Called upon socket error.
	 *
	 * @api private
	 */

	Manager.prototype.onerror = function(err){
	  debug('error', err);
	  this.emitAll('error', err);
	};

	/**
	 * Creates a new socket for the given `nsp`.
	 *
	 * @return {Socket}
	 * @api public
	 */

	Manager.prototype.socket = function(nsp){
	  var socket = this.nsps[nsp];
	  if (!socket) {
	    socket = new Socket(this, nsp);
	    this.nsps[nsp] = socket;
	    var self = this;
	    socket.on('connecting', onConnecting);
	    socket.on('connect', function(){
	      socket.id = self.engine.id;
	    });

	    if (this.autoConnect) {
	      // manually call here since connecting evnet is fired before listening
	      onConnecting();
	    }
	  }

	  function onConnecting() {
	    if (!~indexOf(self.connecting, socket)) {
	      self.connecting.push(socket);
	    }
	  }

	  return socket;
	};

	/**
	 * Called upon a socket close.
	 *
	 * @param {Socket} socket
	 */

	Manager.prototype.destroy = function(socket){
	  var index = indexOf(this.connecting, socket);
	  if (~index) this.connecting.splice(index, 1);
	  if (this.connecting.length) return;

	  this.close();
	};

	/**
	 * Writes a packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Manager.prototype.packet = function(packet){
	  debug('writing packet %j', packet);
	  var self = this;

	  if (!self.encoding) {
	    // encode, then write to engine with result
	    self.encoding = true;
	    this.encoder.encode(packet, function(encodedPackets) {
	      for (var i = 0; i < encodedPackets.length; i++) {
	        self.engine.write(encodedPackets[i], packet.options);
	      }
	      self.encoding = false;
	      self.processPacketQueue();
	    });
	  } else { // add packet to the queue
	    self.packetBuffer.push(packet);
	  }
	};

	/**
	 * If packet buffer is non-empty, begins encoding the
	 * next packet in line.
	 *
	 * @api private
	 */

	Manager.prototype.processPacketQueue = function() {
	  if (this.packetBuffer.length > 0 && !this.encoding) {
	    var pack = this.packetBuffer.shift();
	    this.packet(pack);
	  }
	};

	/**
	 * Clean up transport subscriptions and packet buffer.
	 *
	 * @api private
	 */

	Manager.prototype.cleanup = function(){
	  debug('cleanup');

	  var sub;
	  while (sub = this.subs.shift()) sub.destroy();

	  this.packetBuffer = [];
	  this.encoding = false;
	  this.lastPing = null;

	  this.decoder.destroy();
	};

	/**
	 * Close the current socket.
	 *
	 * @api private
	 */

	Manager.prototype.close =
	Manager.prototype.disconnect = function(){
	  debug('disconnect');
	  this.skipReconnect = true;
	  this.reconnecting = false;
	  if ('opening' == this.readyState) {
	    // `onclose` will not fire because
	    // an open event never happened
	    this.cleanup();
	  }
	  this.backoff.reset();
	  this.readyState = 'closed';
	  if (this.engine) this.engine.close();
	};

	/**
	 * Called upon engine close.
	 *
	 * @api private
	 */

	Manager.prototype.onclose = function(reason){
	  debug('onclose');

	  this.cleanup();
	  this.backoff.reset();
	  this.readyState = 'closed';
	  this.emit('close', reason);

	  if (this._reconnection && !this.skipReconnect) {
	    this.reconnect();
	  }
	};

	/**
	 * Attempt a reconnection.
	 *
	 * @api private
	 */

	Manager.prototype.reconnect = function(){
	  if (this.reconnecting || this.skipReconnect) return this;

	  var self = this;

	  if (this.backoff.attempts >= this._reconnectionAttempts) {
	    debug('reconnect failed');
	    this.backoff.reset();
	    this.emitAll('reconnect_failed');
	    this.reconnecting = false;
	  } else {
	    var delay = this.backoff.duration();
	    debug('will wait %dms before reconnect attempt', delay);

	    this.reconnecting = true;
	    var timer = setTimeout(function(){
	      if (self.skipReconnect) return;

	      debug('attempting reconnect');
	      self.emitAll('reconnect_attempt', self.backoff.attempts);
	      self.emitAll('reconnecting', self.backoff.attempts);

	      // check again for the case socket closed in above events
	      if (self.skipReconnect) return;

	      self.open(function(err){
	        if (err) {
	          debug('reconnect attempt error');
	          self.reconnecting = false;
	          self.reconnect();
	          self.emitAll('reconnect_error', err.data);
	        } else {
	          debug('reconnect success');
	          self.onreconnect();
	        }
	      });
	    }, delay);

	    this.subs.push({
	      destroy: function(){
	        clearTimeout(timer);
	      }
	    });
	  }
	};

	/**
	 * Called upon successful reconnect.
	 *
	 * @api private
	 */

	Manager.prototype.onreconnect = function(){
	  var attempt = this.backoff.attempts;
	  this.reconnecting = false;
	  this.backoff.reset();
	  this.updateSocketIds();
	  this.emitAll('reconnect', attempt);
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports =  __webpack_require__(22);


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(23);

	/**
	 * Exports parser
	 *
	 * @api public
	 *
	 */
	module.exports.parser = __webpack_require__(30);


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */

	var transports = __webpack_require__(24);
	var Emitter = __webpack_require__(17);
	var debug = __webpack_require__(9)('engine.io-client:socket');
	var index = __webpack_require__(45);
	var parser = __webpack_require__(30);
	var parseuri = __webpack_require__(8);
	var parsejson = __webpack_require__(46);
	var parseqs = __webpack_require__(39);

	/**
	 * Module exports.
	 */

	module.exports = Socket;

	/**
	 * Noop function.
	 *
	 * @api private
	 */

	function noop(){}

	/**
	 * Socket constructor.
	 *
	 * @param {String|Object} uri or options
	 * @param {Object} options
	 * @api public
	 */

	function Socket(uri, opts){
	  if (!(this instanceof Socket)) return new Socket(uri, opts);

	  opts = opts || {};

	  if (uri && 'object' == typeof uri) {
	    opts = uri;
	    uri = null;
	  }

	  if (uri) {
	    uri = parseuri(uri);
	    opts.hostname = uri.host;
	    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
	    opts.port = uri.port;
	    if (uri.query) opts.query = uri.query;
	  } else if (opts.host) {
	    opts.hostname = parseuri(opts.host).host;
	  }

	  this.secure = null != opts.secure ? opts.secure :
	    (global.location && 'https:' == location.protocol);

	  if (opts.hostname && !opts.port) {
	    // if no port is specified manually, use the protocol default
	    opts.port = this.secure ? '443' : '80';
	  }

	  this.agent = opts.agent || false;
	  this.hostname = opts.hostname ||
	    (global.location ? location.hostname : 'localhost');
	  this.port = opts.port || (global.location && location.port ?
	       location.port :
	       (this.secure ? 443 : 80));
	  this.query = opts.query || {};
	  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
	  this.upgrade = false !== opts.upgrade;
	  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
	  this.forceJSONP = !!opts.forceJSONP;
	  this.jsonp = false !== opts.jsonp;
	  this.forceBase64 = !!opts.forceBase64;
	  this.enablesXDR = !!opts.enablesXDR;
	  this.timestampParam = opts.timestampParam || 't';
	  this.timestampRequests = opts.timestampRequests;
	  this.transports = opts.transports || ['polling', 'websocket'];
	  this.readyState = '';
	  this.writeBuffer = [];
	  this.policyPort = opts.policyPort || 843;
	  this.rememberUpgrade = opts.rememberUpgrade || false;
	  this.binaryType = null;
	  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
	  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

	  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
	  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
	    this.perMessageDeflate.threshold = 1024;
	  }

	  // SSL options for Node.js client
	  this.pfx = opts.pfx || null;
	  this.key = opts.key || null;
	  this.passphrase = opts.passphrase || null;
	  this.cert = opts.cert || null;
	  this.ca = opts.ca || null;
	  this.ciphers = opts.ciphers || null;
	  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;

	  // other options for Node.js client
	  var freeGlobal = typeof global == 'object' && global;
	  if (freeGlobal.global === freeGlobal) {
	    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
	      this.extraHeaders = opts.extraHeaders;
	    }
	  }

	  this.open();
	}

	Socket.priorWebsocketSuccess = false;

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Socket.prototype);

	/**
	 * Protocol version.
	 *
	 * @api public
	 */

	Socket.protocol = parser.protocol; // this is an int

	/**
	 * Expose deps for legacy compatibility
	 * and standalone browser access.
	 */

	Socket.Socket = Socket;
	Socket.Transport = __webpack_require__(29);
	Socket.transports = __webpack_require__(24);
	Socket.parser = __webpack_require__(30);

	/**
	 * Creates transport of the given type.
	 *
	 * @param {String} transport name
	 * @return {Transport}
	 * @api private
	 */

	Socket.prototype.createTransport = function (name) {
	  debug('creating transport "%s"', name);
	  var query = clone(this.query);

	  // append engine.io protocol identifier
	  query.EIO = parser.protocol;

	  // transport name
	  query.transport = name;

	  // session id if we already have one
	  if (this.id) query.sid = this.id;

	  var transport = new transports[name]({
	    agent: this.agent,
	    hostname: this.hostname,
	    port: this.port,
	    secure: this.secure,
	    path: this.path,
	    query: query,
	    forceJSONP: this.forceJSONP,
	    jsonp: this.jsonp,
	    forceBase64: this.forceBase64,
	    enablesXDR: this.enablesXDR,
	    timestampRequests: this.timestampRequests,
	    timestampParam: this.timestampParam,
	    policyPort: this.policyPort,
	    socket: this,
	    pfx: this.pfx,
	    key: this.key,
	    passphrase: this.passphrase,
	    cert: this.cert,
	    ca: this.ca,
	    ciphers: this.ciphers,
	    rejectUnauthorized: this.rejectUnauthorized,
	    perMessageDeflate: this.perMessageDeflate,
	    extraHeaders: this.extraHeaders
	  });

	  return transport;
	};

	function clone (obj) {
	  var o = {};
	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      o[i] = obj[i];
	    }
	  }
	  return o;
	}

	/**
	 * Initializes transport to use and starts probe.
	 *
	 * @api private
	 */
	Socket.prototype.open = function () {
	  var transport;
	  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
	    transport = 'websocket';
	  } else if (0 === this.transports.length) {
	    // Emit error on next tick so it can be listened to
	    var self = this;
	    setTimeout(function() {
	      self.emit('error', 'No transports available');
	    }, 0);
	    return;
	  } else {
	    transport = this.transports[0];
	  }
	  this.readyState = 'opening';

	  // Retry with the next transport if the transport is disabled (jsonp: false)
	  try {
	    transport = this.createTransport(transport);
	  } catch (e) {
	    this.transports.shift();
	    this.open();
	    return;
	  }

	  transport.open();
	  this.setTransport(transport);
	};

	/**
	 * Sets the current transport. Disables the existing one (if any).
	 *
	 * @api private
	 */

	Socket.prototype.setTransport = function(transport){
	  debug('setting transport %s', transport.name);
	  var self = this;

	  if (this.transport) {
	    debug('clearing existing transport %s', this.transport.name);
	    this.transport.removeAllListeners();
	  }

	  // set up transport
	  this.transport = transport;

	  // set up transport listeners
	  transport
	  .on('drain', function(){
	    self.onDrain();
	  })
	  .on('packet', function(packet){
	    self.onPacket(packet);
	  })
	  .on('error', function(e){
	    self.onError(e);
	  })
	  .on('close', function(){
	    self.onClose('transport close');
	  });
	};

	/**
	 * Probes a transport.
	 *
	 * @param {String} transport name
	 * @api private
	 */

	Socket.prototype.probe = function (name) {
	  debug('probing transport "%s"', name);
	  var transport = this.createTransport(name, { probe: 1 })
	    , failed = false
	    , self = this;

	  Socket.priorWebsocketSuccess = false;

	  function onTransportOpen(){
	    if (self.onlyBinaryUpgrades) {
	      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
	      failed = failed || upgradeLosesBinary;
	    }
	    if (failed) return;

	    debug('probe transport "%s" opened', name);
	    transport.send([{ type: 'ping', data: 'probe' }]);
	    transport.once('packet', function (msg) {
	      if (failed) return;
	      if ('pong' == msg.type && 'probe' == msg.data) {
	        debug('probe transport "%s" pong', name);
	        self.upgrading = true;
	        self.emit('upgrading', transport);
	        if (!transport) return;
	        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

	        debug('pausing current transport "%s"', self.transport.name);
	        self.transport.pause(function () {
	          if (failed) return;
	          if ('closed' == self.readyState) return;
	          debug('changing transport and sending upgrade packet');

	          cleanup();

	          self.setTransport(transport);
	          transport.send([{ type: 'upgrade' }]);
	          self.emit('upgrade', transport);
	          transport = null;
	          self.upgrading = false;
	          self.flush();
	        });
	      } else {
	        debug('probe transport "%s" failed', name);
	        var err = new Error('probe error');
	        err.transport = transport.name;
	        self.emit('upgradeError', err);
	      }
	    });
	  }

	  function freezeTransport() {
	    if (failed) return;

	    // Any callback called by transport should be ignored since now
	    failed = true;

	    cleanup();

	    transport.close();
	    transport = null;
	  }

	  //Handle any error that happens while probing
	  function onerror(err) {
	    var error = new Error('probe error: ' + err);
	    error.transport = transport.name;

	    freezeTransport();

	    debug('probe transport "%s" failed because of error: %s', name, err);

	    self.emit('upgradeError', error);
	  }

	  function onTransportClose(){
	    onerror("transport closed");
	  }

	  //When the socket is closed while we're probing
	  function onclose(){
	    onerror("socket closed");
	  }

	  //When the socket is upgraded while we're probing
	  function onupgrade(to){
	    if (transport && to.name != transport.name) {
	      debug('"%s" works - aborting "%s"', to.name, transport.name);
	      freezeTransport();
	    }
	  }

	  //Remove all listeners on the transport and on self
	  function cleanup(){
	    transport.removeListener('open', onTransportOpen);
	    transport.removeListener('error', onerror);
	    transport.removeListener('close', onTransportClose);
	    self.removeListener('close', onclose);
	    self.removeListener('upgrading', onupgrade);
	  }

	  transport.once('open', onTransportOpen);
	  transport.once('error', onerror);
	  transport.once('close', onTransportClose);

	  this.once('close', onclose);
	  this.once('upgrading', onupgrade);

	  transport.open();

	};

	/**
	 * Called when connection is deemed open.
	 *
	 * @api public
	 */

	Socket.prototype.onOpen = function () {
	  debug('socket open');
	  this.readyState = 'open';
	  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
	  this.emit('open');
	  this.flush();

	  // we check for `readyState` in case an `open`
	  // listener already closed the socket
	  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
	    debug('starting upgrade probes');
	    for (var i = 0, l = this.upgrades.length; i < l; i++) {
	      this.probe(this.upgrades[i]);
	    }
	  }
	};

	/**
	 * Handles a packet.
	 *
	 * @api private
	 */

	Socket.prototype.onPacket = function (packet) {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

	    this.emit('packet', packet);

	    // Socket is live - any packet counts
	    this.emit('heartbeat');

	    switch (packet.type) {
	      case 'open':
	        this.onHandshake(parsejson(packet.data));
	        break;

	      case 'pong':
	        this.setPing();
	        this.emit('pong');
	        break;

	      case 'error':
	        var err = new Error('server error');
	        err.code = packet.data;
	        this.onError(err);
	        break;

	      case 'message':
	        this.emit('data', packet.data);
	        this.emit('message', packet.data);
	        break;
	    }
	  } else {
	    debug('packet received with socket readyState "%s"', this.readyState);
	  }
	};

	/**
	 * Called upon handshake completion.
	 *
	 * @param {Object} handshake obj
	 * @api private
	 */

	Socket.prototype.onHandshake = function (data) {
	  this.emit('handshake', data);
	  this.id = data.sid;
	  this.transport.query.sid = data.sid;
	  this.upgrades = this.filterUpgrades(data.upgrades);
	  this.pingInterval = data.pingInterval;
	  this.pingTimeout = data.pingTimeout;
	  this.onOpen();
	  // In case open handler closes socket
	  if  ('closed' == this.readyState) return;
	  this.setPing();

	  // Prolong liveness of socket on heartbeat
	  this.removeListener('heartbeat', this.onHeartbeat);
	  this.on('heartbeat', this.onHeartbeat);
	};

	/**
	 * Resets ping timeout.
	 *
	 * @api private
	 */

	Socket.prototype.onHeartbeat = function (timeout) {
	  clearTimeout(this.pingTimeoutTimer);
	  var self = this;
	  self.pingTimeoutTimer = setTimeout(function () {
	    if ('closed' == self.readyState) return;
	    self.onClose('ping timeout');
	  }, timeout || (self.pingInterval + self.pingTimeout));
	};

	/**
	 * Pings server every `this.pingInterval` and expects response
	 * within `this.pingTimeout` or closes connection.
	 *
	 * @api private
	 */

	Socket.prototype.setPing = function () {
	  var self = this;
	  clearTimeout(self.pingIntervalTimer);
	  self.pingIntervalTimer = setTimeout(function () {
	    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
	    self.ping();
	    self.onHeartbeat(self.pingTimeout);
	  }, self.pingInterval);
	};

	/**
	* Sends a ping packet.
	*
	* @api private
	*/

	Socket.prototype.ping = function () {
	  var self = this;
	  this.sendPacket('ping', function(){
	    self.emit('ping');
	  });
	};

	/**
	 * Called on `drain` event
	 *
	 * @api private
	 */

	Socket.prototype.onDrain = function() {
	  this.writeBuffer.splice(0, this.prevBufferLen);

	  // setting prevBufferLen = 0 is very important
	  // for example, when upgrading, upgrade packet is sent over,
	  // and a nonzero prevBufferLen could cause problems on `drain`
	  this.prevBufferLen = 0;

	  if (0 === this.writeBuffer.length) {
	    this.emit('drain');
	  } else {
	    this.flush();
	  }
	};

	/**
	 * Flush write buffers.
	 *
	 * @api private
	 */

	Socket.prototype.flush = function () {
	  if ('closed' != this.readyState && this.transport.writable &&
	    !this.upgrading && this.writeBuffer.length) {
	    debug('flushing %d packets in socket', this.writeBuffer.length);
	    this.transport.send(this.writeBuffer);
	    // keep track of current length of writeBuffer
	    // splice writeBuffer and callbackBuffer on `drain`
	    this.prevBufferLen = this.writeBuffer.length;
	    this.emit('flush');
	  }
	};

	/**
	 * Sends a message.
	 *
	 * @param {String} message.
	 * @param {Function} callback function.
	 * @param {Object} options.
	 * @return {Socket} for chaining.
	 * @api public
	 */

	Socket.prototype.write =
	Socket.prototype.send = function (msg, options, fn) {
	  this.sendPacket('message', msg, options, fn);
	  return this;
	};

	/**
	 * Sends a packet.
	 *
	 * @param {String} packet type.
	 * @param {String} data.
	 * @param {Object} options.
	 * @param {Function} callback function.
	 * @api private
	 */

	Socket.prototype.sendPacket = function (type, data, options, fn) {
	  if('function' == typeof data) {
	    fn = data;
	    data = undefined;
	  }

	  if ('function' == typeof options) {
	    fn = options;
	    options = null;
	  }

	  if ('closing' == this.readyState || 'closed' == this.readyState) {
	    return;
	  }

	  options = options || {};
	  options.compress = false !== options.compress;

	  var packet = {
	    type: type,
	    data: data,
	    options: options
	  };
	  this.emit('packetCreate', packet);
	  this.writeBuffer.push(packet);
	  if (fn) this.once('flush', fn);
	  this.flush();
	};

	/**
	 * Closes the connection.
	 *
	 * @api private
	 */

	Socket.prototype.close = function () {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    this.readyState = 'closing';

	    var self = this;

	    if (this.writeBuffer.length) {
	      this.once('drain', function() {
	        if (this.upgrading) {
	          waitForUpgrade();
	        } else {
	          close();
	        }
	      });
	    } else if (this.upgrading) {
	      waitForUpgrade();
	    } else {
	      close();
	    }
	  }

	  function close() {
	    self.onClose('forced close');
	    debug('socket closing - telling transport to close');
	    self.transport.close();
	  }

	  function cleanupAndClose() {
	    self.removeListener('upgrade', cleanupAndClose);
	    self.removeListener('upgradeError', cleanupAndClose);
	    close();
	  }

	  function waitForUpgrade() {
	    // wait for upgrade to finish since we can't send packets while pausing a transport
	    self.once('upgrade', cleanupAndClose);
	    self.once('upgradeError', cleanupAndClose);
	  }

	  return this;
	};

	/**
	 * Called upon transport error
	 *
	 * @api private
	 */

	Socket.prototype.onError = function (err) {
	  debug('socket error %j', err);
	  Socket.priorWebsocketSuccess = false;
	  this.emit('error', err);
	  this.onClose('transport error', err);
	};

	/**
	 * Called upon transport close.
	 *
	 * @api private
	 */

	Socket.prototype.onClose = function (reason, desc) {
	  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
	    debug('socket close with reason: "%s"', reason);
	    var self = this;

	    // clear timers
	    clearTimeout(this.pingIntervalTimer);
	    clearTimeout(this.pingTimeoutTimer);

	    // stop event from firing again for transport
	    this.transport.removeAllListeners('close');

	    // ensure transport won't stay open
	    this.transport.close();

	    // ignore further transport communication
	    this.transport.removeAllListeners();

	    // set ready state
	    this.readyState = 'closed';

	    // clear session id
	    this.id = null;

	    // emit close event
	    this.emit('close', reason, desc);

	    // clean buffers after, so users can still
	    // grab the buffers on `close` event
	    self.writeBuffer = [];
	    self.prevBufferLen = 0;
	  }
	};

	/**
	 * Filters upgrades, returning only those matching client transports.
	 *
	 * @param {Array} server upgrades
	 * @api private
	 *
	 */

	Socket.prototype.filterUpgrades = function (upgrades) {
	  var filteredUpgrades = [];
	  for (var i = 0, j = upgrades.length; i<j; i++) {
	    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
	  }
	  return filteredUpgrades;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies
	 */

	var XMLHttpRequest = __webpack_require__(25);
	var XHR = __webpack_require__(27);
	var JSONP = __webpack_require__(42);
	var websocket = __webpack_require__(43);

	/**
	 * Export transports.
	 */

	exports.polling = polling;
	exports.websocket = websocket;

	/**
	 * Polling transport polymorphic constructor.
	 * Decides on xhr vs jsonp based on feature detection.
	 *
	 * @api private
	 */

	function polling(opts){
	  var xhr;
	  var xd = false;
	  var xs = false;
	  var jsonp = false !== opts.jsonp;

	  if (global.location) {
	    var isSSL = 'https:' == location.protocol;
	    var port = location.port;

	    // some user agents have empty `location.port`
	    if (!port) {
	      port = isSSL ? 443 : 80;
	    }

	    xd = opts.hostname != location.hostname || port != opts.port;
	    xs = opts.secure != isSSL;
	  }

	  opts.xdomain = xd;
	  opts.xscheme = xs;
	  xhr = new XMLHttpRequest(opts);

	  if ('open' in xhr && !opts.forceJSONP) {
	    return new XHR(opts);
	  } else {
	    if (!jsonp) throw new Error('JSONP disabled');
	    return new JSONP(opts);
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// browser shim for xmlhttprequest module
	var hasCORS = __webpack_require__(26);

	module.exports = function(opts) {
	  var xdomain = opts.xdomain;

	  // scheme must be same when usign XDomainRequest
	  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
	  var xscheme = opts.xscheme;

	  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
	  // https://github.com/Automattic/engine.io-client/pull/217
	  var enablesXDR = opts.enablesXDR;

	  // XMLHttpRequest can be disabled on IE
	  try {
	    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
	      return new XMLHttpRequest();
	    }
	  } catch (e) { }

	  // Use XDomainRequest for IE8 if enablesXDR is true
	  // because loading bar keeps flashing when using jsonp-polling
	  // https://github.com/yujiosaka/socke.io-ie8-loading-example
	  try {
	    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
	      return new XDomainRequest();
	    }
	  } catch (e) { }

	  if (!xdomain) {
	    try {
	      return new ActiveXObject('Microsoft.XMLHTTP');
	    } catch(e) { }
	  }
	}


/***/ },
/* 26 */
/***/ function(module, exports) {

	
	/**
	 * Module exports.
	 *
	 * Logic borrowed from Modernizr:
	 *
	 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
	 */

	try {
	  module.exports = typeof XMLHttpRequest !== 'undefined' &&
	    'withCredentials' in new XMLHttpRequest();
	} catch (err) {
	  // if XMLHttp support is disabled in IE then it will throw
	  // when trying to create
	  module.exports = false;
	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module requirements.
	 */

	var XMLHttpRequest = __webpack_require__(25);
	var Polling = __webpack_require__(28);
	var Emitter = __webpack_require__(17);
	var inherit = __webpack_require__(40);
	var debug = __webpack_require__(9)('engine.io-client:polling-xhr');

	/**
	 * Module exports.
	 */

	module.exports = XHR;
	module.exports.Request = Request;

	/**
	 * Empty function
	 */

	function empty(){}

	/**
	 * XHR Polling constructor.
	 *
	 * @param {Object} opts
	 * @api public
	 */

	function XHR(opts){
	  Polling.call(this, opts);

	  if (global.location) {
	    var isSSL = 'https:' == location.protocol;
	    var port = location.port;

	    // some user agents have empty `location.port`
	    if (!port) {
	      port = isSSL ? 443 : 80;
	    }

	    this.xd = opts.hostname != global.location.hostname ||
	      port != opts.port;
	    this.xs = opts.secure != isSSL;
	  } else {
	    this.extraHeaders = opts.extraHeaders;
	  }
	}

	/**
	 * Inherits from Polling.
	 */

	inherit(XHR, Polling);

	/**
	 * XHR supports binary
	 */

	XHR.prototype.supportsBinary = true;

	/**
	 * Creates a request.
	 *
	 * @param {String} method
	 * @api private
	 */

	XHR.prototype.request = function(opts){
	  opts = opts || {};
	  opts.uri = this.uri();
	  opts.xd = this.xd;
	  opts.xs = this.xs;
	  opts.agent = this.agent || false;
	  opts.supportsBinary = this.supportsBinary;
	  opts.enablesXDR = this.enablesXDR;

	  // SSL options for Node.js client
	  opts.pfx = this.pfx;
	  opts.key = this.key;
	  opts.passphrase = this.passphrase;
	  opts.cert = this.cert;
	  opts.ca = this.ca;
	  opts.ciphers = this.ciphers;
	  opts.rejectUnauthorized = this.rejectUnauthorized;

	  // other options for Node.js client
	  opts.extraHeaders = this.extraHeaders;

	  return new Request(opts);
	};

	/**
	 * Sends data.
	 *
	 * @param {String} data to send.
	 * @param {Function} called upon flush.
	 * @api private
	 */

	XHR.prototype.doWrite = function(data, fn){
	  var isBinary = typeof data !== 'string' && data !== undefined;
	  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
	  var self = this;
	  req.on('success', fn);
	  req.on('error', function(err){
	    self.onError('xhr post error', err);
	  });
	  this.sendXhr = req;
	};

	/**
	 * Starts a poll cycle.
	 *
	 * @api private
	 */

	XHR.prototype.doPoll = function(){
	  debug('xhr poll');
	  var req = this.request();
	  var self = this;
	  req.on('data', function(data){
	    self.onData(data);
	  });
	  req.on('error', function(err){
	    self.onError('xhr poll error', err);
	  });
	  this.pollXhr = req;
	};

	/**
	 * Request constructor
	 *
	 * @param {Object} options
	 * @api public
	 */

	function Request(opts){
	  this.method = opts.method || 'GET';
	  this.uri = opts.uri;
	  this.xd = !!opts.xd;
	  this.xs = !!opts.xs;
	  this.async = false !== opts.async;
	  this.data = undefined != opts.data ? opts.data : null;
	  this.agent = opts.agent;
	  this.isBinary = opts.isBinary;
	  this.supportsBinary = opts.supportsBinary;
	  this.enablesXDR = opts.enablesXDR;

	  // SSL options for Node.js client
	  this.pfx = opts.pfx;
	  this.key = opts.key;
	  this.passphrase = opts.passphrase;
	  this.cert = opts.cert;
	  this.ca = opts.ca;
	  this.ciphers = opts.ciphers;
	  this.rejectUnauthorized = opts.rejectUnauthorized;

	  // other options for Node.js client
	  this.extraHeaders = opts.extraHeaders;

	  this.create();
	}

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Request.prototype);

	/**
	 * Creates the XHR object and sends the request.
	 *
	 * @api private
	 */

	Request.prototype.create = function(){
	  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

	  // SSL options for Node.js client
	  opts.pfx = this.pfx;
	  opts.key = this.key;
	  opts.passphrase = this.passphrase;
	  opts.cert = this.cert;
	  opts.ca = this.ca;
	  opts.ciphers = this.ciphers;
	  opts.rejectUnauthorized = this.rejectUnauthorized;

	  var xhr = this.xhr = new XMLHttpRequest(opts);
	  var self = this;

	  try {
	    debug('xhr open %s: %s', this.method, this.uri);
	    xhr.open(this.method, this.uri, this.async);
	    try {
	      if (this.extraHeaders) {
	        xhr.setDisableHeaderCheck(true);
	        for (var i in this.extraHeaders) {
	          if (this.extraHeaders.hasOwnProperty(i)) {
	            xhr.setRequestHeader(i, this.extraHeaders[i]);
	          }
	        }
	      }
	    } catch (e) {}
	    if (this.supportsBinary) {
	      // This has to be done after open because Firefox is stupid
	      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
	      xhr.responseType = 'arraybuffer';
	    }

	    if ('POST' == this.method) {
	      try {
	        if (this.isBinary) {
	          xhr.setRequestHeader('Content-type', 'application/octet-stream');
	        } else {
	          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
	        }
	      } catch (e) {}
	    }

	    // ie6 check
	    if ('withCredentials' in xhr) {
	      xhr.withCredentials = true;
	    }

	    if (this.hasXDR()) {
	      xhr.onload = function(){
	        self.onLoad();
	      };
	      xhr.onerror = function(){
	        self.onError(xhr.responseText);
	      };
	    } else {
	      xhr.onreadystatechange = function(){
	        if (4 != xhr.readyState) return;
	        if (200 == xhr.status || 1223 == xhr.status) {
	          self.onLoad();
	        } else {
	          // make sure the `error` event handler that's user-set
	          // does not throw in the same tick and gets caught here
	          setTimeout(function(){
	            self.onError(xhr.status);
	          }, 0);
	        }
	      };
	    }

	    debug('xhr data %s', this.data);
	    xhr.send(this.data);
	  } catch (e) {
	    // Need to defer since .create() is called directly fhrom the constructor
	    // and thus the 'error' event can only be only bound *after* this exception
	    // occurs.  Therefore, also, we cannot throw here at all.
	    setTimeout(function() {
	      self.onError(e);
	    }, 0);
	    return;
	  }

	  if (global.document) {
	    this.index = Request.requestsCount++;
	    Request.requests[this.index] = this;
	  }
	};

	/**
	 * Called upon successful response.
	 *
	 * @api private
	 */

	Request.prototype.onSuccess = function(){
	  this.emit('success');
	  this.cleanup();
	};

	/**
	 * Called if we have data.
	 *
	 * @api private
	 */

	Request.prototype.onData = function(data){
	  this.emit('data', data);
	  this.onSuccess();
	};

	/**
	 * Called upon error.
	 *
	 * @api private
	 */

	Request.prototype.onError = function(err){
	  this.emit('error', err);
	  this.cleanup(true);
	};

	/**
	 * Cleans up house.
	 *
	 * @api private
	 */

	Request.prototype.cleanup = function(fromError){
	  if ('undefined' == typeof this.xhr || null === this.xhr) {
	    return;
	  }
	  // xmlhttprequest
	  if (this.hasXDR()) {
	    this.xhr.onload = this.xhr.onerror = empty;
	  } else {
	    this.xhr.onreadystatechange = empty;
	  }

	  if (fromError) {
	    try {
	      this.xhr.abort();
	    } catch(e) {}
	  }

	  if (global.document) {
	    delete Request.requests[this.index];
	  }

	  this.xhr = null;
	};

	/**
	 * Called upon load.
	 *
	 * @api private
	 */

	Request.prototype.onLoad = function(){
	  var data;
	  try {
	    var contentType;
	    try {
	      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
	    } catch (e) {}
	    if (contentType === 'application/octet-stream') {
	      data = this.xhr.response;
	    } else {
	      if (!this.supportsBinary) {
	        data = this.xhr.responseText;
	      } else {
	        try {
	          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
	        } catch (e) {
	          var ui8Arr = new Uint8Array(this.xhr.response);
	          var dataArray = [];
	          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
	            dataArray.push(ui8Arr[idx]);
	          }

	          data = String.fromCharCode.apply(null, dataArray);
	        }
	      }
	    }
	  } catch (e) {
	    this.onError(e);
	  }
	  if (null != data) {
	    this.onData(data);
	  }
	};

	/**
	 * Check if it has XDomainRequest.
	 *
	 * @api private
	 */

	Request.prototype.hasXDR = function(){
	  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
	};

	/**
	 * Aborts the request.
	 *
	 * @api public
	 */

	Request.prototype.abort = function(){
	  this.cleanup();
	};

	/**
	 * Aborts pending requests when unloading the window. This is needed to prevent
	 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
	 * emitted.
	 */

	if (global.document) {
	  Request.requestsCount = 0;
	  Request.requests = {};
	  if (global.attachEvent) {
	    global.attachEvent('onunload', unloadHandler);
	  } else if (global.addEventListener) {
	    global.addEventListener('beforeunload', unloadHandler, false);
	  }
	}

	function unloadHandler() {
	  for (var i in Request.requests) {
	    if (Request.requests.hasOwnProperty(i)) {
	      Request.requests[i].abort();
	    }
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Transport = __webpack_require__(29);
	var parseqs = __webpack_require__(39);
	var parser = __webpack_require__(30);
	var inherit = __webpack_require__(40);
	var yeast = __webpack_require__(41);
	var debug = __webpack_require__(9)('engine.io-client:polling');

	/**
	 * Module exports.
	 */

	module.exports = Polling;

	/**
	 * Is XHR2 supported?
	 */

	var hasXHR2 = (function() {
	  var XMLHttpRequest = __webpack_require__(25);
	  var xhr = new XMLHttpRequest({ xdomain: false });
	  return null != xhr.responseType;
	})();

	/**
	 * Polling interface.
	 *
	 * @param {Object} opts
	 * @api private
	 */

	function Polling(opts){
	  var forceBase64 = (opts && opts.forceBase64);
	  if (!hasXHR2 || forceBase64) {
	    this.supportsBinary = false;
	  }
	  Transport.call(this, opts);
	}

	/**
	 * Inherits from Transport.
	 */

	inherit(Polling, Transport);

	/**
	 * Transport name.
	 */

	Polling.prototype.name = 'polling';

	/**
	 * Opens the socket (triggers polling). We write a PING message to determine
	 * when the transport is open.
	 *
	 * @api private
	 */

	Polling.prototype.doOpen = function(){
	  this.poll();
	};

	/**
	 * Pauses polling.
	 *
	 * @param {Function} callback upon buffers are flushed and transport is paused
	 * @api private
	 */

	Polling.prototype.pause = function(onPause){
	  var pending = 0;
	  var self = this;

	  this.readyState = 'pausing';

	  function pause(){
	    debug('paused');
	    self.readyState = 'paused';
	    onPause();
	  }

	  if (this.polling || !this.writable) {
	    var total = 0;

	    if (this.polling) {
	      debug('we are currently polling - waiting to pause');
	      total++;
	      this.once('pollComplete', function(){
	        debug('pre-pause polling complete');
	        --total || pause();
	      });
	    }

	    if (!this.writable) {
	      debug('we are currently writing - waiting to pause');
	      total++;
	      this.once('drain', function(){
	        debug('pre-pause writing complete');
	        --total || pause();
	      });
	    }
	  } else {
	    pause();
	  }
	};

	/**
	 * Starts polling cycle.
	 *
	 * @api public
	 */

	Polling.prototype.poll = function(){
	  debug('polling');
	  this.polling = true;
	  this.doPoll();
	  this.emit('poll');
	};

	/**
	 * Overloads onData to detect payloads.
	 *
	 * @api private
	 */

	Polling.prototype.onData = function(data){
	  var self = this;
	  debug('polling got data %s', data);
	  var callback = function(packet, index, total) {
	    // if its the first message we consider the transport open
	    if ('opening' == self.readyState) {
	      self.onOpen();
	    }

	    // if its a close packet, we close the ongoing requests
	    if ('close' == packet.type) {
	      self.onClose();
	      return false;
	    }

	    // otherwise bypass onData and handle the message
	    self.onPacket(packet);
	  };

	  // decode payload
	  parser.decodePayload(data, this.socket.binaryType, callback);

	  // if an event did not trigger closing
	  if ('closed' != this.readyState) {
	    // if we got data we're not polling
	    this.polling = false;
	    this.emit('pollComplete');

	    if ('open' == this.readyState) {
	      this.poll();
	    } else {
	      debug('ignoring poll - transport state "%s"', this.readyState);
	    }
	  }
	};

	/**
	 * For polling, send a close packet.
	 *
	 * @api private
	 */

	Polling.prototype.doClose = function(){
	  var self = this;

	  function close(){
	    debug('writing close packet');
	    self.write([{ type: 'close' }]);
	  }

	  if ('open' == this.readyState) {
	    debug('transport open - closing');
	    close();
	  } else {
	    // in case we're trying to close while
	    // handshaking is in progress (GH-164)
	    debug('transport not open - deferring close');
	    this.once('open', close);
	  }
	};

	/**
	 * Writes a packets payload.
	 *
	 * @param {Array} data packets
	 * @param {Function} drain callback
	 * @api private
	 */

	Polling.prototype.write = function(packets){
	  var self = this;
	  this.writable = false;
	  var callbackfn = function() {
	    self.writable = true;
	    self.emit('drain');
	  };

	  var self = this;
	  parser.encodePayload(packets, this.supportsBinary, function(data) {
	    self.doWrite(data, callbackfn);
	  });
	};

	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */

	Polling.prototype.uri = function(){
	  var query = this.query || {};
	  var schema = this.secure ? 'https' : 'http';
	  var port = '';

	  // cache busting is forced
	  if (false !== this.timestampRequests) {
	    query[this.timestampParam] = yeast();
	  }

	  if (!this.supportsBinary && !query.sid) {
	    query.b64 = 1;
	  }

	  query = parseqs.encode(query);

	  // avoid port if default for schema
	  if (this.port && (('https' == schema && this.port != 443) ||
	     ('http' == schema && this.port != 80))) {
	    port = ':' + this.port;
	  }

	  // prepend ? to query
	  if (query.length) {
	    query = '?' + query;
	  }

	  var ipv6 = this.hostname.indexOf(':') !== -1;
	  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var parser = __webpack_require__(30);
	var Emitter = __webpack_require__(17);

	/**
	 * Module exports.
	 */

	module.exports = Transport;

	/**
	 * Transport abstract constructor.
	 *
	 * @param {Object} options.
	 * @api private
	 */

	function Transport (opts) {
	  this.path = opts.path;
	  this.hostname = opts.hostname;
	  this.port = opts.port;
	  this.secure = opts.secure;
	  this.query = opts.query;
	  this.timestampParam = opts.timestampParam;
	  this.timestampRequests = opts.timestampRequests;
	  this.readyState = '';
	  this.agent = opts.agent || false;
	  this.socket = opts.socket;
	  this.enablesXDR = opts.enablesXDR;

	  // SSL options for Node.js client
	  this.pfx = opts.pfx;
	  this.key = opts.key;
	  this.passphrase = opts.passphrase;
	  this.cert = opts.cert;
	  this.ca = opts.ca;
	  this.ciphers = opts.ciphers;
	  this.rejectUnauthorized = opts.rejectUnauthorized;

	  // other options for Node.js client
	  this.extraHeaders = opts.extraHeaders;
	}

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Transport.prototype);

	/**
	 * Emits an error.
	 *
	 * @param {String} str
	 * @return {Transport} for chaining
	 * @api public
	 */

	Transport.prototype.onError = function (msg, desc) {
	  var err = new Error(msg);
	  err.type = 'TransportError';
	  err.description = desc;
	  this.emit('error', err);
	  return this;
	};

	/**
	 * Opens the transport.
	 *
	 * @api public
	 */

	Transport.prototype.open = function () {
	  if ('closed' == this.readyState || '' == this.readyState) {
	    this.readyState = 'opening';
	    this.doOpen();
	  }

	  return this;
	};

	/**
	 * Closes the transport.
	 *
	 * @api private
	 */

	Transport.prototype.close = function () {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    this.doClose();
	    this.onClose();
	  }

	  return this;
	};

	/**
	 * Sends multiple packets.
	 *
	 * @param {Array} packets
	 * @api private
	 */

	Transport.prototype.send = function(packets){
	  if ('open' == this.readyState) {
	    this.write(packets);
	  } else {
	    throw new Error('Transport not open');
	  }
	};

	/**
	 * Called upon open
	 *
	 * @api private
	 */

	Transport.prototype.onOpen = function () {
	  this.readyState = 'open';
	  this.writable = true;
	  this.emit('open');
	};

	/**
	 * Called with data.
	 *
	 * @param {String} data
	 * @api private
	 */

	Transport.prototype.onData = function(data){
	  var packet = parser.decodePacket(data, this.socket.binaryType);
	  this.onPacket(packet);
	};

	/**
	 * Called with a decoded packet.
	 */

	Transport.prototype.onPacket = function (packet) {
	  this.emit('packet', packet);
	};

	/**
	 * Called upon close.
	 *
	 * @api private
	 */

	Transport.prototype.onClose = function () {
	  this.readyState = 'closed';
	  this.emit('close');
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */

	var keys = __webpack_require__(31);
	var hasBinary = __webpack_require__(32);
	var sliceBuffer = __webpack_require__(34);
	var base64encoder = __webpack_require__(35);
	var after = __webpack_require__(36);
	var utf8 = __webpack_require__(37);

	/**
	 * Check if we are running an android browser. That requires us to use
	 * ArrayBuffer with polling transports...
	 *
	 * http://ghinda.net/jpeg-blob-ajax-android/
	 */

	var isAndroid = navigator.userAgent.match(/Android/i);

	/**
	 * Check if we are running in PhantomJS.
	 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
	 * https://github.com/ariya/phantomjs/issues/11395
	 * @type boolean
	 */
	var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

	/**
	 * When true, avoids using Blobs to encode payloads.
	 * @type boolean
	 */
	var dontSendBlobs = isAndroid || isPhantomJS;

	/**
	 * Current protocol version.
	 */

	exports.protocol = 3;

	/**
	 * Packet types.
	 */

	var packets = exports.packets = {
	    open:     0    // non-ws
	  , close:    1    // non-ws
	  , ping:     2
	  , pong:     3
	  , message:  4
	  , upgrade:  5
	  , noop:     6
	};

	var packetslist = keys(packets);

	/**
	 * Premade error packet.
	 */

	var err = { type: 'error', data: 'parser error' };

	/**
	 * Create a blob api even for blob builder when vendor prefixes exist
	 */

	var Blob = __webpack_require__(38);

	/**
	 * Encodes a packet.
	 *
	 *     <packet type id> [ <data> ]
	 *
	 * Example:
	 *
	 *     5hello world
	 *     3
	 *     4
	 *
	 * Binary is encoded in an identical principle
	 *
	 * @api private
	 */

	exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
	  if ('function' == typeof supportsBinary) {
	    callback = supportsBinary;
	    supportsBinary = false;
	  }

	  if ('function' == typeof utf8encode) {
	    callback = utf8encode;
	    utf8encode = null;
	  }

	  var data = (packet.data === undefined)
	    ? undefined
	    : packet.data.buffer || packet.data;

	  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
	    return encodeArrayBuffer(packet, supportsBinary, callback);
	  } else if (Blob && data instanceof global.Blob) {
	    return encodeBlob(packet, supportsBinary, callback);
	  }

	  // might be an object with { base64: true, data: dataAsBase64String }
	  if (data && data.base64) {
	    return encodeBase64Object(packet, callback);
	  }

	  // Sending data as a utf-8 string
	  var encoded = packets[packet.type];

	  // data fragment is optional
	  if (undefined !== packet.data) {
	    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
	  }

	  return callback('' + encoded);

	};

	function encodeBase64Object(packet, callback) {
	  // packet data is an object { base64: true, data: dataAsBase64String }
	  var message = 'b' + exports.packets[packet.type] + packet.data.data;
	  return callback(message);
	}

	/**
	 * Encode packet helpers for binary types
	 */

	function encodeArrayBuffer(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }

	  var data = packet.data;
	  var contentArray = new Uint8Array(data);
	  var resultBuffer = new Uint8Array(1 + data.byteLength);

	  resultBuffer[0] = packets[packet.type];
	  for (var i = 0; i < contentArray.length; i++) {
	    resultBuffer[i+1] = contentArray[i];
	  }

	  return callback(resultBuffer.buffer);
	}

	function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }

	  var fr = new FileReader();
	  fr.onload = function() {
	    packet.data = fr.result;
	    exports.encodePacket(packet, supportsBinary, true, callback);
	  };
	  return fr.readAsArrayBuffer(packet.data);
	}

	function encodeBlob(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }

	  if (dontSendBlobs) {
	    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
	  }

	  var length = new Uint8Array(1);
	  length[0] = packets[packet.type];
	  var blob = new Blob([length.buffer, packet.data]);

	  return callback(blob);
	}

	/**
	 * Encodes a packet with binary data in a base64 string
	 *
	 * @param {Object} packet, has `type` and `data`
	 * @return {String} base64 encoded message
	 */

	exports.encodeBase64Packet = function(packet, callback) {
	  var message = 'b' + exports.packets[packet.type];
	  if (Blob && packet.data instanceof global.Blob) {
	    var fr = new FileReader();
	    fr.onload = function() {
	      var b64 = fr.result.split(',')[1];
	      callback(message + b64);
	    };
	    return fr.readAsDataURL(packet.data);
	  }

	  var b64data;
	  try {
	    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
	  } catch (e) {
	    // iPhone Safari doesn't let you apply with typed arrays
	    var typed = new Uint8Array(packet.data);
	    var basic = new Array(typed.length);
	    for (var i = 0; i < typed.length; i++) {
	      basic[i] = typed[i];
	    }
	    b64data = String.fromCharCode.apply(null, basic);
	  }
	  message += global.btoa(b64data);
	  return callback(message);
	};

	/**
	 * Decodes a packet. Changes format to Blob if requested.
	 *
	 * @return {Object} with `type` and `data` (if any)
	 * @api private
	 */

	exports.decodePacket = function (data, binaryType, utf8decode) {
	  // String data
	  if (typeof data == 'string' || data === undefined) {
	    if (data.charAt(0) == 'b') {
	      return exports.decodeBase64Packet(data.substr(1), binaryType);
	    }

	    if (utf8decode) {
	      try {
	        data = utf8.decode(data);
	      } catch (e) {
	        return err;
	      }
	    }
	    var type = data.charAt(0);

	    if (Number(type) != type || !packetslist[type]) {
	      return err;
	    }

	    if (data.length > 1) {
	      return { type: packetslist[type], data: data.substring(1) };
	    } else {
	      return { type: packetslist[type] };
	    }
	  }

	  var asArray = new Uint8Array(data);
	  var type = asArray[0];
	  var rest = sliceBuffer(data, 1);
	  if (Blob && binaryType === 'blob') {
	    rest = new Blob([rest]);
	  }
	  return { type: packetslist[type], data: rest };
	};

	/**
	 * Decodes a packet encoded in a base64 string
	 *
	 * @param {String} base64 encoded message
	 * @return {Object} with `type` and `data` (if any)
	 */

	exports.decodeBase64Packet = function(msg, binaryType) {
	  var type = packetslist[msg.charAt(0)];
	  if (!global.ArrayBuffer) {
	    return { type: type, data: { base64: true, data: msg.substr(1) } };
	  }

	  var data = base64encoder.decode(msg.substr(1));

	  if (binaryType === 'blob' && Blob) {
	    data = new Blob([data]);
	  }

	  return { type: type, data: data };
	};

	/**
	 * Encodes multiple messages (payload).
	 *
	 *     <length>:data
	 *
	 * Example:
	 *
	 *     11:hello world2:hi
	 *
	 * If any contents are binary, they will be encoded as base64 strings. Base64
	 * encoded strings are marked with a b before the length specifier
	 *
	 * @param {Array} packets
	 * @api private
	 */

	exports.encodePayload = function (packets, supportsBinary, callback) {
	  if (typeof supportsBinary == 'function') {
	    callback = supportsBinary;
	    supportsBinary = null;
	  }

	  var isBinary = hasBinary(packets);

	  if (supportsBinary && isBinary) {
	    if (Blob && !dontSendBlobs) {
	      return exports.encodePayloadAsBlob(packets, callback);
	    }

	    return exports.encodePayloadAsArrayBuffer(packets, callback);
	  }

	  if (!packets.length) {
	    return callback('0:');
	  }

	  function setLengthHeader(message) {
	    return message.length + ':' + message;
	  }

	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
	      doneCallback(null, setLengthHeader(message));
	    });
	  }

	  map(packets, encodeOne, function(err, results) {
	    return callback(results.join(''));
	  });
	};

	/**
	 * Async array map using after
	 */

	function map(ary, each, done) {
	  var result = new Array(ary.length);
	  var next = after(ary.length, done);

	  var eachWithIndex = function(i, el, cb) {
	    each(el, function(error, msg) {
	      result[i] = msg;
	      cb(error, result);
	    });
	  };

	  for (var i = 0; i < ary.length; i++) {
	    eachWithIndex(i, ary[i], next);
	  }
	}

	/*
	 * Decodes data when a payload is maybe expected. Possible binary contents are
	 * decoded from their base64 representation
	 *
	 * @param {String} data, callback method
	 * @api public
	 */

	exports.decodePayload = function (data, binaryType, callback) {
	  if (typeof data != 'string') {
	    return exports.decodePayloadAsBinary(data, binaryType, callback);
	  }

	  if (typeof binaryType === 'function') {
	    callback = binaryType;
	    binaryType = null;
	  }

	  var packet;
	  if (data == '') {
	    // parser error - ignoring payload
	    return callback(err, 0, 1);
	  }

	  var length = ''
	    , n, msg;

	  for (var i = 0, l = data.length; i < l; i++) {
	    var chr = data.charAt(i);

	    if (':' != chr) {
	      length += chr;
	    } else {
	      if ('' == length || (length != (n = Number(length)))) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }

	      msg = data.substr(i + 1, n);

	      if (length != msg.length) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }

	      if (msg.length) {
	        packet = exports.decodePacket(msg, binaryType, true);

	        if (err.type == packet.type && err.data == packet.data) {
	          // parser error in individual packet - ignoring payload
	          return callback(err, 0, 1);
	        }

	        var ret = callback(packet, i + n, l);
	        if (false === ret) return;
	      }

	      // advance cursor
	      i += n;
	      length = '';
	    }
	  }

	  if (length != '') {
	    // parser error - ignoring payload
	    return callback(err, 0, 1);
	  }

	};

	/**
	 * Encodes multiple messages (payload) as binary.
	 *
	 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
	 * 255><data>
	 *
	 * Example:
	 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
	 *
	 * @param {Array} packets
	 * @return {ArrayBuffer} encoded payload
	 * @api private
	 */

	exports.encodePayloadAsArrayBuffer = function(packets, callback) {
	  if (!packets.length) {
	    return callback(new ArrayBuffer(0));
	  }

	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, true, true, function(data) {
	      return doneCallback(null, data);
	    });
	  }

	  map(packets, encodeOne, function(err, encodedPackets) {
	    var totalLength = encodedPackets.reduce(function(acc, p) {
	      var len;
	      if (typeof p === 'string'){
	        len = p.length;
	      } else {
	        len = p.byteLength;
	      }
	      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
	    }, 0);

	    var resultArray = new Uint8Array(totalLength);

	    var bufferIndex = 0;
	    encodedPackets.forEach(function(p) {
	      var isString = typeof p === 'string';
	      var ab = p;
	      if (isString) {
	        var view = new Uint8Array(p.length);
	        for (var i = 0; i < p.length; i++) {
	          view[i] = p.charCodeAt(i);
	        }
	        ab = view.buffer;
	      }

	      if (isString) { // not true binary
	        resultArray[bufferIndex++] = 0;
	      } else { // true binary
	        resultArray[bufferIndex++] = 1;
	      }

	      var lenStr = ab.byteLength.toString();
	      for (var i = 0; i < lenStr.length; i++) {
	        resultArray[bufferIndex++] = parseInt(lenStr[i]);
	      }
	      resultArray[bufferIndex++] = 255;

	      var view = new Uint8Array(ab);
	      for (var i = 0; i < view.length; i++) {
	        resultArray[bufferIndex++] = view[i];
	      }
	    });

	    return callback(resultArray.buffer);
	  });
	};

	/**
	 * Encode as Blob
	 */

	exports.encodePayloadAsBlob = function(packets, callback) {
	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, true, true, function(encoded) {
	      var binaryIdentifier = new Uint8Array(1);
	      binaryIdentifier[0] = 1;
	      if (typeof encoded === 'string') {
	        var view = new Uint8Array(encoded.length);
	        for (var i = 0; i < encoded.length; i++) {
	          view[i] = encoded.charCodeAt(i);
	        }
	        encoded = view.buffer;
	        binaryIdentifier[0] = 0;
	      }

	      var len = (encoded instanceof ArrayBuffer)
	        ? encoded.byteLength
	        : encoded.size;

	      var lenStr = len.toString();
	      var lengthAry = new Uint8Array(lenStr.length + 1);
	      for (var i = 0; i < lenStr.length; i++) {
	        lengthAry[i] = parseInt(lenStr[i]);
	      }
	      lengthAry[lenStr.length] = 255;

	      if (Blob) {
	        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
	        doneCallback(null, blob);
	      }
	    });
	  }

	  map(packets, encodeOne, function(err, results) {
	    return callback(new Blob(results));
	  });
	};

	/*
	 * Decodes data when a payload is maybe expected. Strings are decoded by
	 * interpreting each byte as a key code for entries marked to start with 0. See
	 * description of encodePayloadAsBinary
	 *
	 * @param {ArrayBuffer} data, callback method
	 * @api public
	 */

	exports.decodePayloadAsBinary = function (data, binaryType, callback) {
	  if (typeof binaryType === 'function') {
	    callback = binaryType;
	    binaryType = null;
	  }

	  var bufferTail = data;
	  var buffers = [];

	  var numberTooLong = false;
	  while (bufferTail.byteLength > 0) {
	    var tailArray = new Uint8Array(bufferTail);
	    var isString = tailArray[0] === 0;
	    var msgLength = '';

	    for (var i = 1; ; i++) {
	      if (tailArray[i] == 255) break;

	      if (msgLength.length > 310) {
	        numberTooLong = true;
	        break;
	      }

	      msgLength += tailArray[i];
	    }

	    if(numberTooLong) return callback(err, 0, 1);

	    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
	    msgLength = parseInt(msgLength);

	    var msg = sliceBuffer(bufferTail, 0, msgLength);
	    if (isString) {
	      try {
	        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
	      } catch (e) {
	        // iPhone Safari doesn't let you apply to typed arrays
	        var typed = new Uint8Array(msg);
	        msg = '';
	        for (var i = 0; i < typed.length; i++) {
	          msg += String.fromCharCode(typed[i]);
	        }
	      }
	    }

	    buffers.push(msg);
	    bufferTail = sliceBuffer(bufferTail, msgLength);
	  }

	  var total = buffers.length;
	  buffers.forEach(function(buffer, i) {
	    callback(exports.decodePacket(buffer, binaryType, true), i, total);
	  });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 31 */
/***/ function(module, exports) {

	
	/**
	 * Gets the keys for an object.
	 *
	 * @return {Array} keys
	 * @api private
	 */

	module.exports = Object.keys || function keys (obj){
	  var arr = [];
	  var has = Object.prototype.hasOwnProperty;

	  for (var i in obj) {
	    if (has.call(obj, i)) {
	      arr.push(i);
	    }
	  }
	  return arr;
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	 * Module requirements.
	 */

	var isArray = __webpack_require__(33);

	/**
	 * Module exports.
	 */

	module.exports = hasBinary;

	/**
	 * Checks for binary data.
	 *
	 * Right now only Buffer and ArrayBuffer are supported..
	 *
	 * @param {Object} anything
	 * @api public
	 */

	function hasBinary(data) {

	  function _hasBinary(obj) {
	    if (!obj) return false;

	    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
	         (global.Blob && obj instanceof Blob) ||
	         (global.File && obj instanceof File)
	        ) {
	      return true;
	    }

	    if (isArray(obj)) {
	      for (var i = 0; i < obj.length; i++) {
	          if (_hasBinary(obj[i])) {
	              return true;
	          }
	      }
	    } else if (obj && 'object' == typeof obj) {
	      if (obj.toJSON) {
	        obj = obj.toJSON();
	      }

	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
	          return true;
	        }
	      }
	    }

	    return false;
	  }

	  return _hasBinary(data);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 34 */
/***/ function(module, exports) {

	/**
	 * An abstraction for slicing an arraybuffer even when
	 * ArrayBuffer.prototype.slice is not supported
	 *
	 * @api public
	 */

	module.exports = function(arraybuffer, start, end) {
	  var bytes = arraybuffer.byteLength;
	  start = start || 0;
	  end = end || bytes;

	  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

	  if (start < 0) { start += bytes; }
	  if (end < 0) { end += bytes; }
	  if (end > bytes) { end = bytes; }

	  if (start >= bytes || start >= end || bytes === 0) {
	    return new ArrayBuffer(0);
	  }

	  var abv = new Uint8Array(arraybuffer);
	  var result = new Uint8Array(end - start);
	  for (var i = start, ii = 0; i < end; i++, ii++) {
	    result[ii] = abv[i];
	  }
	  return result.buffer;
	};


/***/ },
/* 35 */
/***/ function(module, exports) {

	/*
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */
	(function(chars){
	  "use strict";

	  exports.encode = function(arraybuffer) {
	    var bytes = new Uint8Array(arraybuffer),
	    i, len = bytes.length, base64 = "";

	    for (i = 0; i < len; i+=3) {
	      base64 += chars[bytes[i] >> 2];
	      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
	      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
	      base64 += chars[bytes[i + 2] & 63];
	    }

	    if ((len % 3) === 2) {
	      base64 = base64.substring(0, base64.length - 1) + "=";
	    } else if (len % 3 === 1) {
	      base64 = base64.substring(0, base64.length - 2) + "==";
	    }

	    return base64;
	  };

	  exports.decode =  function(base64) {
	    var bufferLength = base64.length * 0.75,
	    len = base64.length, i, p = 0,
	    encoded1, encoded2, encoded3, encoded4;

	    if (base64[base64.length - 1] === "=") {
	      bufferLength--;
	      if (base64[base64.length - 2] === "=") {
	        bufferLength--;
	      }
	    }

	    var arraybuffer = new ArrayBuffer(bufferLength),
	    bytes = new Uint8Array(arraybuffer);

	    for (i = 0; i < len; i+=4) {
	      encoded1 = chars.indexOf(base64[i]);
	      encoded2 = chars.indexOf(base64[i+1]);
	      encoded3 = chars.indexOf(base64[i+2]);
	      encoded4 = chars.indexOf(base64[i+3]);

	      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
	      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
	      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
	    }

	    return arraybuffer;
	  };
	})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");


/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = after

	function after(count, callback, err_cb) {
	    var bail = false
	    err_cb = err_cb || noop
	    proxy.count = count

	    return (count === 0) ? callback() : proxy

	    function proxy(err, result) {
	        if (proxy.count <= 0) {
	            throw new Error('after called too many times')
	        }
	        --proxy.count

	        // after first error, rest are passed to err_cb
	        if (err) {
	            bail = true
	            callback(err)
	            // future error callbacks will go to error handler
	            callback = err_cb
	        } else if (proxy.count === 0 && !bail) {
	            callback(null, result)
	        }
	    }
	}

	function noop() {}


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/utf8js v2.0.0 by @mathias */
	;(function(root) {

		// Detect free variables `exports`
		var freeExports = typeof exports == 'object' && exports;

		// Detect free variable `module`
		var freeModule = typeof module == 'object' && module &&
			module.exports == freeExports && module;

		// Detect free variable `global`, from Node.js or Browserified code,
		// and use it as `root`
		var freeGlobal = typeof global == 'object' && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
			root = freeGlobal;
		}

		/*--------------------------------------------------------------------------*/

		var stringFromCharCode = String.fromCharCode;

		// Taken from https://mths.be/punycode
		function ucs2decode(string) {
			var output = [];
			var counter = 0;
			var length = string.length;
			var value;
			var extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		// Taken from https://mths.be/punycode
		function ucs2encode(array) {
			var length = array.length;
			var index = -1;
			var value;
			var output = '';
			while (++index < length) {
				value = array[index];
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
			}
			return output;
		}

		function checkScalarValue(codePoint) {
			if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
				throw Error(
					'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
					' is not a scalar value'
				);
			}
		}
		/*--------------------------------------------------------------------------*/

		function createByte(codePoint, shift) {
			return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
		}

		function encodeCodePoint(codePoint) {
			if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
				return stringFromCharCode(codePoint);
			}
			var symbol = '';
			if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
				symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
			}
			else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
				checkScalarValue(codePoint);
				symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
				symbol += createByte(codePoint, 6);
			}
			else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
				symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
				symbol += createByte(codePoint, 12);
				symbol += createByte(codePoint, 6);
			}
			symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
			return symbol;
		}

		function utf8encode(string) {
			var codePoints = ucs2decode(string);
			var length = codePoints.length;
			var index = -1;
			var codePoint;
			var byteString = '';
			while (++index < length) {
				codePoint = codePoints[index];
				byteString += encodeCodePoint(codePoint);
			}
			return byteString;
		}

		/*--------------------------------------------------------------------------*/

		function readContinuationByte() {
			if (byteIndex >= byteCount) {
				throw Error('Invalid byte index');
			}

			var continuationByte = byteArray[byteIndex] & 0xFF;
			byteIndex++;

			if ((continuationByte & 0xC0) == 0x80) {
				return continuationByte & 0x3F;
			}

			// If we end up here, it’s not a continuation byte
			throw Error('Invalid continuation byte');
		}

		function decodeSymbol() {
			var byte1;
			var byte2;
			var byte3;
			var byte4;
			var codePoint;

			if (byteIndex > byteCount) {
				throw Error('Invalid byte index');
			}

			if (byteIndex == byteCount) {
				return false;
			}

			// Read first byte
			byte1 = byteArray[byteIndex] & 0xFF;
			byteIndex++;

			// 1-byte sequence (no continuation bytes)
			if ((byte1 & 0x80) == 0) {
				return byte1;
			}

			// 2-byte sequence
			if ((byte1 & 0xE0) == 0xC0) {
				var byte2 = readContinuationByte();
				codePoint = ((byte1 & 0x1F) << 6) | byte2;
				if (codePoint >= 0x80) {
					return codePoint;
				} else {
					throw Error('Invalid continuation byte');
				}
			}

			// 3-byte sequence (may include unpaired surrogates)
			if ((byte1 & 0xF0) == 0xE0) {
				byte2 = readContinuationByte();
				byte3 = readContinuationByte();
				codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
				if (codePoint >= 0x0800) {
					checkScalarValue(codePoint);
					return codePoint;
				} else {
					throw Error('Invalid continuation byte');
				}
			}

			// 4-byte sequence
			if ((byte1 & 0xF8) == 0xF0) {
				byte2 = readContinuationByte();
				byte3 = readContinuationByte();
				byte4 = readContinuationByte();
				codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
					(byte3 << 0x06) | byte4;
				if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
					return codePoint;
				}
			}

			throw Error('Invalid UTF-8 detected');
		}

		var byteArray;
		var byteCount;
		var byteIndex;
		function utf8decode(byteString) {
			byteArray = ucs2decode(byteString);
			byteCount = byteArray.length;
			byteIndex = 0;
			var codePoints = [];
			var tmp;
			while ((tmp = decodeSymbol()) !== false) {
				codePoints.push(tmp);
			}
			return ucs2encode(codePoints);
		}

		/*--------------------------------------------------------------------------*/

		var utf8 = {
			'version': '2.0.0',
			'encode': utf8encode,
			'decode': utf8decode
		};

		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return utf8;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}	else if (freeExports && !freeExports.nodeType) {
			if (freeModule) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = utf8;
			} else { // in Narwhal or RingoJS v0.7.0-
				var object = {};
				var hasOwnProperty = object.hasOwnProperty;
				for (var key in utf8) {
					hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.utf8 = utf8;
		}

	}(this));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)(module), (function() { return this; }())))

/***/ },
/* 38 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Create a blob builder even when vendor prefixes exist
	 */

	var BlobBuilder = global.BlobBuilder
	  || global.WebKitBlobBuilder
	  || global.MSBlobBuilder
	  || global.MozBlobBuilder;

	/**
	 * Check if Blob constructor is supported
	 */

	var blobSupported = (function() {
	  try {
	    var a = new Blob(['hi']);
	    return a.size === 2;
	  } catch(e) {
	    return false;
	  }
	})();

	/**
	 * Check if Blob constructor supports ArrayBufferViews
	 * Fails in Safari 6, so we need to map to ArrayBuffers there.
	 */

	var blobSupportsArrayBufferView = blobSupported && (function() {
	  try {
	    var b = new Blob([new Uint8Array([1,2])]);
	    return b.size === 2;
	  } catch(e) {
	    return false;
	  }
	})();

	/**
	 * Check if BlobBuilder is supported
	 */

	var blobBuilderSupported = BlobBuilder
	  && BlobBuilder.prototype.append
	  && BlobBuilder.prototype.getBlob;

	/**
	 * Helper function that maps ArrayBufferViews to ArrayBuffers
	 * Used by BlobBuilder constructor and old browsers that didn't
	 * support it in the Blob constructor.
	 */

	function mapArrayBufferViews(ary) {
	  for (var i = 0; i < ary.length; i++) {
	    var chunk = ary[i];
	    if (chunk.buffer instanceof ArrayBuffer) {
	      var buf = chunk.buffer;

	      // if this is a subarray, make a copy so we only
	      // include the subarray region from the underlying buffer
	      if (chunk.byteLength !== buf.byteLength) {
	        var copy = new Uint8Array(chunk.byteLength);
	        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
	        buf = copy.buffer;
	      }

	      ary[i] = buf;
	    }
	  }
	}

	function BlobBuilderConstructor(ary, options) {
	  options = options || {};

	  var bb = new BlobBuilder();
	  mapArrayBufferViews(ary);

	  for (var i = 0; i < ary.length; i++) {
	    bb.append(ary[i]);
	  }

	  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
	};

	function BlobConstructor(ary, options) {
	  mapArrayBufferViews(ary);
	  return new Blob(ary, options || {});
	};

	module.exports = (function() {
	  if (blobSupported) {
	    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
	  } else if (blobBuilderSupported) {
	    return BlobBuilderConstructor;
	  } else {
	    return undefined;
	  }
	})();

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 39 */
/***/ function(module, exports) {

	/**
	 * Compiles a querystring
	 * Returns string representation of the object
	 *
	 * @param {Object}
	 * @api private
	 */

	exports.encode = function (obj) {
	  var str = '';

	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      if (str.length) str += '&';
	      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
	    }
	  }

	  return str;
	};

	/**
	 * Parses a simple querystring into an object
	 *
	 * @param {String} qs
	 * @api private
	 */

	exports.decode = function(qs){
	  var qry = {};
	  var pairs = qs.split('&');
	  for (var i = 0, l = pairs.length; i < l; i++) {
	    var pair = pairs[i].split('=');
	    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	  }
	  return qry;
	};


/***/ },
/* 40 */
/***/ function(module, exports) {

	
	module.exports = function(a, b){
	  var fn = function(){};
	  fn.prototype = b.prototype;
	  a.prototype = new fn;
	  a.prototype.constructor = a;
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';

	var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
	  , length = 64
	  , map = {}
	  , seed = 0
	  , i = 0
	  , prev;

	/**
	 * Return a string representing the specified number.
	 *
	 * @param {Number} num The number to convert.
	 * @returns {String} The string representation of the number.
	 * @api public
	 */
	function encode(num) {
	  var encoded = '';

	  do {
	    encoded = alphabet[num % length] + encoded;
	    num = Math.floor(num / length);
	  } while (num > 0);

	  return encoded;
	}

	/**
	 * Return the integer value specified by the given string.
	 *
	 * @param {String} str The string to convert.
	 * @returns {Number} The integer value represented by the string.
	 * @api public
	 */
	function decode(str) {
	  var decoded = 0;

	  for (i = 0; i < str.length; i++) {
	    decoded = decoded * length + map[str.charAt(i)];
	  }

	  return decoded;
	}

	/**
	 * Yeast: A tiny growing id generator.
	 *
	 * @returns {String} A unique id.
	 * @api public
	 */
	function yeast() {
	  var now = encode(+new Date());

	  if (now !== prev) return seed = 0, prev = now;
	  return now +'.'+ encode(seed++);
	}

	//
	// Map each character to its index.
	//
	for (; i < length; i++) map[alphabet[i]] = i;

	//
	// Expose the `yeast`, `encode` and `decode` functions.
	//
	yeast.encode = encode;
	yeast.decode = decode;
	module.exports = yeast;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module requirements.
	 */

	var Polling = __webpack_require__(28);
	var inherit = __webpack_require__(40);

	/**
	 * Module exports.
	 */

	module.exports = JSONPPolling;

	/**
	 * Cached regular expressions.
	 */

	var rNewline = /\n/g;
	var rEscapedNewline = /\\n/g;

	/**
	 * Global JSONP callbacks.
	 */

	var callbacks;

	/**
	 * Callbacks count.
	 */

	var index = 0;

	/**
	 * Noop.
	 */

	function empty () { }

	/**
	 * JSONP Polling constructor.
	 *
	 * @param {Object} opts.
	 * @api public
	 */

	function JSONPPolling (opts) {
	  Polling.call(this, opts);

	  this.query = this.query || {};

	  // define global callbacks array if not present
	  // we do this here (lazily) to avoid unneeded global pollution
	  if (!callbacks) {
	    // we need to consider multiple engines in the same page
	    if (!global.___eio) global.___eio = [];
	    callbacks = global.___eio;
	  }

	  // callback identifier
	  this.index = callbacks.length;

	  // add callback to jsonp global
	  var self = this;
	  callbacks.push(function (msg) {
	    self.onData(msg);
	  });

	  // append to query string
	  this.query.j = this.index;

	  // prevent spurious errors from being emitted when the window is unloaded
	  if (global.document && global.addEventListener) {
	    global.addEventListener('beforeunload', function () {
	      if (self.script) self.script.onerror = empty;
	    }, false);
	  }
	}

	/**
	 * Inherits from Polling.
	 */

	inherit(JSONPPolling, Polling);

	/*
	 * JSONP only supports binary as base64 encoded strings
	 */

	JSONPPolling.prototype.supportsBinary = false;

	/**
	 * Closes the socket.
	 *
	 * @api private
	 */

	JSONPPolling.prototype.doClose = function () {
	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }

	  if (this.form) {
	    this.form.parentNode.removeChild(this.form);
	    this.form = null;
	    this.iframe = null;
	  }

	  Polling.prototype.doClose.call(this);
	};

	/**
	 * Starts a poll cycle.
	 *
	 * @api private
	 */

	JSONPPolling.prototype.doPoll = function () {
	  var self = this;
	  var script = document.createElement('script');

	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }

	  script.async = true;
	  script.src = this.uri();
	  script.onerror = function(e){
	    self.onError('jsonp poll error',e);
	  };

	  var insertAt = document.getElementsByTagName('script')[0];
	  if (insertAt) {
	    insertAt.parentNode.insertBefore(script, insertAt);
	  }
	  else {
	    (document.head || document.body).appendChild(script);
	  }
	  this.script = script;

	  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
	  
	  if (isUAgecko) {
	    setTimeout(function () {
	      var iframe = document.createElement('iframe');
	      document.body.appendChild(iframe);
	      document.body.removeChild(iframe);
	    }, 100);
	  }
	};

	/**
	 * Writes with a hidden iframe.
	 *
	 * @param {String} data to send
	 * @param {Function} called upon flush.
	 * @api private
	 */

	JSONPPolling.prototype.doWrite = function (data, fn) {
	  var self = this;

	  if (!this.form) {
	    var form = document.createElement('form');
	    var area = document.createElement('textarea');
	    var id = this.iframeId = 'eio_iframe_' + this.index;
	    var iframe;

	    form.className = 'socketio';
	    form.style.position = 'absolute';
	    form.style.top = '-1000px';
	    form.style.left = '-1000px';
	    form.target = id;
	    form.method = 'POST';
	    form.setAttribute('accept-charset', 'utf-8');
	    area.name = 'd';
	    form.appendChild(area);
	    document.body.appendChild(form);

	    this.form = form;
	    this.area = area;
	  }

	  this.form.action = this.uri();

	  function complete () {
	    initIframe();
	    fn();
	  }

	  function initIframe () {
	    if (self.iframe) {
	      try {
	        self.form.removeChild(self.iframe);
	      } catch (e) {
	        self.onError('jsonp polling iframe removal error', e);
	      }
	    }

	    try {
	      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
	      iframe = document.createElement(html);
	    } catch (e) {
	      iframe = document.createElement('iframe');
	      iframe.name = self.iframeId;
	      iframe.src = 'javascript:0';
	    }

	    iframe.id = self.iframeId;

	    self.form.appendChild(iframe);
	    self.iframe = iframe;
	  }

	  initIframe();

	  // escape \n to prevent it from being converted into \r\n by some UAs
	  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
	  data = data.replace(rEscapedNewline, '\\\n');
	  this.area.value = data.replace(rNewline, '\\n');

	  try {
	    this.form.submit();
	  } catch(e) {}

	  if (this.iframe.attachEvent) {
	    this.iframe.onreadystatechange = function(){
	      if (self.iframe.readyState == 'complete') {
	        complete();
	      }
	    };
	  } else {
	    this.iframe.onload = complete;
	  }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */

	var Transport = __webpack_require__(29);
	var parser = __webpack_require__(30);
	var parseqs = __webpack_require__(39);
	var inherit = __webpack_require__(40);
	var yeast = __webpack_require__(41);
	var debug = __webpack_require__(9)('engine.io-client:websocket');
	var BrowserWebSocket = global.WebSocket || global.MozWebSocket;

	/**
	 * Get either the `WebSocket` or `MozWebSocket` globals
	 * in the browser or try to resolve WebSocket-compatible
	 * interface exposed by `ws` for Node-like environment.
	 */

	var WebSocket = BrowserWebSocket;
	if (!WebSocket && typeof window === 'undefined') {
	  try {
	    WebSocket = __webpack_require__(44);
	  } catch (e) { }
	}

	/**
	 * Module exports.
	 */

	module.exports = WS;

	/**
	 * WebSocket transport constructor.
	 *
	 * @api {Object} connection options
	 * @api public
	 */

	function WS(opts){
	  var forceBase64 = (opts && opts.forceBase64);
	  if (forceBase64) {
	    this.supportsBinary = false;
	  }
	  this.perMessageDeflate = opts.perMessageDeflate;
	  Transport.call(this, opts);
	}

	/**
	 * Inherits from Transport.
	 */

	inherit(WS, Transport);

	/**
	 * Transport name.
	 *
	 * @api public
	 */

	WS.prototype.name = 'websocket';

	/*
	 * WebSockets support binary
	 */

	WS.prototype.supportsBinary = true;

	/**
	 * Opens socket.
	 *
	 * @api private
	 */

	WS.prototype.doOpen = function(){
	  if (!this.check()) {
	    // let probe timeout
	    return;
	  }

	  var self = this;
	  var uri = this.uri();
	  var protocols = void(0);
	  var opts = {
	    agent: this.agent,
	    perMessageDeflate: this.perMessageDeflate
	  };

	  // SSL options for Node.js client
	  opts.pfx = this.pfx;
	  opts.key = this.key;
	  opts.passphrase = this.passphrase;
	  opts.cert = this.cert;
	  opts.ca = this.ca;
	  opts.ciphers = this.ciphers;
	  opts.rejectUnauthorized = this.rejectUnauthorized;
	  if (this.extraHeaders) {
	    opts.headers = this.extraHeaders;
	  }

	  this.ws = BrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);

	  if (this.ws.binaryType === undefined) {
	    this.supportsBinary = false;
	  }

	  if (this.ws.supports && this.ws.supports.binary) {
	    this.supportsBinary = true;
	    this.ws.binaryType = 'buffer';
	  } else {
	    this.ws.binaryType = 'arraybuffer';
	  }

	  this.addEventListeners();
	};

	/**
	 * Adds event listeners to the socket
	 *
	 * @api private
	 */

	WS.prototype.addEventListeners = function(){
	  var self = this;

	  this.ws.onopen = function(){
	    self.onOpen();
	  };
	  this.ws.onclose = function(){
	    self.onClose();
	  };
	  this.ws.onmessage = function(ev){
	    self.onData(ev.data);
	  };
	  this.ws.onerror = function(e){
	    self.onError('websocket error', e);
	  };
	};

	/**
	 * Override `onData` to use a timer on iOS.
	 * See: https://gist.github.com/mloughran/2052006
	 *
	 * @api private
	 */

	if ('undefined' != typeof navigator
	  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
	  WS.prototype.onData = function(data){
	    var self = this;
	    setTimeout(function(){
	      Transport.prototype.onData.call(self, data);
	    }, 0);
	  };
	}

	/**
	 * Writes data to socket.
	 *
	 * @param {Array} array of packets.
	 * @api private
	 */

	WS.prototype.write = function(packets){
	  var self = this;
	  this.writable = false;

	  // encodePacket efficient as it uses WS framing
	  // no need for encodePayload
	  var total = packets.length;
	  for (var i = 0, l = total; i < l; i++) {
	    (function(packet) {
	      parser.encodePacket(packet, self.supportsBinary, function(data) {
	        if (!BrowserWebSocket) {
	          // always create a new object (GH-437)
	          var opts = {};
	          if (packet.options) {
	            opts.compress = packet.options.compress;
	          }

	          if (self.perMessageDeflate) {
	            var len = 'string' == typeof data ? global.Buffer.byteLength(data) : data.length;
	            if (len < self.perMessageDeflate.threshold) {
	              opts.compress = false;
	            }
	          }
	        }

	        //Sometimes the websocket has already been closed but the browser didn't
	        //have a chance of informing us about it yet, in that case send will
	        //throw an error
	        try {
	          if (BrowserWebSocket) {
	            // TypeError is thrown when passing the second argument on Safari
	            self.ws.send(data);
	          } else {
	            self.ws.send(data, opts);
	          }
	        } catch (e){
	          debug('websocket closed before onclose event');
	        }

	        --total || done();
	      });
	    })(packets[i]);
	  }

	  function done(){
	    self.emit('flush');

	    // fake drain
	    // defer to next tick to allow Socket to clear writeBuffer
	    setTimeout(function(){
	      self.writable = true;
	      self.emit('drain');
	    }, 0);
	  }
	};

	/**
	 * Called upon close
	 *
	 * @api private
	 */

	WS.prototype.onClose = function(){
	  Transport.prototype.onClose.call(this);
	};

	/**
	 * Closes socket.
	 *
	 * @api private
	 */

	WS.prototype.doClose = function(){
	  if (typeof this.ws !== 'undefined') {
	    this.ws.close();
	  }
	};

	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */

	WS.prototype.uri = function(){
	  var query = this.query || {};
	  var schema = this.secure ? 'wss' : 'ws';
	  var port = '';

	  // avoid port if default for schema
	  if (this.port && (('wss' == schema && this.port != 443)
	    || ('ws' == schema && this.port != 80))) {
	    port = ':' + this.port;
	  }

	  // append timestamp to URI
	  if (this.timestampRequests) {
	    query[this.timestampParam] = yeast();
	  }

	  // communicate binary support capabilities
	  if (!this.supportsBinary) {
	    query.b64 = 1;
	  }

	  query = parseqs.encode(query);

	  // prepend ? to query
	  if (query.length) {
	    query = '?' + query;
	  }

	  var ipv6 = this.hostname.indexOf(':') !== -1;
	  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
	};

	/**
	 * Feature detection for WebSocket.
	 *
	 * @return {Boolean} whether this transport is available.
	 * @api public
	 */

	WS.prototype.check = function(){
	  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 44 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 45 */
/***/ function(module, exports) {

	
	var indexOf = [].indexOf;

	module.exports = function(arr, obj){
	  if (indexOf) return arr.indexOf(obj);
	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	};

/***/ },
/* 46 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * JSON parse.
	 *
	 * @see Based on jQuery#parseJSON (MIT) and JSON2
	 * @api private
	 */

	var rvalidchars = /^[\],:{}\s]*$/;
	var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
	var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
	var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	var rtrimLeft = /^\s+/;
	var rtrimRight = /\s+$/;

	module.exports = function parsejson(data) {
	  if ('string' != typeof data || !data) {
	    return null;
	  }

	  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

	  // Attempt to parse using the native JSON parser first
	  if (global.JSON && JSON.parse) {
	    return JSON.parse(data);
	  }

	  if (rvalidchars.test(data.replace(rvalidescape, '@')
	      .replace(rvalidtokens, ']')
	      .replace(rvalidbraces, ''))) {
	    return (new Function('return ' + data))();
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var parser = __webpack_require__(12);
	var Emitter = __webpack_require__(48);
	var toArray = __webpack_require__(49);
	var on = __webpack_require__(50);
	var bind = __webpack_require__(51);
	var debug = __webpack_require__(9)('socket.io-client:socket');
	var hasBin = __webpack_require__(52);

	/**
	 * Module exports.
	 */

	module.exports = exports = Socket;

	/**
	 * Internal events (blacklisted).
	 * These events can't be emitted by the user.
	 *
	 * @api private
	 */

	var events = {
	  connect: 1,
	  connect_error: 1,
	  connect_timeout: 1,
	  connecting: 1,
	  disconnect: 1,
	  error: 1,
	  reconnect: 1,
	  reconnect_attempt: 1,
	  reconnect_failed: 1,
	  reconnect_error: 1,
	  reconnecting: 1,
	  ping: 1,
	  pong: 1
	};

	/**
	 * Shortcut to `Emitter#emit`.
	 */

	var emit = Emitter.prototype.emit;

	/**
	 * `Socket` constructor.
	 *
	 * @api public
	 */

	function Socket(io, nsp){
	  this.io = io;
	  this.nsp = nsp;
	  this.json = this; // compat
	  this.ids = 0;
	  this.acks = {};
	  this.receiveBuffer = [];
	  this.sendBuffer = [];
	  this.connected = false;
	  this.disconnected = true;
	  if (this.io.autoConnect) this.open();
	}

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Socket.prototype);

	/**
	 * Subscribe to open, close and packet events
	 *
	 * @api private
	 */

	Socket.prototype.subEvents = function() {
	  if (this.subs) return;

	  var io = this.io;
	  this.subs = [
	    on(io, 'open', bind(this, 'onopen')),
	    on(io, 'packet', bind(this, 'onpacket')),
	    on(io, 'close', bind(this, 'onclose'))
	  ];
	};

	/**
	 * "Opens" the socket.
	 *
	 * @api public
	 */

	Socket.prototype.open =
	Socket.prototype.connect = function(){
	  if (this.connected) return this;

	  this.subEvents();
	  this.io.open(); // ensure open
	  if ('open' == this.io.readyState) this.onopen();
	  this.emit('connecting');
	  return this;
	};

	/**
	 * Sends a `message` event.
	 *
	 * @return {Socket} self
	 * @api public
	 */

	Socket.prototype.send = function(){
	  var args = toArray(arguments);
	  args.unshift('message');
	  this.emit.apply(this, args);
	  return this;
	};

	/**
	 * Override `emit`.
	 * If the event is in `events`, it's emitted normally.
	 *
	 * @param {String} event name
	 * @return {Socket} self
	 * @api public
	 */

	Socket.prototype.emit = function(ev){
	  if (events.hasOwnProperty(ev)) {
	    emit.apply(this, arguments);
	    return this;
	  }

	  var args = toArray(arguments);
	  var parserType = parser.EVENT; // default
	  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
	  var packet = { type: parserType, data: args };

	  packet.options = {};
	  packet.options.compress = !this.flags || false !== this.flags.compress;

	  // event ack callback
	  if ('function' == typeof args[args.length - 1]) {
	    debug('emitting packet with ack id %d', this.ids);
	    this.acks[this.ids] = args.pop();
	    packet.id = this.ids++;
	  }

	  if (this.connected) {
	    this.packet(packet);
	  } else {
	    this.sendBuffer.push(packet);
	  }

	  delete this.flags;

	  return this;
	};

	/**
	 * Sends a packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.packet = function(packet){
	  packet.nsp = this.nsp;
	  this.io.packet(packet);
	};

	/**
	 * Called upon engine `open`.
	 *
	 * @api private
	 */

	Socket.prototype.onopen = function(){
	  debug('transport is open - connecting');

	  // write connect packet if necessary
	  if ('/' != this.nsp) {
	    this.packet({ type: parser.CONNECT });
	  }
	};

	/**
	 * Called upon engine `close`.
	 *
	 * @param {String} reason
	 * @api private
	 */

	Socket.prototype.onclose = function(reason){
	  debug('close (%s)', reason);
	  this.connected = false;
	  this.disconnected = true;
	  delete this.id;
	  this.emit('disconnect', reason);
	};

	/**
	 * Called with socket packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.onpacket = function(packet){
	  if (packet.nsp != this.nsp) return;

	  switch (packet.type) {
	    case parser.CONNECT:
	      this.onconnect();
	      break;

	    case parser.EVENT:
	      this.onevent(packet);
	      break;

	    case parser.BINARY_EVENT:
	      this.onevent(packet);
	      break;

	    case parser.ACK:
	      this.onack(packet);
	      break;

	    case parser.BINARY_ACK:
	      this.onack(packet);
	      break;

	    case parser.DISCONNECT:
	      this.ondisconnect();
	      break;

	    case parser.ERROR:
	      this.emit('error', packet.data);
	      break;
	  }
	};

	/**
	 * Called upon a server event.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.onevent = function(packet){
	  var args = packet.data || [];
	  debug('emitting event %j', args);

	  if (null != packet.id) {
	    debug('attaching ack callback to event');
	    args.push(this.ack(packet.id));
	  }

	  if (this.connected) {
	    emit.apply(this, args);
	  } else {
	    this.receiveBuffer.push(args);
	  }
	};

	/**
	 * Produces an ack callback to emit with an event.
	 *
	 * @api private
	 */

	Socket.prototype.ack = function(id){
	  var self = this;
	  var sent = false;
	  return function(){
	    // prevent double callbacks
	    if (sent) return;
	    sent = true;
	    var args = toArray(arguments);
	    debug('sending ack %j', args);

	    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
	    self.packet({
	      type: type,
	      id: id,
	      data: args
	    });
	  };
	};

	/**
	 * Called upon a server acknowlegement.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.onack = function(packet){
	  var ack = this.acks[packet.id];
	  if ('function' == typeof ack) {
	    debug('calling ack %s with %j', packet.id, packet.data);
	    ack.apply(this, packet.data);
	    delete this.acks[packet.id];
	  } else {
	    debug('bad ack %s', packet.id);
	  }
	};

	/**
	 * Called upon server connect.
	 *
	 * @api private
	 */

	Socket.prototype.onconnect = function(){
	  this.connected = true;
	  this.disconnected = false;
	  this.emit('connect');
	  this.emitBuffered();
	};

	/**
	 * Emit buffered events (received and emitted).
	 *
	 * @api private
	 */

	Socket.prototype.emitBuffered = function(){
	  var i;
	  for (i = 0; i < this.receiveBuffer.length; i++) {
	    emit.apply(this, this.receiveBuffer[i]);
	  }
	  this.receiveBuffer = [];

	  for (i = 0; i < this.sendBuffer.length; i++) {
	    this.packet(this.sendBuffer[i]);
	  }
	  this.sendBuffer = [];
	};

	/**
	 * Called upon server disconnect.
	 *
	 * @api private
	 */

	Socket.prototype.ondisconnect = function(){
	  debug('server disconnect (%s)', this.nsp);
	  this.destroy();
	  this.onclose('io server disconnect');
	};

	/**
	 * Called upon forced client/server side disconnections,
	 * this method ensures the manager stops tracking us and
	 * that reconnections don't get triggered for this.
	 *
	 * @api private.
	 */

	Socket.prototype.destroy = function(){
	  if (this.subs) {
	    // clean subscriptions to avoid reconnections
	    for (var i = 0; i < this.subs.length; i++) {
	      this.subs[i].destroy();
	    }
	    this.subs = null;
	  }

	  this.io.destroy(this);
	};

	/**
	 * Disconnects the socket manually.
	 *
	 * @return {Socket} self
	 * @api public
	 */

	Socket.prototype.close =
	Socket.prototype.disconnect = function(){
	  if (this.connected) {
	    debug('performing disconnect (%s)', this.nsp);
	    this.packet({ type: parser.DISCONNECT });
	  }

	  // remove socket from pool
	  this.destroy();

	  if (this.connected) {
	    // fire events
	    this.onclose('io client disconnect');
	  }
	  return this;
	};

	/**
	 * Sets the compress flag.
	 *
	 * @param {Boolean} if `true`, compresses the sending data
	 * @return {Socket} self
	 * @api public
	 */

	Socket.prototype.compress = function(compress){
	  this.flags = this.flags || {};
	  this.flags.compress = compress;
	  return this;
	};


/***/ },
/* 48 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = toArray

	function toArray(list, index) {
	    var array = []

	    index = index || 0

	    for (var i = index || 0; i < list.length; i++) {
	        array[i - index] = list[i]
	    }

	    return array
	}


/***/ },
/* 50 */
/***/ function(module, exports) {

	
	/**
	 * Module exports.
	 */

	module.exports = on;

	/**
	 * Helper for subscriptions.
	 *
	 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
	 * @param {String} event name
	 * @param {Function} callback
	 * @api public
	 */

	function on(obj, ev, fn) {
	  obj.on(ev, fn);
	  return {
	    destroy: function(){
	      obj.removeListener(ev, fn);
	    }
	  };
	}


/***/ },
/* 51 */
/***/ function(module, exports) {

	/**
	 * Slice reference.
	 */

	var slice = [].slice;

	/**
	 * Bind `obj` to `fn`.
	 *
	 * @param {Object} obj
	 * @param {Function|String} fn or string
	 * @return {Function}
	 * @api public
	 */

	module.exports = function(obj, fn){
	  if ('string' == typeof fn) fn = obj[fn];
	  if ('function' != typeof fn) throw new Error('bind() requires a function');
	  var args = slice.call(arguments, 2);
	  return function(){
	    return fn.apply(obj, args.concat(slice.call(arguments)));
	  }
	};


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	 * Module requirements.
	 */

	var isArray = __webpack_require__(53);

	/**
	 * Module exports.
	 */

	module.exports = hasBinary;

	/**
	 * Checks for binary data.
	 *
	 * Right now only Buffer and ArrayBuffer are supported..
	 *
	 * @param {Object} anything
	 * @api public
	 */

	function hasBinary(data) {

	  function _hasBinary(obj) {
	    if (!obj) return false;

	    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
	         (global.Blob && obj instanceof Blob) ||
	         (global.File && obj instanceof File)
	        ) {
	      return true;
	    }

	    if (isArray(obj)) {
	      for (var i = 0; i < obj.length; i++) {
	          if (_hasBinary(obj[i])) {
	              return true;
	          }
	      }
	    } else if (obj && 'object' == typeof obj) {
	      // see: https://github.com/Automattic/has-binary/pull/4
	      if (obj.toJSON && 'function' == typeof obj.toJSON) {
	        obj = obj.toJSON();
	      }

	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
	          return true;
	        }
	      }
	    }

	    return false;
	  }

	  return _hasBinary(data);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 54 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Backoff`.
	 */

	module.exports = Backoff;

	/**
	 * Initialize backoff timer with `opts`.
	 *
	 * - `min` initial timeout in milliseconds [100]
	 * - `max` max timeout [10000]
	 * - `jitter` [0]
	 * - `factor` [2]
	 *
	 * @param {Object} opts
	 * @api public
	 */

	function Backoff(opts) {
	  opts = opts || {};
	  this.ms = opts.min || 100;
	  this.max = opts.max || 10000;
	  this.factor = opts.factor || 2;
	  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
	  this.attempts = 0;
	}

	/**
	 * Return the backoff duration.
	 *
	 * @return {Number}
	 * @api public
	 */

	Backoff.prototype.duration = function(){
	  var ms = this.ms * Math.pow(this.factor, this.attempts++);
	  if (this.jitter) {
	    var rand =  Math.random();
	    var deviation = Math.floor(rand * this.jitter * ms);
	    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
	  }
	  return Math.min(ms, this.max) | 0;
	};

	/**
	 * Reset the number of attempts.
	 *
	 * @api public
	 */

	Backoff.prototype.reset = function(){
	  this.attempts = 0;
	};

	/**
	 * Set the minimum duration
	 *
	 * @api public
	 */

	Backoff.prototype.setMin = function(min){
	  this.ms = min;
	};

	/**
	 * Set the maximum duration
	 *
	 * @api public
	 */

	Backoff.prototype.setMax = function(max){
	  this.max = max;
	};

	/**
	 * Set the jitter
	 *
	 * @api public
	 */

	Backoff.prototype.setJitter = function(jitter){
	  this.jitter = jitter;
	};



/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * interact.js v1.2.6
	 *
	 * Copyright (c) 2012-2015 Taye Adeyemi <dev@taye.me>
	 * Open source under the MIT License.
	 * https://raw.github.com/taye/interact.js/master/LICENSE
	 */
	(function (realWindow) {
	    'use strict';

	    // return early if there's no window to work with (eg. Node.js)
	    if (!realWindow) { return; }

	    var // get wrapped window if using Shadow DOM polyfill
	        window = (function () {
	            // create a TextNode
	            var el = realWindow.document.createTextNode('');

	            // check if it's wrapped by a polyfill
	            if (el.ownerDocument !== realWindow.document
	                && typeof realWindow.wrap === 'function'
	                && realWindow.wrap(el) === el) {
	                // return wrapped window
	                return realWindow.wrap(realWindow);
	            }

	            // no Shadow DOM polyfil or native implementation
	            return realWindow;
	        }()),

	        document           = window.document,
	        DocumentFragment   = window.DocumentFragment   || blank,
	        SVGElement         = window.SVGElement         || blank,
	        SVGSVGElement      = window.SVGSVGElement      || blank,
	        SVGElementInstance = window.SVGElementInstance || blank,
	        HTMLElement        = window.HTMLElement        || window.Element,

	        PointerEvent = (window.PointerEvent || window.MSPointerEvent),
	        pEventTypes,

	        hypot = Math.hypot || function (x, y) { return Math.sqrt(x * x + y * y); },

	        tmpXY = {},     // reduce object creation in getXY()

	        documents       = [],   // all documents being listened to

	        interactables   = [],   // all set interactables
	        interactions    = [],   // all interactions

	        dynamicDrop     = false,

	        // {
	        //      type: {
	        //          selectors: ['selector', ...],
	        //          contexts : [document, ...],
	        //          listeners: [[listener, useCapture], ...]
	        //      }
	        //  }
	        delegatedEvents = {},

	        defaultOptions = {
	            base: {
	                accept        : null,
	                actionChecker : null,
	                styleCursor   : true,
	                preventDefault: 'auto',
	                origin        : { x: 0, y: 0 },
	                deltaSource   : 'page',
	                allowFrom     : null,
	                ignoreFrom    : null,
	                _context      : document,
	                dropChecker   : null
	            },

	            drag: {
	                enabled: false,
	                manualStart: true,
	                max: Infinity,
	                maxPerElement: 1,

	                snap: null,
	                restrict: null,
	                inertia: null,
	                autoScroll: null,

	                axis: 'xy'
	            },

	            drop: {
	                enabled: false,
	                accept: null,
	                overlap: 'pointer'
	            },

	            resize: {
	                enabled: false,
	                manualStart: false,
	                max: Infinity,
	                maxPerElement: 1,

	                snap: null,
	                restrict: null,
	                inertia: null,
	                autoScroll: null,

	                square: false,
	                preserveAspectRatio: false,
	                axis: 'xy',

	                // use default margin
	                margin: NaN,

	                // object with props left, right, top, bottom which are
	                // true/false values to resize when the pointer is over that edge,
	                // CSS selectors to match the handles for each direction
	                // or the Elements for each handle
	                edges: null,

	                // a value of 'none' will limit the resize rect to a minimum of 0x0
	                // 'negate' will alow the rect to have negative width/height
	                // 'reposition' will keep the width/height positive by swapping
	                // the top and bottom edges and/or swapping the left and right edges
	                invert: 'none'
	            },

	            gesture: {
	                manualStart: false,
	                enabled: false,
	                max: Infinity,
	                maxPerElement: 1,

	                restrict: null
	            },

	            perAction: {
	                manualStart: false,
	                max: Infinity,
	                maxPerElement: 1,

	                snap: {
	                    enabled     : false,
	                    endOnly     : false,
	                    range       : Infinity,
	                    targets     : null,
	                    offsets     : null,

	                    relativePoints: null
	                },

	                restrict: {
	                    enabled: false,
	                    endOnly: false
	                },

	                autoScroll: {
	                    enabled     : false,
	                    container   : null,     // the item that is scrolled (Window or HTMLElement)
	                    margin      : 60,
	                    speed       : 300       // the scroll speed in pixels per second
	                },

	                inertia: {
	                    enabled          : false,
	                    resistance       : 10,    // the lambda in exponential decay
	                    minSpeed         : 100,   // target speed must be above this for inertia to start
	                    endSpeed         : 10,    // the speed at which inertia is slow enough to stop
	                    allowResume      : true,  // allow resuming an action in inertia phase
	                    zeroResumeDelta  : true,  // if an action is resumed after launch, set dx/dy to 0
	                    smoothEndDuration: 300    // animate to snap/restrict endOnly if there's no inertia
	                }
	            },

	            _holdDuration: 600
	        },

	        // Things related to autoScroll
	        autoScroll = {
	            interaction: null,
	            i: null,    // the handle returned by window.setInterval
	            x: 0, y: 0, // Direction each pulse is to scroll in

	            // scroll the window by the values in scroll.x/y
	            scroll: function () {
	                var options = autoScroll.interaction.target.options[autoScroll.interaction.prepared.name].autoScroll,
	                    container = options.container || getWindow(autoScroll.interaction.element),
	                    now = new Date().getTime(),
	                    // change in time in seconds
	                    dtx = (now - autoScroll.prevTimeX) / 1000,
	                    dty = (now - autoScroll.prevTimeY) / 1000,
	                    vx, vy, sx, sy;

	                // displacement
	                if (options.velocity) {
	                  vx = options.velocity.x;
	                  vy = options.velocity.y;
	                }
	                else {
	                  vx = vy = options.speed
	                }
	 
	                sx = vx * dtx;
	                sy = vy * dty;

	                if (sx >= 1 || sy >= 1) {
	                    if (isWindow(container)) {
	                        container.scrollBy(autoScroll.x * sx, autoScroll.y * sy);
	                    }
	                    else if (container) {
	                        container.scrollLeft += autoScroll.x * sx;
	                        container.scrollTop  += autoScroll.y * sy;
	                    }

	                    if (sx >=1) autoScroll.prevTimeX = now;
	                    if (sy >= 1) autoScroll.prevTimeY = now;
	                }

	                if (autoScroll.isScrolling) {
	                    cancelFrame(autoScroll.i);
	                    autoScroll.i = reqFrame(autoScroll.scroll);
	                }
	            },

	            isScrolling: false,
	            prevTimeX: 0,
	            prevTimeY: 0,

	            start: function (interaction) {
	                autoScroll.isScrolling = true;
	                cancelFrame(autoScroll.i);

	                autoScroll.interaction = interaction;
	                autoScroll.prevTimeX = new Date().getTime();
	                autoScroll.prevTimeY = new Date().getTime();
	                autoScroll.i = reqFrame(autoScroll.scroll);
	            },

	            stop: function () {
	                autoScroll.isScrolling = false;
	                cancelFrame(autoScroll.i);
	            }
	        },

	        // Does the browser support touch input?
	        supportsTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),

	        // Does the browser support PointerEvents
	        supportsPointerEvent = !!PointerEvent,

	        // Less Precision with touch input
	        margin = supportsTouch || supportsPointerEvent? 20: 10,

	        pointerMoveTolerance = 1,

	        // for ignoring browser's simulated mouse events
	        prevTouchTime = 0,

	        // Allow this many interactions to happen simultaneously
	        maxInteractions = Infinity,

	        // Check if is IE9 or older
	        actionCursors = (document.all && !window.atob) ? {
	            drag    : 'move',
	            resizex : 'e-resize',
	            resizey : 's-resize',
	            resizexy: 'se-resize',

	            resizetop        : 'n-resize',
	            resizeleft       : 'w-resize',
	            resizebottom     : 's-resize',
	            resizeright      : 'e-resize',
	            resizetopleft    : 'se-resize',
	            resizebottomright: 'se-resize',
	            resizetopright   : 'ne-resize',
	            resizebottomleft : 'ne-resize',

	            gesture : ''
	        } : {
	            drag    : 'move',
	            resizex : 'ew-resize',
	            resizey : 'ns-resize',
	            resizexy: 'nwse-resize',

	            resizetop        : 'ns-resize',
	            resizeleft       : 'ew-resize',
	            resizebottom     : 'ns-resize',
	            resizeright      : 'ew-resize',
	            resizetopleft    : 'nwse-resize',
	            resizebottomright: 'nwse-resize',
	            resizetopright   : 'nesw-resize',
	            resizebottomleft : 'nesw-resize',

	            gesture : ''
	        },

	        actionIsEnabled = {
	            drag   : true,
	            resize : true,
	            gesture: true
	        },

	        // because Webkit and Opera still use 'mousewheel' event type
	        wheelEvent = 'onmousewheel' in document? 'mousewheel': 'wheel',

	        eventTypes = [
	            'dragstart',
	            'dragmove',
	            'draginertiastart',
	            'dragend',
	            'dragenter',
	            'dragleave',
	            'dropactivate',
	            'dropdeactivate',
	            'dropmove',
	            'drop',
	            'resizestart',
	            'resizemove',
	            'resizeinertiastart',
	            'resizeend',
	            'gesturestart',
	            'gesturemove',
	            'gestureinertiastart',
	            'gestureend',

	            'down',
	            'move',
	            'up',
	            'cancel',
	            'tap',
	            'doubletap',
	            'hold'
	        ],

	        globalEvents = {},

	        // Opera Mobile must be handled differently
	        isOperaMobile = navigator.appName == 'Opera' &&
	            supportsTouch &&
	            navigator.userAgent.match('Presto'),

	        // scrolling doesn't change the result of getClientRects on iOS 7
	        isIOS7 = (/iP(hone|od|ad)/.test(navigator.platform)
	                         && /OS 7[^\d]/.test(navigator.appVersion)),

	        // prefix matchesSelector
	        prefixedMatchesSelector = 'matches' in Element.prototype?
	                'matches': 'webkitMatchesSelector' in Element.prototype?
	                    'webkitMatchesSelector': 'mozMatchesSelector' in Element.prototype?
	                        'mozMatchesSelector': 'oMatchesSelector' in Element.prototype?
	                            'oMatchesSelector': 'msMatchesSelector',

	        // will be polyfill function if browser is IE8
	        ie8MatchesSelector,

	        // native requestAnimationFrame or polyfill
	        reqFrame = realWindow.requestAnimationFrame,
	        cancelFrame = realWindow.cancelAnimationFrame,

	        // Events wrapper
	        events = (function () {
	            var useAttachEvent = ('attachEvent' in window) && !('addEventListener' in window),
	                addEvent       = useAttachEvent?  'attachEvent': 'addEventListener',
	                removeEvent    = useAttachEvent?  'detachEvent': 'removeEventListener',
	                on             = useAttachEvent? 'on': '',

	                elements          = [],
	                targets           = [],
	                attachedListeners = [];

	            function add (element, type, listener, useCapture) {
	                var elementIndex = indexOf(elements, element),
	                    target = targets[elementIndex];

	                if (!target) {
	                    target = {
	                        events: {},
	                        typeCount: 0
	                    };

	                    elementIndex = elements.push(element) - 1;
	                    targets.push(target);

	                    attachedListeners.push((useAttachEvent ? {
	                            supplied: [],
	                            wrapped : [],
	                            useCount: []
	                        } : null));
	                }

	                if (!target.events[type]) {
	                    target.events[type] = [];
	                    target.typeCount++;
	                }

	                if (!contains(target.events[type], listener)) {
	                    var ret;

	                    if (useAttachEvent) {
	                        var listeners = attachedListeners[elementIndex],
	                            listenerIndex = indexOf(listeners.supplied, listener);

	                        var wrapped = listeners.wrapped[listenerIndex] || function (event) {
	                            if (!event.immediatePropagationStopped) {
	                                event.target = event.srcElement;
	                                event.currentTarget = element;

	                                event.preventDefault = event.preventDefault || preventDef;
	                                event.stopPropagation = event.stopPropagation || stopProp;
	                                event.stopImmediatePropagation = event.stopImmediatePropagation || stopImmProp;

	                                if (/mouse|click/.test(event.type)) {
	                                    event.pageX = event.clientX + getWindow(element).document.documentElement.scrollLeft;
	                                    event.pageY = event.clientY + getWindow(element).document.documentElement.scrollTop;
	                                }

	                                listener(event);
	                            }
	                        };

	                        ret = element[addEvent](on + type, wrapped, Boolean(useCapture));

	                        if (listenerIndex === -1) {
	                            listeners.supplied.push(listener);
	                            listeners.wrapped.push(wrapped);
	                            listeners.useCount.push(1);
	                        }
	                        else {
	                            listeners.useCount[listenerIndex]++;
	                        }
	                    }
	                    else {
	                        ret = element[addEvent](type, listener, useCapture || false);
	                    }
	                    target.events[type].push(listener);

	                    return ret;
	                }
	            }

	            function remove (element, type, listener, useCapture) {
	                var i,
	                    elementIndex = indexOf(elements, element),
	                    target = targets[elementIndex],
	                    listeners,
	                    listenerIndex,
	                    wrapped = listener;

	                if (!target || !target.events) {
	                    return;
	                }

	                if (useAttachEvent) {
	                    listeners = attachedListeners[elementIndex];
	                    listenerIndex = indexOf(listeners.supplied, listener);
	                    wrapped = listeners.wrapped[listenerIndex];
	                }

	                if (type === 'all') {
	                    for (type in target.events) {
	                        if (target.events.hasOwnProperty(type)) {
	                            remove(element, type, 'all');
	                        }
	                    }
	                    return;
	                }

	                if (target.events[type]) {
	                    var len = target.events[type].length;

	                    if (listener === 'all') {
	                        for (i = 0; i < len; i++) {
	                            remove(element, type, target.events[type][i], Boolean(useCapture));
	                        }
	                        return;
	                    } else {
	                        for (i = 0; i < len; i++) {
	                            if (target.events[type][i] === listener) {
	                                element[removeEvent](on + type, wrapped, useCapture || false);
	                                target.events[type].splice(i, 1);

	                                if (useAttachEvent && listeners) {
	                                    listeners.useCount[listenerIndex]--;
	                                    if (listeners.useCount[listenerIndex] === 0) {
	                                        listeners.supplied.splice(listenerIndex, 1);
	                                        listeners.wrapped.splice(listenerIndex, 1);
	                                        listeners.useCount.splice(listenerIndex, 1);
	                                    }
	                                }

	                                break;
	                            }
	                        }
	                    }

	                    if (target.events[type] && target.events[type].length === 0) {
	                        target.events[type] = null;
	                        target.typeCount--;
	                    }
	                }

	                if (!target.typeCount) {
	                    targets.splice(elementIndex, 1);
	                    elements.splice(elementIndex, 1);
	                    attachedListeners.splice(elementIndex, 1);
	                }
	            }

	            function preventDef () {
	                this.returnValue = false;
	            }

	            function stopProp () {
	                this.cancelBubble = true;
	            }

	            function stopImmProp () {
	                this.cancelBubble = true;
	                this.immediatePropagationStopped = true;
	            }

	            return {
	                add: add,
	                remove: remove,
	                useAttachEvent: useAttachEvent,

	                _elements: elements,
	                _targets: targets,
	                _attachedListeners: attachedListeners
	            };
	        }());

	    function blank () {}

	    function isElement (o) {
	        if (!o || (typeof o !== 'object')) { return false; }

	        var _window = getWindow(o) || window;

	        return (/object|function/.test(typeof _window.Element)
	            ? o instanceof _window.Element //DOM2
	            : o.nodeType === 1 && typeof o.nodeName === "string");
	    }
	    function isWindow (thing) { return thing === window || !!(thing && thing.Window) && (thing instanceof thing.Window); }
	    function isDocFrag (thing) { return !!thing && thing instanceof DocumentFragment; }
	    function isArray (thing) {
	        return isObject(thing)
	                && (typeof thing.length !== undefined)
	                && isFunction(thing.splice);
	    }
	    function isObject   (thing) { return !!thing && (typeof thing === 'object'); }
	    function isFunction (thing) { return typeof thing === 'function'; }
	    function isNumber   (thing) { return typeof thing === 'number'  ; }
	    function isBool     (thing) { return typeof thing === 'boolean' ; }
	    function isString   (thing) { return typeof thing === 'string'  ; }

	    function trySelector (value) {
	        if (!isString(value)) { return false; }

	        // an exception will be raised if it is invalid
	        document.querySelector(value);
	        return true;
	    }

	    function extend (dest, source) {
	        for (var prop in source) {
	            dest[prop] = source[prop];
	        }
	        return dest;
	    }

	    var prefixedPropREs = {
	      webkit: /(Movement[XY]|Radius[XY]|RotationAngle|Force)$/
	    };

	    function pointerExtend (dest, source) {
	        for (var prop in source) {
	          var deprecated = false;

	          // skip deprecated prefixed properties
	          for (var vendor in prefixedPropREs) {
	            if (prop.indexOf(vendor) === 0 && prefixedPropREs[vendor].test(prop)) {
	              deprecated = true;
	              break;
	            }
	          }

	          if (!deprecated) {
	            dest[prop] = source[prop];
	          }
	        }
	        return dest;
	    }

	    function copyCoords (dest, src) {
	        dest.page = dest.page || {};
	        dest.page.x = src.page.x;
	        dest.page.y = src.page.y;

	        dest.client = dest.client || {};
	        dest.client.x = src.client.x;
	        dest.client.y = src.client.y;

	        dest.timeStamp = src.timeStamp;
	    }

	    function setEventXY (targetObj, pointers, interaction) {
	        var pointer = (pointers.length > 1
	                       ? pointerAverage(pointers)
	                       : pointers[0]);

	        getPageXY(pointer, tmpXY, interaction);
	        targetObj.page.x = tmpXY.x;
	        targetObj.page.y = tmpXY.y;

	        getClientXY(pointer, tmpXY, interaction);
	        targetObj.client.x = tmpXY.x;
	        targetObj.client.y = tmpXY.y;

	        targetObj.timeStamp = new Date().getTime();
	    }

	    function setEventDeltas (targetObj, prev, cur) {
	        targetObj.page.x     = cur.page.x      - prev.page.x;
	        targetObj.page.y     = cur.page.y      - prev.page.y;
	        targetObj.client.x   = cur.client.x    - prev.client.x;
	        targetObj.client.y   = cur.client.y    - prev.client.y;
	        targetObj.timeStamp = new Date().getTime() - prev.timeStamp;

	        // set pointer velocity
	        var dt = Math.max(targetObj.timeStamp / 1000, 0.001);
	        targetObj.page.speed   = hypot(targetObj.page.x, targetObj.page.y) / dt;
	        targetObj.page.vx      = targetObj.page.x / dt;
	        targetObj.page.vy      = targetObj.page.y / dt;

	        targetObj.client.speed = hypot(targetObj.client.x, targetObj.page.y) / dt;
	        targetObj.client.vx    = targetObj.client.x / dt;
	        targetObj.client.vy    = targetObj.client.y / dt;
	    }

	    function isNativePointer (pointer) {
	        return (pointer instanceof window.Event
	            || (supportsTouch && window.Touch && pointer instanceof window.Touch));
	    }

	    // Get specified X/Y coords for mouse or event.touches[0]
	    function getXY (type, pointer, xy) {
	        xy = xy || {};
	        type = type || 'page';

	        xy.x = pointer[type + 'X'];
	        xy.y = pointer[type + 'Y'];

	        return xy;
	    }

	    function getPageXY (pointer, page) {
	        page = page || {};

	        // Opera Mobile handles the viewport and scrolling oddly
	        if (isOperaMobile && isNativePointer(pointer)) {
	            getXY('screen', pointer, page);

	            page.x += window.scrollX;
	            page.y += window.scrollY;
	        }
	        else {
	            getXY('page', pointer, page);
	        }

	        return page;
	    }

	    function getClientXY (pointer, client) {
	        client = client || {};

	        if (isOperaMobile && isNativePointer(pointer)) {
	            // Opera Mobile handles the viewport and scrolling oddly
	            getXY('screen', pointer, client);
	        }
	        else {
	          getXY('client', pointer, client);
	        }

	        return client;
	    }

	    function getScrollXY (win) {
	        win = win || window;
	        return {
	            x: win.scrollX || win.document.documentElement.scrollLeft,
	            y: win.scrollY || win.document.documentElement.scrollTop
	        };
	    }

	    function getPointerId (pointer) {
	        return isNumber(pointer.pointerId)? pointer.pointerId : pointer.identifier;
	    }

	    function getActualElement (element) {
	        return (element instanceof SVGElementInstance
	            ? element.correspondingUseElement
	            : element);
	    }

	    function getWindow (node) {
	        if (isWindow(node)) {
	            return node;
	        }

	        var rootNode = (node.ownerDocument || node);

	        return rootNode.defaultView || rootNode.parentWindow || window;
	    }

	    function getElementClientRect (element) {
	        var clientRect = (element instanceof SVGElement
	                            ? element.getBoundingClientRect()
	                            : element.getClientRects()[0]);

	        return clientRect && {
	            left  : clientRect.left,
	            right : clientRect.right,
	            top   : clientRect.top,
	            bottom: clientRect.bottom,
	            width : clientRect.width || clientRect.right - clientRect.left,
	            height: clientRect.height || clientRect.bottom - clientRect.top
	        };
	    }

	    function getElementRect (element) {
	        var clientRect = getElementClientRect(element);

	        if (!isIOS7 && clientRect) {
	            var scroll = getScrollXY(getWindow(element));

	            clientRect.left   += scroll.x;
	            clientRect.right  += scroll.x;
	            clientRect.top    += scroll.y;
	            clientRect.bottom += scroll.y;
	        }

	        return clientRect;
	    }

	    function getTouchPair (event) {
	        var touches = [];

	        // array of touches is supplied
	        if (isArray(event)) {
	            touches[0] = event[0];
	            touches[1] = event[1];
	        }
	        // an event
	        else {
	            if (event.type === 'touchend') {
	                if (event.touches.length === 1) {
	                    touches[0] = event.touches[0];
	                    touches[1] = event.changedTouches[0];
	                }
	                else if (event.touches.length === 0) {
	                    touches[0] = event.changedTouches[0];
	                    touches[1] = event.changedTouches[1];
	                }
	            }
	            else {
	                touches[0] = event.touches[0];
	                touches[1] = event.touches[1];
	            }
	        }

	        return touches;
	    }

	    function pointerAverage (pointers) {
	        var average = {
	            pageX  : 0,
	            pageY  : 0,
	            clientX: 0,
	            clientY: 0,
	            screenX: 0,
	            screenY: 0
	        };
	        var prop;

	        for (var i = 0; i < pointers.length; i++) {
	            for (prop in average) {
	                average[prop] += pointers[i][prop];
	            }
	        }
	        for (prop in average) {
	            average[prop] /= pointers.length;
	        }

	        return average;
	    }

	    function touchBBox (event) {
	        if (!event.length && !(event.touches && event.touches.length > 1)) {
	            return;
	        }

	        var touches = getTouchPair(event),
	            minX = Math.min(touches[0].pageX, touches[1].pageX),
	            minY = Math.min(touches[0].pageY, touches[1].pageY),
	            maxX = Math.max(touches[0].pageX, touches[1].pageX),
	            maxY = Math.max(touches[0].pageY, touches[1].pageY);

	        return {
	            x: minX,
	            y: minY,
	            left: minX,
	            top: minY,
	            width: maxX - minX,
	            height: maxY - minY
	        };
	    }

	    function touchDistance (event, deltaSource) {
	        deltaSource = deltaSource || defaultOptions.deltaSource;

	        var sourceX = deltaSource + 'X',
	            sourceY = deltaSource + 'Y',
	            touches = getTouchPair(event);


	        var dx = touches[0][sourceX] - touches[1][sourceX],
	            dy = touches[0][sourceY] - touches[1][sourceY];

	        return hypot(dx, dy);
	    }

	    function touchAngle (event, prevAngle, deltaSource) {
	        deltaSource = deltaSource || defaultOptions.deltaSource;

	        var sourceX = deltaSource + 'X',
	            sourceY = deltaSource + 'Y',
	            touches = getTouchPair(event),
	            dx = touches[0][sourceX] - touches[1][sourceX],
	            dy = touches[0][sourceY] - touches[1][sourceY],
	            angle = 180 * Math.atan(dy / dx) / Math.PI;

	        if (isNumber(prevAngle)) {
	            var dr = angle - prevAngle,
	                drClamped = dr % 360;

	            if (drClamped > 315) {
	                angle -= 360 + (angle / 360)|0 * 360;
	            }
	            else if (drClamped > 135) {
	                angle -= 180 + (angle / 360)|0 * 360;
	            }
	            else if (drClamped < -315) {
	                angle += 360 + (angle / 360)|0 * 360;
	            }
	            else if (drClamped < -135) {
	                angle += 180 + (angle / 360)|0 * 360;
	            }
	        }

	        return  angle;
	    }

	    function getOriginXY (interactable, element) {
	        var origin = interactable
	                ? interactable.options.origin
	                : defaultOptions.origin;

	        if (origin === 'parent') {
	            origin = parentElement(element);
	        }
	        else if (origin === 'self') {
	            origin = interactable.getRect(element);
	        }
	        else if (trySelector(origin)) {
	            origin = closest(element, origin) || { x: 0, y: 0 };
	        }

	        if (isFunction(origin)) {
	            origin = origin(interactable && element);
	        }

	        if (isElement(origin))  {
	            origin = getElementRect(origin);
	        }

	        origin.x = ('x' in origin)? origin.x : origin.left;
	        origin.y = ('y' in origin)? origin.y : origin.top;

	        return origin;
	    }

	    // http://stackoverflow.com/a/5634528/2280888
	    function _getQBezierValue(t, p1, p2, p3) {
	        var iT = 1 - t;
	        return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
	    }

	    function getQuadraticCurvePoint(startX, startY, cpX, cpY, endX, endY, position) {
	        return {
	            x:  _getQBezierValue(position, startX, cpX, endX),
	            y:  _getQBezierValue(position, startY, cpY, endY)
	        };
	    }

	    // http://gizma.com/easing/
	    function easeOutQuad (t, b, c, d) {
	        t /= d;
	        return -c * t*(t-2) + b;
	    }

	    function nodeContains (parent, child) {
	        while (child) {
	            if (child === parent) {
	                return true;
	            }

	            child = child.parentNode;
	        }

	        return false;
	    }

	    function closest (child, selector) {
	        var parent = parentElement(child);

	        while (isElement(parent)) {
	            if (matchesSelector(parent, selector)) { return parent; }

	            parent = parentElement(parent);
	        }

	        return null;
	    }

	    function parentElement (node) {
	        var parent = node.parentNode;

	        if (isDocFrag(parent)) {
	            // skip past #shado-root fragments
	            while ((parent = parent.host) && isDocFrag(parent)) {}

	            return parent;
	        }

	        return parent;
	    }

	    function inContext (interactable, element) {
	        return interactable._context === element.ownerDocument
	                || nodeContains(interactable._context, element);
	    }

	    function testIgnore (interactable, interactableElement, element) {
	        var ignoreFrom = interactable.options.ignoreFrom;

	        if (!ignoreFrom || !isElement(element)) { return false; }

	        if (isString(ignoreFrom)) {
	            return matchesUpTo(element, ignoreFrom, interactableElement);
	        }
	        else if (isElement(ignoreFrom)) {
	            return nodeContains(ignoreFrom, element);
	        }

	        return false;
	    }

	    function testAllow (interactable, interactableElement, element) {
	        var allowFrom = interactable.options.allowFrom;

	        if (!allowFrom) { return true; }

	        if (!isElement(element)) { return false; }

	        if (isString(allowFrom)) {
	            return matchesUpTo(element, allowFrom, interactableElement);
	        }
	        else if (isElement(allowFrom)) {
	            return nodeContains(allowFrom, element);
	        }

	        return false;
	    }

	    function checkAxis (axis, interactable) {
	        if (!interactable) { return false; }

	        var thisAxis = interactable.options.drag.axis;

	        return (axis === 'xy' || thisAxis === 'xy' || thisAxis === axis);
	    }

	    function checkSnap (interactable, action) {
	        var options = interactable.options;

	        if (/^resize/.test(action)) {
	            action = 'resize';
	        }

	        return options[action].snap && options[action].snap.enabled;
	    }

	    function checkRestrict (interactable, action) {
	        var options = interactable.options;

	        if (/^resize/.test(action)) {
	            action = 'resize';
	        }

	        return  options[action].restrict && options[action].restrict.enabled;
	    }

	    function checkAutoScroll (interactable, action) {
	        var options = interactable.options;

	        if (/^resize/.test(action)) {
	            action = 'resize';
	        }

	        return  options[action].autoScroll && options[action].autoScroll.enabled;
	    }

	    function withinInteractionLimit (interactable, element, action) {
	        var options = interactable.options,
	            maxActions = options[action.name].max,
	            maxPerElement = options[action.name].maxPerElement,
	            activeInteractions = 0,
	            targetCount = 0,
	            targetElementCount = 0;

	        for (var i = 0, len = interactions.length; i < len; i++) {
	            var interaction = interactions[i],
	                otherAction = interaction.prepared.name,
	                active = interaction.interacting();

	            if (!active) { continue; }

	            activeInteractions++;

	            if (activeInteractions >= maxInteractions) {
	                return false;
	            }

	            if (interaction.target !== interactable) { continue; }

	            targetCount += (otherAction === action.name)|0;

	            if (targetCount >= maxActions) {
	                return false;
	            }

	            if (interaction.element === element) {
	                targetElementCount++;

	                if (otherAction !== action.name || targetElementCount >= maxPerElement) {
	                    return false;
	                }
	            }
	        }

	        return maxInteractions > 0;
	    }

	    // Test for the element that's "above" all other qualifiers
	    function indexOfDeepestElement (elements) {
	        var dropzone,
	            deepestZone = elements[0],
	            index = deepestZone? 0: -1,
	            parent,
	            deepestZoneParents = [],
	            dropzoneParents = [],
	            child,
	            i,
	            n;

	        for (i = 1; i < elements.length; i++) {
	            dropzone = elements[i];

	            // an element might belong to multiple selector dropzones
	            if (!dropzone || dropzone === deepestZone) {
	                continue;
	            }

	            if (!deepestZone) {
	                deepestZone = dropzone;
	                index = i;
	                continue;
	            }

	            // check if the deepest or current are document.documentElement or document.rootElement
	            // - if the current dropzone is, do nothing and continue
	            if (dropzone.parentNode === dropzone.ownerDocument) {
	                continue;
	            }
	            // - if deepest is, update with the current dropzone and continue to next
	            else if (deepestZone.parentNode === dropzone.ownerDocument) {
	                deepestZone = dropzone;
	                index = i;
	                continue;
	            }

	            if (!deepestZoneParents.length) {
	                parent = deepestZone;
	                while (parent.parentNode && parent.parentNode !== parent.ownerDocument) {
	                    deepestZoneParents.unshift(parent);
	                    parent = parent.parentNode;
	                }
	            }

	            // if this element is an svg element and the current deepest is
	            // an HTMLElement
	            if (deepestZone instanceof HTMLElement
	                && dropzone instanceof SVGElement
	                && !(dropzone instanceof SVGSVGElement)) {

	                if (dropzone === deepestZone.parentNode) {
	                    continue;
	                }

	                parent = dropzone.ownerSVGElement;
	            }
	            else {
	                parent = dropzone;
	            }

	            dropzoneParents = [];

	            while (parent.parentNode !== parent.ownerDocument) {
	                dropzoneParents.unshift(parent);
	                parent = parent.parentNode;
	            }

	            n = 0;

	            // get (position of last common ancestor) + 1
	            while (dropzoneParents[n] && dropzoneParents[n] === deepestZoneParents[n]) {
	                n++;
	            }

	            var parents = [
	                dropzoneParents[n - 1],
	                dropzoneParents[n],
	                deepestZoneParents[n]
	            ];

	            child = parents[0].lastChild;

	            while (child) {
	                if (child === parents[1]) {
	                    deepestZone = dropzone;
	                    index = i;
	                    deepestZoneParents = [];

	                    break;
	                }
	                else if (child === parents[2]) {
	                    break;
	                }

	                child = child.previousSibling;
	            }
	        }

	        return index;
	    }

	    function Interaction () {
	        this.target          = null; // current interactable being interacted with
	        this.element         = null; // the target element of the interactable
	        this.dropTarget      = null; // the dropzone a drag target might be dropped into
	        this.dropElement     = null; // the element at the time of checking
	        this.prevDropTarget  = null; // the dropzone that was recently dragged away from
	        this.prevDropElement = null; // the element at the time of checking

	        this.prepared        = {     // action that's ready to be fired on next move event
	            name : null,
	            axis : null,
	            edges: null
	        };

	        this.matches         = [];   // all selectors that are matched by target element
	        this.matchElements   = [];   // corresponding elements

	        this.inertiaStatus = {
	            active       : false,
	            smoothEnd    : false,
	            ending       : false,

	            startEvent: null,
	            upCoords: {},

	            xe: 0, ye: 0,
	            sx: 0, sy: 0,

	            t0: 0,
	            vx0: 0, vys: 0,
	            duration: 0,

	            resumeDx: 0,
	            resumeDy: 0,

	            lambda_v0: 0,
	            one_ve_v0: 0,
	            i  : null
	        };

	        if (isFunction(Function.prototype.bind)) {
	            this.boundInertiaFrame = this.inertiaFrame.bind(this);
	            this.boundSmoothEndFrame = this.smoothEndFrame.bind(this);
	        }
	        else {
	            var that = this;

	            this.boundInertiaFrame = function () { return that.inertiaFrame(); };
	            this.boundSmoothEndFrame = function () { return that.smoothEndFrame(); };
	        }

	        this.activeDrops = {
	            dropzones: [],      // the dropzones that are mentioned below
	            elements : [],      // elements of dropzones that accept the target draggable
	            rects    : []       // the rects of the elements mentioned above
	        };

	        // keep track of added pointers
	        this.pointers    = [];
	        this.pointerIds  = [];
	        this.downTargets = [];
	        this.downTimes   = [];
	        this.holdTimers  = [];

	        // Previous native pointer move event coordinates
	        this.prevCoords = {
	            page     : { x: 0, y: 0 },
	            client   : { x: 0, y: 0 },
	            timeStamp: 0
	        };
	        // current native pointer move event coordinates
	        this.curCoords = {
	            page     : { x: 0, y: 0 },
	            client   : { x: 0, y: 0 },
	            timeStamp: 0
	        };

	        // Starting InteractEvent pointer coordinates
	        this.startCoords = {
	            page     : { x: 0, y: 0 },
	            client   : { x: 0, y: 0 },
	            timeStamp: 0
	        };

	        // Change in coordinates and time of the pointer
	        this.pointerDelta = {
	            page     : { x: 0, y: 0, vx: 0, vy: 0, speed: 0 },
	            client   : { x: 0, y: 0, vx: 0, vy: 0, speed: 0 },
	            timeStamp: 0
	        };

	        this.downEvent   = null;    // pointerdown/mousedown/touchstart event
	        this.downPointer = {};

	        this._eventTarget    = null;
	        this._curEventTarget = null;

	        this.prevEvent = null;      // previous action event
	        this.tapTime   = 0;         // time of the most recent tap event
	        this.prevTap   = null;

	        this.startOffset    = { left: 0, right: 0, top: 0, bottom: 0 };
	        this.restrictOffset = { left: 0, right: 0, top: 0, bottom: 0 };
	        this.snapOffsets    = [];

	        this.gesture = {
	            start: { x: 0, y: 0 },

	            startDistance: 0,   // distance between two touches of touchStart
	            prevDistance : 0,
	            distance     : 0,

	            scale: 1,           // gesture.distance / gesture.startDistance

	            startAngle: 0,      // angle of line joining two touches
	            prevAngle : 0       // angle of the previous gesture event
	        };

	        this.snapStatus = {
	            x       : 0, y       : 0,
	            dx      : 0, dy      : 0,
	            realX   : 0, realY   : 0,
	            snappedX: 0, snappedY: 0,
	            targets : [],
	            locked  : false,
	            changed : false
	        };

	        this.restrictStatus = {
	            dx         : 0, dy         : 0,
	            restrictedX: 0, restrictedY: 0,
	            snap       : null,
	            restricted : false,
	            changed    : false
	        };

	        this.restrictStatus.snap = this.snapStatus;

	        this.pointerIsDown   = false;
	        this.pointerWasMoved = false;
	        this.gesturing       = false;
	        this.dragging        = false;
	        this.resizing        = false;
	        this.resizeAxes      = 'xy';

	        this.mouse = false;

	        interactions.push(this);
	    }

	    Interaction.prototype = {
	        getPageXY  : function (pointer, xy) { return   getPageXY(pointer, xy, this); },
	        getClientXY: function (pointer, xy) { return getClientXY(pointer, xy, this); },
	        setEventXY : function (target, ptr) { return  setEventXY(target, ptr, this); },

	        pointerOver: function (pointer, event, eventTarget) {
	            if (this.prepared.name || !this.mouse) { return; }

	            var curMatches = [],
	                curMatchElements = [],
	                prevTargetElement = this.element;

	            this.addPointer(pointer);

	            if (this.target
	                && (testIgnore(this.target, this.element, eventTarget)
	                    || !testAllow(this.target, this.element, eventTarget))) {
	                // if the eventTarget should be ignored or shouldn't be allowed
	                // clear the previous target
	                this.target = null;
	                this.element = null;
	                this.matches = [];
	                this.matchElements = [];
	            }

	            var elementInteractable = interactables.get(eventTarget),
	                elementAction = (elementInteractable
	                                 && !testIgnore(elementInteractable, eventTarget, eventTarget)
	                                 && testAllow(elementInteractable, eventTarget, eventTarget)
	                                 && validateAction(
	                                     elementInteractable.getAction(pointer, event, this, eventTarget),
	                                     elementInteractable));

	            if (elementAction && !withinInteractionLimit(elementInteractable, eventTarget, elementAction)) {
	                 elementAction = null;
	            }

	            function pushCurMatches (interactable, selector) {
	                if (interactable
	                    && inContext(interactable, eventTarget)
	                    && !testIgnore(interactable, eventTarget, eventTarget)
	                    && testAllow(interactable, eventTarget, eventTarget)
	                    && matchesSelector(eventTarget, selector)) {

	                    curMatches.push(interactable);
	                    curMatchElements.push(eventTarget);
	                }
	            }

	            if (elementAction) {
	                this.target = elementInteractable;
	                this.element = eventTarget;
	                this.matches = [];
	                this.matchElements = [];
	            }
	            else {
	                interactables.forEachSelector(pushCurMatches);

	                if (this.validateSelector(pointer, event, curMatches, curMatchElements)) {
	                    this.matches = curMatches;
	                    this.matchElements = curMatchElements;

	                    this.pointerHover(pointer, event, this.matches, this.matchElements);
	                    events.add(eventTarget,
	                                        PointerEvent? pEventTypes.move : 'mousemove',
	                                        listeners.pointerHover);
	                }
	                else if (this.target) {
	                    if (nodeContains(prevTargetElement, eventTarget)) {
	                        this.pointerHover(pointer, event, this.matches, this.matchElements);
	                        events.add(this.element,
	                                            PointerEvent? pEventTypes.move : 'mousemove',
	                                            listeners.pointerHover);
	                    }
	                    else {
	                        this.target = null;
	                        this.element = null;
	                        this.matches = [];
	                        this.matchElements = [];
	                    }
	                }
	            }
	        },

	        // Check what action would be performed on pointerMove target if a mouse
	        // button were pressed and change the cursor accordingly
	        pointerHover: function (pointer, event, eventTarget, curEventTarget, matches, matchElements) {
	            var target = this.target;

	            if (!this.prepared.name && this.mouse) {

	                var action;

	                // update pointer coords for defaultActionChecker to use
	                this.setEventXY(this.curCoords, [pointer]);

	                if (matches) {
	                    action = this.validateSelector(pointer, event, matches, matchElements);
	                }
	                else if (target) {
	                    action = validateAction(target.getAction(this.pointers[0], event, this, this.element), this.target);
	                }

	                if (target && target.options.styleCursor) {
	                    if (action) {
	                        target._doc.documentElement.style.cursor = getActionCursor(action);
	                    }
	                    else {
	                        target._doc.documentElement.style.cursor = '';
	                    }
	                }
	            }
	            else if (this.prepared.name) {
	                this.checkAndPreventDefault(event, target, this.element);
	            }
	        },

	        pointerOut: function (pointer, event, eventTarget) {
	            if (this.prepared.name) { return; }

	            // Remove temporary event listeners for selector Interactables
	            if (!interactables.get(eventTarget)) {
	                events.remove(eventTarget,
	                                       PointerEvent? pEventTypes.move : 'mousemove',
	                                       listeners.pointerHover);
	            }

	            if (this.target && this.target.options.styleCursor && !this.interacting()) {
	                this.target._doc.documentElement.style.cursor = '';
	            }
	        },

	        selectorDown: function (pointer, event, eventTarget, curEventTarget) {
	            var that = this,
	                // copy event to be used in timeout for IE8
	                eventCopy = events.useAttachEvent? extend({}, event) : event,
	                element = eventTarget,
	                pointerIndex = this.addPointer(pointer),
	                action;

	            this.holdTimers[pointerIndex] = setTimeout(function () {
	                that.pointerHold(events.useAttachEvent? eventCopy : pointer, eventCopy, eventTarget, curEventTarget);
	            }, defaultOptions._holdDuration);

	            this.pointerIsDown = true;

	            // Check if the down event hits the current inertia target
	            if (this.inertiaStatus.active && this.target.selector) {
	                // climb up the DOM tree from the event target
	                while (isElement(element)) {

	                    // if this element is the current inertia target element
	                    if (element === this.element
	                        // and the prospective action is the same as the ongoing one
	                        && validateAction(this.target.getAction(pointer, event, this, this.element), this.target).name === this.prepared.name) {

	                        // stop inertia so that the next move will be a normal one
	                        cancelFrame(this.inertiaStatus.i);
	                        this.inertiaStatus.active = false;

	                        this.collectEventTargets(pointer, event, eventTarget, 'down');
	                        return;
	                    }
	                    element = parentElement(element);
	                }
	            }

	            // do nothing if interacting
	            if (this.interacting()) {
	                this.collectEventTargets(pointer, event, eventTarget, 'down');
	                return;
	            }

	            function pushMatches (interactable, selector, context) {
	                var elements = ie8MatchesSelector
	                    ? context.querySelectorAll(selector)
	                    : undefined;

	                if (inContext(interactable, element)
	                    && !testIgnore(interactable, element, eventTarget)
	                    && testAllow(interactable, element, eventTarget)
	                    && matchesSelector(element, selector, elements)) {

	                    that.matches.push(interactable);
	                    that.matchElements.push(element);
	                }
	            }

	            // update pointer coords for defaultActionChecker to use
	            this.setEventXY(this.curCoords, [pointer]);
	            this.downEvent = event;

	            while (isElement(element) && !action) {
	                this.matches = [];
	                this.matchElements = [];

	                interactables.forEachSelector(pushMatches);

	                action = this.validateSelector(pointer, event, this.matches, this.matchElements);
	                element = parentElement(element);
	            }

	            if (action) {
	                this.prepared.name  = action.name;
	                this.prepared.axis  = action.axis;
	                this.prepared.edges = action.edges;

	                this.collectEventTargets(pointer, event, eventTarget, 'down');

	                return this.pointerDown(pointer, event, eventTarget, curEventTarget, action);
	            }
	            else {
	                // do these now since pointerDown isn't being called from here
	                this.downTimes[pointerIndex] = new Date().getTime();
	                this.downTargets[pointerIndex] = eventTarget;
	                pointerExtend(this.downPointer, pointer);

	                copyCoords(this.prevCoords, this.curCoords);
	                this.pointerWasMoved = false;
	            }

	            this.collectEventTargets(pointer, event, eventTarget, 'down');
	        },

	        // Determine action to be performed on next pointerMove and add appropriate
	        // style and event Listeners
	        pointerDown: function (pointer, event, eventTarget, curEventTarget, forceAction) {
	            if (!forceAction && !this.inertiaStatus.active && this.pointerWasMoved && this.prepared.name) {
	                this.checkAndPreventDefault(event, this.target, this.element);

	                return;
	            }

	            this.pointerIsDown = true;
	            this.downEvent = event;

	            var pointerIndex = this.addPointer(pointer),
	                action;

	            // If it is the second touch of a multi-touch gesture, keep the
	            // target the same and get a new action if a target was set by the
	            // first touch
	            if (this.pointerIds.length > 1 && this.target._element === this.element) {
	                var newAction = validateAction(forceAction || this.target.getAction(pointer, event, this, this.element), this.target);

	                if (withinInteractionLimit(this.target, this.element, newAction)) {
	                    action = newAction;
	                }

	                this.prepared.name = null;
	            }
	            // Otherwise, set the target if there is no action prepared
	            else if (!this.prepared.name) {
	                var interactable = interactables.get(curEventTarget);

	                if (interactable
	                    && !testIgnore(interactable, curEventTarget, eventTarget)
	                    && testAllow(interactable, curEventTarget, eventTarget)
	                    && (action = validateAction(forceAction || interactable.getAction(pointer, event, this, curEventTarget), interactable, eventTarget))
	                    && withinInteractionLimit(interactable, curEventTarget, action)) {
	                    this.target = interactable;
	                    this.element = curEventTarget;
	                }
	            }

	            var target = this.target,
	                options = target && target.options;

	            if (target && (forceAction || !this.prepared.name)) {
	                action = action || validateAction(forceAction || target.getAction(pointer, event, this, curEventTarget), target, this.element);

	                this.setEventXY(this.startCoords, this.pointers);

	                if (!action) { return; }

	                if (options.styleCursor) {
	                    target._doc.documentElement.style.cursor = getActionCursor(action);
	                }

	                this.resizeAxes = action.name === 'resize'? action.axis : null;

	                if (action === 'gesture' && this.pointerIds.length < 2) {
	                    action = null;
	                }

	                this.prepared.name  = action.name;
	                this.prepared.axis  = action.axis;
	                this.prepared.edges = action.edges;

	                this.snapStatus.snappedX = this.snapStatus.snappedY =
	                    this.restrictStatus.restrictedX = this.restrictStatus.restrictedY = NaN;

	                this.downTimes[pointerIndex] = new Date().getTime();
	                this.downTargets[pointerIndex] = eventTarget;
	                pointerExtend(this.downPointer, pointer);

	                copyCoords(this.prevCoords, this.startCoords);
	                this.pointerWasMoved = false;

	                this.checkAndPreventDefault(event, target, this.element);
	            }
	            // if inertia is active try to resume action
	            else if (this.inertiaStatus.active
	                && curEventTarget === this.element
	                && validateAction(target.getAction(pointer, event, this, this.element), target).name === this.prepared.name) {

	                cancelFrame(this.inertiaStatus.i);
	                this.inertiaStatus.active = false;

	                this.checkAndPreventDefault(event, target, this.element);
	            }
	        },

	        setModifications: function (coords, preEnd) {
	            var target         = this.target,
	                shouldMove     = true,
	                shouldSnap     = checkSnap(target, this.prepared.name)     && (!target.options[this.prepared.name].snap.endOnly     || preEnd),
	                shouldRestrict = checkRestrict(target, this.prepared.name) && (!target.options[this.prepared.name].restrict.endOnly || preEnd);

	            if (shouldSnap    ) { this.setSnapping   (coords); } else { this.snapStatus    .locked     = false; }
	            if (shouldRestrict) { this.setRestriction(coords); } else { this.restrictStatus.restricted = false; }

	            if (shouldSnap && this.snapStatus.locked && !this.snapStatus.changed) {
	                shouldMove = shouldRestrict && this.restrictStatus.restricted && this.restrictStatus.changed;
	            }
	            else if (shouldRestrict && this.restrictStatus.restricted && !this.restrictStatus.changed) {
	                shouldMove = false;
	            }

	            return shouldMove;
	        },

	        setStartOffsets: function (action, interactable, element) {
	            var rect = interactable.getRect(element),
	                origin = getOriginXY(interactable, element),
	                snap = interactable.options[this.prepared.name].snap,
	                restrict = interactable.options[this.prepared.name].restrict,
	                width, height;

	            if (rect) {
	                this.startOffset.left = this.startCoords.page.x - rect.left;
	                this.startOffset.top  = this.startCoords.page.y - rect.top;

	                this.startOffset.right  = rect.right  - this.startCoords.page.x;
	                this.startOffset.bottom = rect.bottom - this.startCoords.page.y;

	                if ('width' in rect) { width = rect.width; }
	                else { width = rect.right - rect.left; }
	                if ('height' in rect) { height = rect.height; }
	                else { height = rect.bottom - rect.top; }
	            }
	            else {
	                this.startOffset.left = this.startOffset.top = this.startOffset.right = this.startOffset.bottom = 0;
	            }

	            this.snapOffsets.splice(0);

	            var snapOffset = snap && snap.offset === 'startCoords'
	                                ? {
	                                    x: this.startCoords.page.x - origin.x,
	                                    y: this.startCoords.page.y - origin.y
	                                }
	                                : snap && snap.offset || { x: 0, y: 0 };

	            if (rect && snap && snap.relativePoints && snap.relativePoints.length) {
	                for (var i = 0; i < snap.relativePoints.length; i++) {
	                    this.snapOffsets.push({
	                        x: this.startOffset.left - (width  * snap.relativePoints[i].x) + snapOffset.x,
	                        y: this.startOffset.top  - (height * snap.relativePoints[i].y) + snapOffset.y
	                    });
	                }
	            }
	            else {
	                this.snapOffsets.push(snapOffset);
	            }

	            if (rect && restrict.elementRect) {
	                this.restrictOffset.left = this.startOffset.left - (width  * restrict.elementRect.left);
	                this.restrictOffset.top  = this.startOffset.top  - (height * restrict.elementRect.top);

	                this.restrictOffset.right  = this.startOffset.right  - (width  * (1 - restrict.elementRect.right));
	                this.restrictOffset.bottom = this.startOffset.bottom - (height * (1 - restrict.elementRect.bottom));
	            }
	            else {
	                this.restrictOffset.left = this.restrictOffset.top = this.restrictOffset.right = this.restrictOffset.bottom = 0;
	            }
	        },

	        /*\
	         * Interaction.start
	         [ method ]
	         *
	         * Start an action with the given Interactable and Element as tartgets. The
	         * action must be enabled for the target Interactable and an appropriate number
	         * of pointers must be held down – 1 for drag/resize, 2 for gesture.
	         *
	         * Use it with `interactable.<action>able({ manualStart: false })` to always
	         * [start actions manually](https://github.com/taye/interact.js/issues/114)
	         *
	         - action       (object)  The action to be performed - drag, resize, etc.
	         - interactable (Interactable) The Interactable to target
	         - element      (Element) The DOM Element to target
	         = (object) interact
	         **
	         | interact(target)
	         |   .draggable({
	         |     // disable the default drag start by down->move
	         |     manualStart: true
	         |   })
	         |   // start dragging after the user holds the pointer down
	         |   .on('hold', function (event) {
	         |     var interaction = event.interaction;
	         |
	         |     if (!interaction.interacting()) {
	         |       interaction.start({ name: 'drag' },
	         |                         event.interactable,
	         |                         event.currentTarget);
	         |     }
	         | });
	        \*/
	        start: function (action, interactable, element) {
	            if (this.interacting()
	                || !this.pointerIsDown
	                || this.pointerIds.length < (action.name === 'gesture'? 2 : 1)) {
	                return;
	            }

	            // if this interaction had been removed after stopping
	            // add it back
	            if (indexOf(interactions, this) === -1) {
	                interactions.push(this);
	            }

	            // set the startCoords if there was no prepared action
	            if (!this.prepared.name) {
	                this.setEventXY(this.startCoords);
	            }

	            this.prepared.name  = action.name;
	            this.prepared.axis  = action.axis;
	            this.prepared.edges = action.edges;
	            this.target         = interactable;
	            this.element        = element;

	            this.setStartOffsets(action.name, interactable, element);
	            this.setModifications(this.startCoords.page);

	            this.prevEvent = this[this.prepared.name + 'Start'](this.downEvent);
	        },

	        pointerMove: function (pointer, event, eventTarget, curEventTarget, preEnd) {
	            if (this.inertiaStatus.active) {
	                var pageUp   = this.inertiaStatus.upCoords.page;
	                var clientUp = this.inertiaStatus.upCoords.client;

	                var inertiaPosition = {
	                    pageX  : pageUp.x   + this.inertiaStatus.sx,
	                    pageY  : pageUp.y   + this.inertiaStatus.sy,
	                    clientX: clientUp.x + this.inertiaStatus.sx,
	                    clientY: clientUp.y + this.inertiaStatus.sy
	                };

	                this.setEventXY(this.curCoords, [inertiaPosition]);
	            }
	            else {
	                this.recordPointer(pointer);
	                this.setEventXY(this.curCoords, this.pointers);
	            }

	            var duplicateMove = (this.curCoords.page.x === this.prevCoords.page.x
	                                 && this.curCoords.page.y === this.prevCoords.page.y
	                                 && this.curCoords.client.x === this.prevCoords.client.x
	                                 && this.curCoords.client.y === this.prevCoords.client.y);

	            var dx, dy,
	                pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

	            // register movement greater than pointerMoveTolerance
	            if (this.pointerIsDown && !this.pointerWasMoved) {
	                dx = this.curCoords.client.x - this.startCoords.client.x;
	                dy = this.curCoords.client.y - this.startCoords.client.y;

	                this.pointerWasMoved = hypot(dx, dy) > pointerMoveTolerance;
	            }

	            if (!duplicateMove && (!this.pointerIsDown || this.pointerWasMoved)) {
	                if (this.pointerIsDown) {
	                    clearTimeout(this.holdTimers[pointerIndex]);
	                }

	                this.collectEventTargets(pointer, event, eventTarget, 'move');
	            }

	            if (!this.pointerIsDown) { return; }

	            if (duplicateMove && this.pointerWasMoved && !preEnd) {
	                this.checkAndPreventDefault(event, this.target, this.element);
	                return;
	            }

	            // set pointer coordinate, time changes and speeds
	            setEventDeltas(this.pointerDelta, this.prevCoords, this.curCoords);

	            if (!this.prepared.name) { return; }

	            if (this.pointerWasMoved
	                // ignore movement while inertia is active
	                && (!this.inertiaStatus.active || (pointer instanceof InteractEvent && /inertiastart/.test(pointer.type)))) {

	                // if just starting an action, calculate the pointer speed now
	                if (!this.interacting()) {
	                    setEventDeltas(this.pointerDelta, this.prevCoords, this.curCoords);

	                    // check if a drag is in the correct axis
	                    if (this.prepared.name === 'drag') {
	                        var absX = Math.abs(dx),
	                            absY = Math.abs(dy),
	                            targetAxis = this.target.options.drag.axis,
	                            axis = (absX > absY ? 'x' : absX < absY ? 'y' : 'xy');

	                        // if the movement isn't in the axis of the interactable
	                        if (axis !== 'xy' && targetAxis !== 'xy' && targetAxis !== axis) {
	                            // cancel the prepared action
	                            this.prepared.name = null;

	                            // then try to get a drag from another ineractable

	                            var element = eventTarget;

	                            // check element interactables
	                            while (isElement(element)) {
	                                var elementInteractable = interactables.get(element);

	                                if (elementInteractable
	                                    && elementInteractable !== this.target
	                                    && !elementInteractable.options.drag.manualStart
	                                    && elementInteractable.getAction(this.downPointer, this.downEvent, this, element).name === 'drag'
	                                    && checkAxis(axis, elementInteractable)) {

	                                    this.prepared.name = 'drag';
	                                    this.target = elementInteractable;
	                                    this.element = element;
	                                    break;
	                                }

	                                element = parentElement(element);
	                            }

	                            // if there's no drag from element interactables,
	                            // check the selector interactables
	                            if (!this.prepared.name) {
	                                var thisInteraction = this;

	                                var getDraggable = function (interactable, selector, context) {
	                                    var elements = ie8MatchesSelector
	                                        ? context.querySelectorAll(selector)
	                                        : undefined;

	                                    if (interactable === thisInteraction.target) { return; }

	                                    if (inContext(interactable, eventTarget)
	                                        && !interactable.options.drag.manualStart
	                                        && !testIgnore(interactable, element, eventTarget)
	                                        && testAllow(interactable, element, eventTarget)
	                                        && matchesSelector(element, selector, elements)
	                                        && interactable.getAction(thisInteraction.downPointer, thisInteraction.downEvent, thisInteraction, element).name === 'drag'
	                                        && checkAxis(axis, interactable)
	                                        && withinInteractionLimit(interactable, element, 'drag')) {

	                                        return interactable;
	                                    }
	                                };

	                                element = eventTarget;

	                                while (isElement(element)) {
	                                    var selectorInteractable = interactables.forEachSelector(getDraggable);

	                                    if (selectorInteractable) {
	                                        this.prepared.name = 'drag';
	                                        this.target = selectorInteractable;
	                                        this.element = element;
	                                        break;
	                                    }

	                                    element = parentElement(element);
	                                }
	                            }
	                        }
	                    }
	                }

	                var starting = !!this.prepared.name && !this.interacting();

	                if (starting
	                    && (this.target.options[this.prepared.name].manualStart
	                        || !withinInteractionLimit(this.target, this.element, this.prepared))) {
	                    this.stop(event);
	                    return;
	                }

	                if (this.prepared.name && this.target) {
	                    if (starting) {
	                        this.start(this.prepared, this.target, this.element);
	                    }

	                    var shouldMove = this.setModifications(this.curCoords.page, preEnd);

	                    // move if snapping or restriction doesn't prevent it
	                    if (shouldMove || starting) {
	                        this.prevEvent = this[this.prepared.name + 'Move'](event);
	                    }

	                    this.checkAndPreventDefault(event, this.target, this.element);
	                }
	            }

	            copyCoords(this.prevCoords, this.curCoords);

	            if (this.dragging || this.resizing) {
	                this.autoScrollMove(pointer);
	            }
	        },

	        dragStart: function (event) {
	            var dragEvent = new InteractEvent(this, event, 'drag', 'start', this.element);

	            this.dragging = true;
	            this.target.fire(dragEvent);

	            // reset active dropzones
	            this.activeDrops.dropzones = [];
	            this.activeDrops.elements  = [];
	            this.activeDrops.rects     = [];

	            if (!this.dynamicDrop) {
	                this.setActiveDrops(this.element);
	            }

	            var dropEvents = this.getDropEvents(event, dragEvent);

	            if (dropEvents.activate) {
	                this.fireActiveDrops(dropEvents.activate);
	            }

	            return dragEvent;
	        },

	        dragMove: function (event) {
	            var target = this.target,
	                dragEvent  = new InteractEvent(this, event, 'drag', 'move', this.element),
	                draggableElement = this.element,
	                drop = this.getDrop(dragEvent, event, draggableElement);

	            this.dropTarget = drop.dropzone;
	            this.dropElement = drop.element;

	            var dropEvents = this.getDropEvents(event, dragEvent);

	            target.fire(dragEvent);

	            if (dropEvents.leave) { this.prevDropTarget.fire(dropEvents.leave); }
	            if (dropEvents.enter) {     this.dropTarget.fire(dropEvents.enter); }
	            if (dropEvents.move ) {     this.dropTarget.fire(dropEvents.move ); }

	            this.prevDropTarget  = this.dropTarget;
	            this.prevDropElement = this.dropElement;

	            return dragEvent;
	        },

	        resizeStart: function (event) {
	            var resizeEvent = new InteractEvent(this, event, 'resize', 'start', this.element);

	            if (this.prepared.edges) {
	                var startRect = this.target.getRect(this.element);

	                /*
	                 * When using the `resizable.square` or `resizable.preserveAspectRatio` options, resizing from one edge
	                 * will affect another. E.g. with `resizable.square`, resizing to make the right edge larger will make
	                 * the bottom edge larger by the same amount. We call these 'linked' edges. Any linked edges will depend
	                 * on the active edges and the edge being interacted with.
	                 */
	                if (this.target.options.resize.square || this.target.options.resize.preserveAspectRatio) {
	                    var linkedEdges = extend({}, this.prepared.edges);

	                    linkedEdges.top    = linkedEdges.top    || (linkedEdges.left   && !linkedEdges.bottom);
	                    linkedEdges.left   = linkedEdges.left   || (linkedEdges.top    && !linkedEdges.right );
	                    linkedEdges.bottom = linkedEdges.bottom || (linkedEdges.right  && !linkedEdges.top   );
	                    linkedEdges.right  = linkedEdges.right  || (linkedEdges.bottom && !linkedEdges.left  );

	                    this.prepared._linkedEdges = linkedEdges;
	                }
	                else {
	                    this.prepared._linkedEdges = null;
	                }

	                // if using `resizable.preserveAspectRatio` option, record aspect ratio at the start of the resize
	                if (this.target.options.resize.preserveAspectRatio) {
	                    this.resizeStartAspectRatio = startRect.width / startRect.height;
	                }

	                this.resizeRects = {
	                    start     : startRect,
	                    current   : extend({}, startRect),
	                    restricted: extend({}, startRect),
	                    previous  : extend({}, startRect),
	                    delta     : {
	                        left: 0, right : 0, width : 0,
	                        top : 0, bottom: 0, height: 0
	                    }
	                };

	                resizeEvent.rect = this.resizeRects.restricted;
	                resizeEvent.deltaRect = this.resizeRects.delta;
	            }

	            this.target.fire(resizeEvent);

	            this.resizing = true;

	            return resizeEvent;
	        },

	        resizeMove: function (event) {
	            var resizeEvent = new InteractEvent(this, event, 'resize', 'move', this.element);

	            var edges = this.prepared.edges,
	                invert = this.target.options.resize.invert,
	                invertible = invert === 'reposition' || invert === 'negate';

	            if (edges) {
	                var dx = resizeEvent.dx,
	                    dy = resizeEvent.dy,

	                    start      = this.resizeRects.start,
	                    current    = this.resizeRects.current,
	                    restricted = this.resizeRects.restricted,
	                    delta      = this.resizeRects.delta,
	                    previous   = extend(this.resizeRects.previous, restricted),

	                    originalEdges = edges;

	                // `resize.preserveAspectRatio` takes precedence over `resize.square`
	                if (this.target.options.resize.preserveAspectRatio) {
	                    var resizeStartAspectRatio = this.resizeStartAspectRatio;

	                    edges = this.prepared._linkedEdges;

	                    if ((originalEdges.left && originalEdges.bottom)
	                        || (originalEdges.right && originalEdges.top)) {
	                        dy = -dx / resizeStartAspectRatio;
	                    }
	                    else if (originalEdges.left || originalEdges.right) { dy = dx / resizeStartAspectRatio; }
	                    else if (originalEdges.top || originalEdges.bottom) { dx = dy * resizeStartAspectRatio; }
	                }
	                else if (this.target.options.resize.square) {
	                    edges = this.prepared._linkedEdges;

	                    if ((originalEdges.left && originalEdges.bottom)
	                        || (originalEdges.right && originalEdges.top)) {
	                        dy = -dx;
	                    }
	                    else if (originalEdges.left || originalEdges.right) { dy = dx; }
	                    else if (originalEdges.top || originalEdges.bottom) { dx = dy; }
	                }

	                // update the 'current' rect without modifications
	                if (edges.top   ) { current.top    += dy; }
	                if (edges.bottom) { current.bottom += dy; }
	                if (edges.left  ) { current.left   += dx; }
	                if (edges.right ) { current.right  += dx; }

	                if (invertible) {
	                    // if invertible, copy the current rect
	                    extend(restricted, current);

	                    if (invert === 'reposition') {
	                        // swap edge values if necessary to keep width/height positive
	                        var swap;

	                        if (restricted.top > restricted.bottom) {
	                            swap = restricted.top;

	                            restricted.top = restricted.bottom;
	                            restricted.bottom = swap;
	                        }
	                        if (restricted.left > restricted.right) {
	                            swap = restricted.left;

	                            restricted.left = restricted.right;
	                            restricted.right = swap;
	                        }
	                    }
	                }
	                else {
	                    // if not invertible, restrict to minimum of 0x0 rect
	                    restricted.top    = Math.min(current.top, start.bottom);
	                    restricted.bottom = Math.max(current.bottom, start.top);
	                    restricted.left   = Math.min(current.left, start.right);
	                    restricted.right  = Math.max(current.right, start.left);
	                }

	                restricted.width  = restricted.right  - restricted.left;
	                restricted.height = restricted.bottom - restricted.top ;

	                for (var edge in restricted) {
	                    delta[edge] = restricted[edge] - previous[edge];
	                }

	                resizeEvent.edges = this.prepared.edges;
	                resizeEvent.rect = restricted;
	                resizeEvent.deltaRect = delta;
	            }

	            this.target.fire(resizeEvent);

	            return resizeEvent;
	        },

	        gestureStart: function (event) {
	            var gestureEvent = new InteractEvent(this, event, 'gesture', 'start', this.element);

	            gestureEvent.ds = 0;

	            this.gesture.startDistance = this.gesture.prevDistance = gestureEvent.distance;
	            this.gesture.startAngle = this.gesture.prevAngle = gestureEvent.angle;
	            this.gesture.scale = 1;

	            this.gesturing = true;

	            this.target.fire(gestureEvent);

	            return gestureEvent;
	        },

	        gestureMove: function (event) {
	            if (!this.pointerIds.length) {
	                return this.prevEvent;
	            }

	            var gestureEvent;

	            gestureEvent = new InteractEvent(this, event, 'gesture', 'move', this.element);
	            gestureEvent.ds = gestureEvent.scale - this.gesture.scale;

	            this.target.fire(gestureEvent);

	            this.gesture.prevAngle = gestureEvent.angle;
	            this.gesture.prevDistance = gestureEvent.distance;

	            if (gestureEvent.scale !== Infinity &&
	                gestureEvent.scale !== null &&
	                gestureEvent.scale !== undefined  &&
	                !isNaN(gestureEvent.scale)) {

	                this.gesture.scale = gestureEvent.scale;
	            }

	            return gestureEvent;
	        },

	        pointerHold: function (pointer, event, eventTarget) {
	            this.collectEventTargets(pointer, event, eventTarget, 'hold');
	        },

	        pointerUp: function (pointer, event, eventTarget, curEventTarget) {
	            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

	            clearTimeout(this.holdTimers[pointerIndex]);

	            this.collectEventTargets(pointer, event, eventTarget, 'up' );
	            this.collectEventTargets(pointer, event, eventTarget, 'tap');

	            this.pointerEnd(pointer, event, eventTarget, curEventTarget);

	            this.removePointer(pointer);
	        },

	        pointerCancel: function (pointer, event, eventTarget, curEventTarget) {
	            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

	            clearTimeout(this.holdTimers[pointerIndex]);

	            this.collectEventTargets(pointer, event, eventTarget, 'cancel');
	            this.pointerEnd(pointer, event, eventTarget, curEventTarget);

	            this.removePointer(pointer);
	        },

	        // http://www.quirksmode.org/dom/events/click.html
	        // >Events leading to dblclick
	        //
	        // IE8 doesn't fire down event before dblclick.
	        // This workaround tries to fire a tap and doubletap after dblclick
	        ie8Dblclick: function (pointer, event, eventTarget) {
	            if (this.prevTap
	                && event.clientX === this.prevTap.clientX
	                && event.clientY === this.prevTap.clientY
	                && eventTarget   === this.prevTap.target) {

	                this.downTargets[0] = eventTarget;
	                this.downTimes[0] = new Date().getTime();
	                this.collectEventTargets(pointer, event, eventTarget, 'tap');
	            }
	        },

	        // End interact move events and stop auto-scroll unless inertia is enabled
	        pointerEnd: function (pointer, event, eventTarget, curEventTarget) {
	            var endEvent,
	                target = this.target,
	                options = target && target.options,
	                inertiaOptions = options && this.prepared.name && options[this.prepared.name].inertia,
	                inertiaStatus = this.inertiaStatus;

	            if (this.interacting()) {

	                if (inertiaStatus.active && !inertiaStatus.ending) { return; }

	                var pointerSpeed,
	                    now = new Date().getTime(),
	                    inertiaPossible = false,
	                    inertia = false,
	                    smoothEnd = false,
	                    endSnap = checkSnap(target, this.prepared.name) && options[this.prepared.name].snap.endOnly,
	                    endRestrict = checkRestrict(target, this.prepared.name) && options[this.prepared.name].restrict.endOnly,
	                    dx = 0,
	                    dy = 0,
	                    startEvent;

	                if (this.dragging) {
	                    if      (options.drag.axis === 'x' ) { pointerSpeed = Math.abs(this.pointerDelta.client.vx); }
	                    else if (options.drag.axis === 'y' ) { pointerSpeed = Math.abs(this.pointerDelta.client.vy); }
	                    else   /*options.drag.axis === 'xy'*/{ pointerSpeed = this.pointerDelta.client.speed; }
	                }
	                else {
	                    pointerSpeed = this.pointerDelta.client.speed;
	                }

	                // check if inertia should be started
	                inertiaPossible = (inertiaOptions && inertiaOptions.enabled
	                                   && this.prepared.name !== 'gesture'
	                                   && event !== inertiaStatus.startEvent);

	                inertia = (inertiaPossible
	                           && (now - this.curCoords.timeStamp) < 50
	                           && pointerSpeed > inertiaOptions.minSpeed
	                           && pointerSpeed > inertiaOptions.endSpeed);

	                if (inertiaPossible && !inertia && (endSnap || endRestrict)) {

	                    var snapRestrict = {};

	                    snapRestrict.snap = snapRestrict.restrict = snapRestrict;

	                    if (endSnap) {
	                        this.setSnapping(this.curCoords.page, snapRestrict);
	                        if (snapRestrict.locked) {
	                            dx += snapRestrict.dx;
	                            dy += snapRestrict.dy;
	                        }
	                    }

	                    if (endRestrict) {
	                        this.setRestriction(this.curCoords.page, snapRestrict);
	                        if (snapRestrict.restricted) {
	                            dx += snapRestrict.dx;
	                            dy += snapRestrict.dy;
	                        }
	                    }

	                    if (dx || dy) {
	                        smoothEnd = true;
	                    }
	                }

	                if (inertia || smoothEnd) {
	                    copyCoords(inertiaStatus.upCoords, this.curCoords);

	                    this.pointers[0] = inertiaStatus.startEvent = startEvent =
	                        new InteractEvent(this, event, this.prepared.name, 'inertiastart', this.element);

	                    inertiaStatus.t0 = now;

	                    target.fire(inertiaStatus.startEvent);

	                    if (inertia) {
	                        inertiaStatus.vx0 = this.pointerDelta.client.vx;
	                        inertiaStatus.vy0 = this.pointerDelta.client.vy;
	                        inertiaStatus.v0 = pointerSpeed;

	                        this.calcInertia(inertiaStatus);

	                        var page = extend({}, this.curCoords.page),
	                            origin = getOriginXY(target, this.element),
	                            statusObject;

	                        page.x = page.x + inertiaStatus.xe - origin.x;
	                        page.y = page.y + inertiaStatus.ye - origin.y;

	                        statusObject = {
	                            useStatusXY: true,
	                            x: page.x,
	                            y: page.y,
	                            dx: 0,
	                            dy: 0,
	                            snap: null
	                        };

	                        statusObject.snap = statusObject;

	                        dx = dy = 0;

	                        if (endSnap) {
	                            var snap = this.setSnapping(this.curCoords.page, statusObject);

	                            if (snap.locked) {
	                                dx += snap.dx;
	                                dy += snap.dy;
	                            }
	                        }

	                        if (endRestrict) {
	                            var restrict = this.setRestriction(this.curCoords.page, statusObject);

	                            if (restrict.restricted) {
	                                dx += restrict.dx;
	                                dy += restrict.dy;
	                            }
	                        }

	                        inertiaStatus.modifiedXe += dx;
	                        inertiaStatus.modifiedYe += dy;

	                        inertiaStatus.i = reqFrame(this.boundInertiaFrame);
	                    }
	                    else {
	                        inertiaStatus.smoothEnd = true;
	                        inertiaStatus.xe = dx;
	                        inertiaStatus.ye = dy;

	                        inertiaStatus.sx = inertiaStatus.sy = 0;

	                        inertiaStatus.i = reqFrame(this.boundSmoothEndFrame);
	                    }

	                    inertiaStatus.active = true;
	                    return;
	                }

	                if (endSnap || endRestrict) {
	                    // fire a move event at the snapped coordinates
	                    this.pointerMove(pointer, event, eventTarget, curEventTarget, true);
	                }
	            }

	            if (this.dragging) {
	                endEvent = new InteractEvent(this, event, 'drag', 'end', this.element);

	                var draggableElement = this.element,
	                    drop = this.getDrop(endEvent, event, draggableElement);

	                this.dropTarget = drop.dropzone;
	                this.dropElement = drop.element;

	                var dropEvents = this.getDropEvents(event, endEvent);

	                if (dropEvents.leave) { this.prevDropTarget.fire(dropEvents.leave); }
	                if (dropEvents.enter) {     this.dropTarget.fire(dropEvents.enter); }
	                if (dropEvents.drop ) {     this.dropTarget.fire(dropEvents.drop ); }
	                if (dropEvents.deactivate) {
	                    this.fireActiveDrops(dropEvents.deactivate);
	                }

	                target.fire(endEvent);
	            }
	            else if (this.resizing) {
	                endEvent = new InteractEvent(this, event, 'resize', 'end', this.element);
	                target.fire(endEvent);
	            }
	            else if (this.gesturing) {
	                endEvent = new InteractEvent(this, event, 'gesture', 'end', this.element);
	                target.fire(endEvent);
	            }

	            this.stop(event);
	        },

	        collectDrops: function (element) {
	            var drops = [],
	                elements = [],
	                i;

	            element = element || this.element;

	            // collect all dropzones and their elements which qualify for a drop
	            for (i = 0; i < interactables.length; i++) {
	                if (!interactables[i].options.drop.enabled) { continue; }

	                var current = interactables[i],
	                    accept = current.options.drop.accept;

	                // test the draggable element against the dropzone's accept setting
	                if ((isElement(accept) && accept !== element)
	                    || (isString(accept)
	                        && !matchesSelector(element, accept))) {

	                    continue;
	                }

	                // query for new elements if necessary
	                var dropElements = current.selector? current._context.querySelectorAll(current.selector) : [current._element];

	                for (var j = 0, len = dropElements.length; j < len; j++) {
	                    var currentElement = dropElements[j];

	                    if (currentElement === element) {
	                        continue;
	                    }

	                    drops.push(current);
	                    elements.push(currentElement);
	                }
	            }

	            return {
	                dropzones: drops,
	                elements: elements
	            };
	        },

	        fireActiveDrops: function (event) {
	            var i,
	                current,
	                currentElement,
	                prevElement;

	            // loop through all active dropzones and trigger event
	            for (i = 0; i < this.activeDrops.dropzones.length; i++) {
	                current = this.activeDrops.dropzones[i];
	                currentElement = this.activeDrops.elements [i];

	                // prevent trigger of duplicate events on same element
	                if (currentElement !== prevElement) {
	                    // set current element as event target
	                    event.target = currentElement;
	                    current.fire(event);
	                }
	                prevElement = currentElement;
	            }
	        },

	        // Collect a new set of possible drops and save them in activeDrops.
	        // setActiveDrops should always be called when a drag has just started or a
	        // drag event happens while dynamicDrop is true
	        setActiveDrops: function (dragElement) {
	            // get dropzones and their elements that could receive the draggable
	            var possibleDrops = this.collectDrops(dragElement, true);

	            this.activeDrops.dropzones = possibleDrops.dropzones;
	            this.activeDrops.elements  = possibleDrops.elements;
	            this.activeDrops.rects     = [];

	            for (var i = 0; i < this.activeDrops.dropzones.length; i++) {
	                this.activeDrops.rects[i] = this.activeDrops.dropzones[i].getRect(this.activeDrops.elements[i]);
	            }
	        },

	        getDrop: function (dragEvent, event, dragElement) {
	            var validDrops = [];

	            if (dynamicDrop) {
	                this.setActiveDrops(dragElement);
	            }

	            // collect all dropzones and their elements which qualify for a drop
	            for (var j = 0; j < this.activeDrops.dropzones.length; j++) {
	                var current        = this.activeDrops.dropzones[j],
	                    currentElement = this.activeDrops.elements [j],
	                    rect           = this.activeDrops.rects    [j];

	                validDrops.push(current.dropCheck(dragEvent, event, this.target, dragElement, currentElement, rect)
	                                ? currentElement
	                                : null);
	            }

	            // get the most appropriate dropzone based on DOM depth and order
	            var dropIndex = indexOfDeepestElement(validDrops),
	                dropzone  = this.activeDrops.dropzones[dropIndex] || null,
	                element   = this.activeDrops.elements [dropIndex] || null;

	            return {
	                dropzone: dropzone,
	                element: element
	            };
	        },

	        getDropEvents: function (pointerEvent, dragEvent) {
	            var dropEvents = {
	                enter     : null,
	                leave     : null,
	                activate  : null,
	                deactivate: null,
	                move      : null,
	                drop      : null
	            };

	            if (this.dropElement !== this.prevDropElement) {
	                // if there was a prevDropTarget, create a dragleave event
	                if (this.prevDropTarget) {
	                    dropEvents.leave = {
	                        target       : this.prevDropElement,
	                        dropzone     : this.prevDropTarget,
	                        relatedTarget: dragEvent.target,
	                        draggable    : dragEvent.interactable,
	                        dragEvent    : dragEvent,
	                        interaction  : this,
	                        timeStamp    : dragEvent.timeStamp,
	                        type         : 'dragleave'
	                    };

	                    dragEvent.dragLeave = this.prevDropElement;
	                    dragEvent.prevDropzone = this.prevDropTarget;
	                }
	                // if the dropTarget is not null, create a dragenter event
	                if (this.dropTarget) {
	                    dropEvents.enter = {
	                        target       : this.dropElement,
	                        dropzone     : this.dropTarget,
	                        relatedTarget: dragEvent.target,
	                        draggable    : dragEvent.interactable,
	                        dragEvent    : dragEvent,
	                        interaction  : this,
	                        timeStamp    : dragEvent.timeStamp,
	                        type         : 'dragenter'
	                    };

	                    dragEvent.dragEnter = this.dropElement;
	                    dragEvent.dropzone = this.dropTarget;
	                }
	            }

	            if (dragEvent.type === 'dragend' && this.dropTarget) {
	                dropEvents.drop = {
	                    target       : this.dropElement,
	                    dropzone     : this.dropTarget,
	                    relatedTarget: dragEvent.target,
	                    draggable    : dragEvent.interactable,
	                    dragEvent    : dragEvent,
	                    interaction  : this,
	                    timeStamp    : dragEvent.timeStamp,
	                    type         : 'drop'
	                };

	                dragEvent.dropzone = this.dropTarget;
	            }
	            if (dragEvent.type === 'dragstart') {
	                dropEvents.activate = {
	                    target       : null,
	                    dropzone     : null,
	                    relatedTarget: dragEvent.target,
	                    draggable    : dragEvent.interactable,
	                    dragEvent    : dragEvent,
	                    interaction  : this,
	                    timeStamp    : dragEvent.timeStamp,
	                    type         : 'dropactivate'
	                };
	            }
	            if (dragEvent.type === 'dragend') {
	                dropEvents.deactivate = {
	                    target       : null,
	                    dropzone     : null,
	                    relatedTarget: dragEvent.target,
	                    draggable    : dragEvent.interactable,
	                    dragEvent    : dragEvent,
	                    interaction  : this,
	                    timeStamp    : dragEvent.timeStamp,
	                    type         : 'dropdeactivate'
	                };
	            }
	            if (dragEvent.type === 'dragmove' && this.dropTarget) {
	                dropEvents.move = {
	                    target       : this.dropElement,
	                    dropzone     : this.dropTarget,
	                    relatedTarget: dragEvent.target,
	                    draggable    : dragEvent.interactable,
	                    dragEvent    : dragEvent,
	                    interaction  : this,
	                    dragmove     : dragEvent,
	                    timeStamp    : dragEvent.timeStamp,
	                    type         : 'dropmove'
	                };
	                dragEvent.dropzone = this.dropTarget;
	            }

	            return dropEvents;
	        },

	        currentAction: function () {
	            return (this.dragging && 'drag') || (this.resizing && 'resize') || (this.gesturing && 'gesture') || null;
	        },

	        interacting: function () {
	            return this.dragging || this.resizing || this.gesturing;
	        },

	        clearTargets: function () {
	            this.target = this.element = null;

	            this.dropTarget = this.dropElement = this.prevDropTarget = this.prevDropElement = null;
	        },

	        stop: function (event) {
	            if (this.interacting()) {
	                autoScroll.stop();
	                this.matches = [];
	                this.matchElements = [];

	                var target = this.target;

	                if (target.options.styleCursor) {
	                    target._doc.documentElement.style.cursor = '';
	                }

	                // prevent Default only if were previously interacting
	                if (event && isFunction(event.preventDefault)) {
	                    this.checkAndPreventDefault(event, target, this.element);
	                }

	                if (this.dragging) {
	                    this.activeDrops.dropzones = this.activeDrops.elements = this.activeDrops.rects = null;
	                }
	            }

	            this.clearTargets();

	            this.pointerIsDown = this.snapStatus.locked = this.dragging = this.resizing = this.gesturing = false;
	            this.prepared.name = this.prevEvent = null;
	            this.inertiaStatus.resumeDx = this.inertiaStatus.resumeDy = 0;

	            // remove pointers if their ID isn't in this.pointerIds
	            for (var i = 0; i < this.pointers.length; i++) {
	                if (indexOf(this.pointerIds, getPointerId(this.pointers[i])) === -1) {
	                    this.pointers.splice(i, 1);
	                }
	            }
	        },

	        inertiaFrame: function () {
	            var inertiaStatus = this.inertiaStatus,
	                options = this.target.options[this.prepared.name].inertia,
	                lambda = options.resistance,
	                t = new Date().getTime() / 1000 - inertiaStatus.t0;

	            if (t < inertiaStatus.te) {

	                var progress =  1 - (Math.exp(-lambda * t) - inertiaStatus.lambda_v0) / inertiaStatus.one_ve_v0;

	                if (inertiaStatus.modifiedXe === inertiaStatus.xe && inertiaStatus.modifiedYe === inertiaStatus.ye) {
	                    inertiaStatus.sx = inertiaStatus.xe * progress;
	                    inertiaStatus.sy = inertiaStatus.ye * progress;
	                }
	                else {
	                    var quadPoint = getQuadraticCurvePoint(
	                            0, 0,
	                            inertiaStatus.xe, inertiaStatus.ye,
	                            inertiaStatus.modifiedXe, inertiaStatus.modifiedYe,
	                            progress);

	                    inertiaStatus.sx = quadPoint.x;
	                    inertiaStatus.sy = quadPoint.y;
	                }

	                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);

	                inertiaStatus.i = reqFrame(this.boundInertiaFrame);
	            }
	            else {
	                inertiaStatus.ending = true;

	                inertiaStatus.sx = inertiaStatus.modifiedXe;
	                inertiaStatus.sy = inertiaStatus.modifiedYe;

	                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);
	                this.pointerEnd(inertiaStatus.startEvent, inertiaStatus.startEvent);

	                inertiaStatus.active = inertiaStatus.ending = false;
	            }
	        },

	        smoothEndFrame: function () {
	            var inertiaStatus = this.inertiaStatus,
	                t = new Date().getTime() - inertiaStatus.t0,
	                duration = this.target.options[this.prepared.name].inertia.smoothEndDuration;

	            if (t < duration) {
	                inertiaStatus.sx = easeOutQuad(t, 0, inertiaStatus.xe, duration);
	                inertiaStatus.sy = easeOutQuad(t, 0, inertiaStatus.ye, duration);

	                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);

	                inertiaStatus.i = reqFrame(this.boundSmoothEndFrame);
	            }
	            else {
	                inertiaStatus.ending = true;

	                inertiaStatus.sx = inertiaStatus.xe;
	                inertiaStatus.sy = inertiaStatus.ye;

	                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);
	                this.pointerEnd(inertiaStatus.startEvent, inertiaStatus.startEvent);

	                inertiaStatus.smoothEnd =
	                  inertiaStatus.active = inertiaStatus.ending = false;
	            }
	        },

	        addPointer: function (pointer) {
	            var id = getPointerId(pointer),
	                index = this.mouse? 0 : indexOf(this.pointerIds, id);

	            if (index === -1) {
	                index = this.pointerIds.length;
	            }

	            this.pointerIds[index] = id;
	            this.pointers[index] = pointer;

	            return index;
	        },

	        removePointer: function (pointer) {
	            var id = getPointerId(pointer),
	                index = this.mouse? 0 : indexOf(this.pointerIds, id);

	            if (index === -1) { return; }

	            this.pointers   .splice(index, 1);
	            this.pointerIds .splice(index, 1);
	            this.downTargets.splice(index, 1);
	            this.downTimes  .splice(index, 1);
	            this.holdTimers .splice(index, 1);
	        },

	        recordPointer: function (pointer) {
	            var index = this.mouse? 0: indexOf(this.pointerIds, getPointerId(pointer));

	            if (index === -1) { return; }

	            this.pointers[index] = pointer;
	        },

	        collectEventTargets: function (pointer, event, eventTarget, eventType) {
	            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

	            // do not fire a tap event if the pointer was moved before being lifted
	            if (eventType === 'tap' && (this.pointerWasMoved
	                // or if the pointerup target is different to the pointerdown target
	                || !(this.downTargets[pointerIndex] && this.downTargets[pointerIndex] === eventTarget))) {
	                return;
	            }

	            var targets = [],
	                elements = [],
	                element = eventTarget;

	            function collectSelectors (interactable, selector, context) {
	                var els = ie8MatchesSelector
	                        ? context.querySelectorAll(selector)
	                        : undefined;

	                if (interactable._iEvents[eventType]
	                    && isElement(element)
	                    && inContext(interactable, element)
	                    && !testIgnore(interactable, element, eventTarget)
	                    && testAllow(interactable, element, eventTarget)
	                    && matchesSelector(element, selector, els)) {

	                    targets.push(interactable);
	                    elements.push(element);
	                }
	            }

	            while (element) {
	                if (interact.isSet(element) && interact(element)._iEvents[eventType]) {
	                    targets.push(interact(element));
	                    elements.push(element);
	                }

	                interactables.forEachSelector(collectSelectors);

	                element = parentElement(element);
	            }

	            // create the tap event even if there are no listeners so that
	            // doubletap can still be created and fired
	            if (targets.length || eventType === 'tap') {
	                this.firePointers(pointer, event, eventTarget, targets, elements, eventType);
	            }
	        },

	        firePointers: function (pointer, event, eventTarget, targets, elements, eventType) {
	            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer)),
	                pointerEvent = {},
	                i,
	                // for tap events
	                interval, createNewDoubleTap;

	            // if it's a doubletap then the event properties would have been
	            // copied from the tap event and provided as the pointer argument
	            if (eventType === 'doubletap') {
	                pointerEvent = pointer;
	            }
	            else {
	                pointerExtend(pointerEvent, event);
	                if (event !== pointer) {
	                    pointerExtend(pointerEvent, pointer);
	                }

	                pointerEvent.preventDefault           = preventOriginalDefault;
	                pointerEvent.stopPropagation          = InteractEvent.prototype.stopPropagation;
	                pointerEvent.stopImmediatePropagation = InteractEvent.prototype.stopImmediatePropagation;
	                pointerEvent.interaction              = this;

	                pointerEvent.timeStamp       = new Date().getTime();
	                pointerEvent.originalEvent   = event;
	                pointerEvent.originalPointer = pointer;
	                pointerEvent.type            = eventType;
	                pointerEvent.pointerId       = getPointerId(pointer);
	                pointerEvent.pointerType     = this.mouse? 'mouse' : !supportsPointerEvent? 'touch'
	                                                    : isString(pointer.pointerType)
	                                                        ? pointer.pointerType
	                                                        : [,,'touch', 'pen', 'mouse'][pointer.pointerType];
	            }

	            if (eventType === 'tap') {
	                pointerEvent.dt = pointerEvent.timeStamp - this.downTimes[pointerIndex];

	                interval = pointerEvent.timeStamp - this.tapTime;
	                createNewDoubleTap = !!(this.prevTap && this.prevTap.type !== 'doubletap'
	                       && this.prevTap.target === pointerEvent.target
	                       && interval < 500);

	                pointerEvent.double = createNewDoubleTap;

	                this.tapTime = pointerEvent.timeStamp;
	            }

	            for (i = 0; i < targets.length; i++) {
	                pointerEvent.currentTarget = elements[i];
	                pointerEvent.interactable = targets[i];
	                targets[i].fire(pointerEvent);

	                if (pointerEvent.immediatePropagationStopped
	                    ||(pointerEvent.propagationStopped && elements[i + 1] !== pointerEvent.currentTarget)) {
	                    break;
	                }
	            }

	            if (createNewDoubleTap) {
	                var doubleTap = {};

	                extend(doubleTap, pointerEvent);

	                doubleTap.dt   = interval;
	                doubleTap.type = 'doubletap';

	                this.collectEventTargets(doubleTap, event, eventTarget, 'doubletap');

	                this.prevTap = doubleTap;
	            }
	            else if (eventType === 'tap') {
	                this.prevTap = pointerEvent;
	            }
	        },

	        validateSelector: function (pointer, event, matches, matchElements) {
	            for (var i = 0, len = matches.length; i < len; i++) {
	                var match = matches[i],
	                    matchElement = matchElements[i],
	                    action = validateAction(match.getAction(pointer, event, this, matchElement), match);

	                if (action && withinInteractionLimit(match, matchElement, action)) {
	                    this.target = match;
	                    this.element = matchElement;

	                    return action;
	                }
	            }
	        },

	        setSnapping: function (pageCoords, status) {
	            var snap = this.target.options[this.prepared.name].snap,
	                targets = [],
	                target,
	                page,
	                i;

	            status = status || this.snapStatus;

	            if (status.useStatusXY) {
	                page = { x: status.x, y: status.y };
	            }
	            else {
	                var origin = getOriginXY(this.target, this.element);

	                page = extend({}, pageCoords);

	                page.x -= origin.x;
	                page.y -= origin.y;
	            }

	            status.realX = page.x;
	            status.realY = page.y;

	            page.x = page.x - this.inertiaStatus.resumeDx;
	            page.y = page.y - this.inertiaStatus.resumeDy;

	            var len = snap.targets? snap.targets.length : 0;

	            for (var relIndex = 0; relIndex < this.snapOffsets.length; relIndex++) {
	                var relative = {
	                    x: page.x - this.snapOffsets[relIndex].x,
	                    y: page.y - this.snapOffsets[relIndex].y
	                };

	                for (i = 0; i < len; i++) {
	                    if (isFunction(snap.targets[i])) {
	                        target = snap.targets[i](relative.x, relative.y, this);
	                    }
	                    else {
	                        target = snap.targets[i];
	                    }

	                    if (!target) { continue; }

	                    targets.push({
	                        x: isNumber(target.x) ? (target.x + this.snapOffsets[relIndex].x) : relative.x,
	                        y: isNumber(target.y) ? (target.y + this.snapOffsets[relIndex].y) : relative.y,

	                        range: isNumber(target.range)? target.range: snap.range
	                    });
	                }
	            }

	            var closest = {
	                    target: null,
	                    inRange: false,
	                    distance: 0,
	                    range: 0,
	                    dx: 0,
	                    dy: 0
	                };

	            for (i = 0, len = targets.length; i < len; i++) {
	                target = targets[i];

	                var range = target.range,
	                    dx = target.x - page.x,
	                    dy = target.y - page.y,
	                    distance = hypot(dx, dy),
	                    inRange = distance <= range;

	                // Infinite targets count as being out of range
	                // compared to non infinite ones that are in range
	                if (range === Infinity && closest.inRange && closest.range !== Infinity) {
	                    inRange = false;
	                }

	                if (!closest.target || (inRange
	                    // is the closest target in range?
	                    ? (closest.inRange && range !== Infinity
	                        // the pointer is relatively deeper in this target
	                        ? distance / range < closest.distance / closest.range
	                        // this target has Infinite range and the closest doesn't
	                        : (range === Infinity && closest.range !== Infinity)
	                            // OR this target is closer that the previous closest
	                            || distance < closest.distance)
	                    // The other is not in range and the pointer is closer to this target
	                    : (!closest.inRange && distance < closest.distance))) {

	                    if (range === Infinity) {
	                        inRange = true;
	                    }

	                    closest.target = target;
	                    closest.distance = distance;
	                    closest.range = range;
	                    closest.inRange = inRange;
	                    closest.dx = dx;
	                    closest.dy = dy;

	                    status.range = range;
	                }
	            }

	            var snapChanged;

	            if (closest.target) {
	                snapChanged = (status.snappedX !== closest.target.x || status.snappedY !== closest.target.y);

	                status.snappedX = closest.target.x;
	                status.snappedY = closest.target.y;
	            }
	            else {
	                snapChanged = true;

	                status.snappedX = NaN;
	                status.snappedY = NaN;
	            }

	            status.dx = closest.dx;
	            status.dy = closest.dy;

	            status.changed = (snapChanged || (closest.inRange && !status.locked));
	            status.locked = closest.inRange;

	            return status;
	        },

	        setRestriction: function (pageCoords, status) {
	            var target = this.target,
	                restrict = target && target.options[this.prepared.name].restrict,
	                restriction = restrict && restrict.restriction,
	                page;

	            if (!restriction) {
	                return status;
	            }

	            status = status || this.restrictStatus;

	            page = status.useStatusXY
	                    ? page = { x: status.x, y: status.y }
	                    : page = extend({}, pageCoords);

	            if (status.snap && status.snap.locked) {
	                page.x += status.snap.dx || 0;
	                page.y += status.snap.dy || 0;
	            }

	            page.x -= this.inertiaStatus.resumeDx;
	            page.y -= this.inertiaStatus.resumeDy;

	            status.dx = 0;
	            status.dy = 0;
	            status.restricted = false;

	            var rect, restrictedX, restrictedY;

	            if (isString(restriction)) {
	                if (restriction === 'parent') {
	                    restriction = parentElement(this.element);
	                }
	                else if (restriction === 'self') {
	                    restriction = target.getRect(this.element);
	                }
	                else {
	                    restriction = closest(this.element, restriction);
	                }

	                if (!restriction) { return status; }
	            }

	            if (isFunction(restriction)) {
	                restriction = restriction(page.x, page.y, this.element);
	            }

	            if (isElement(restriction)) {
	                restriction = getElementRect(restriction);
	            }

	            rect = restriction;

	            if (!restriction) {
	                restrictedX = page.x;
	                restrictedY = page.y;
	            }
	            // object is assumed to have
	            // x, y, width, height or
	            // left, top, right, bottom
	            else if ('x' in restriction && 'y' in restriction) {
	                restrictedX = Math.max(Math.min(rect.x + rect.width  - this.restrictOffset.right , page.x), rect.x + this.restrictOffset.left);
	                restrictedY = Math.max(Math.min(rect.y + rect.height - this.restrictOffset.bottom, page.y), rect.y + this.restrictOffset.top );
	            }
	            else {
	                restrictedX = Math.max(Math.min(rect.right  - this.restrictOffset.right , page.x), rect.left + this.restrictOffset.left);
	                restrictedY = Math.max(Math.min(rect.bottom - this.restrictOffset.bottom, page.y), rect.top  + this.restrictOffset.top );
	            }

	            status.dx = restrictedX - page.x;
	            status.dy = restrictedY - page.y;

	            status.changed = status.restrictedX !== restrictedX || status.restrictedY !== restrictedY;
	            status.restricted = !!(status.dx || status.dy);

	            status.restrictedX = restrictedX;
	            status.restrictedY = restrictedY;

	            return status;
	        },

	        checkAndPreventDefault: function (event, interactable, element) {
	            if (!(interactable = interactable || this.target)) { return; }

	            var options = interactable.options,
	                prevent = options.preventDefault;

	            if (prevent === 'auto' && element && !/^(input|select|textarea)$/i.test(event.target.nodeName)) {
	                // do not preventDefault on pointerdown if the prepared action is a drag
	                // and dragging can only start from a certain direction - this allows
	                // a touch to pan the viewport if a drag isn't in the right direction
	                if (/down|start/i.test(event.type)
	                    && this.prepared.name === 'drag' && options.drag.axis !== 'xy') {

	                    return;
	                }

	                // with manualStart, only preventDefault while interacting
	                if (options[this.prepared.name] && options[this.prepared.name].manualStart
	                    && !this.interacting()) {
	                    return;
	                }

	                event.preventDefault();
	                return;
	            }

	            if (prevent === 'always') {
	                event.preventDefault();
	                return;
	            }
	        },

	        calcInertia: function (status) {
	            var inertiaOptions = this.target.options[this.prepared.name].inertia,
	                lambda = inertiaOptions.resistance,
	                inertiaDur = -Math.log(inertiaOptions.endSpeed / status.v0) / lambda;

	            status.x0 = this.prevEvent.pageX;
	            status.y0 = this.prevEvent.pageY;
	            status.t0 = status.startEvent.timeStamp / 1000;
	            status.sx = status.sy = 0;

	            status.modifiedXe = status.xe = (status.vx0 - inertiaDur) / lambda;
	            status.modifiedYe = status.ye = (status.vy0 - inertiaDur) / lambda;
	            status.te = inertiaDur;

	            status.lambda_v0 = lambda / status.v0;
	            status.one_ve_v0 = 1 - inertiaOptions.endSpeed / status.v0;
	        },

	        autoScrollMove: function (pointer) {
	            if (!(this.interacting()
	                && checkAutoScroll(this.target, this.prepared.name))) {
	                return;
	            }

	            if (this.inertiaStatus.active) {
	                autoScroll.x = autoScroll.y = 0;
	                return;
	            }

	            var top,
	                right,
	                bottom,
	                left,
	                options = this.target.options[this.prepared.name].autoScroll,
	                container = options.container || getWindow(this.element);

	            if (isWindow(container)) {
	                left   = pointer.clientX < autoScroll.margin;
	                top    = pointer.clientY < autoScroll.margin;
	                right  = pointer.clientX > container.innerWidth  - autoScroll.margin;
	                bottom = pointer.clientY > container.innerHeight - autoScroll.margin;
	            }
	            else {
	                var rect = getElementClientRect(container);

	                left   = pointer.clientX < rect.left   + autoScroll.margin;
	                top    = pointer.clientY < rect.top    + autoScroll.margin;
	                right  = pointer.clientX > rect.right  - autoScroll.margin;
	                bottom = pointer.clientY > rect.bottom - autoScroll.margin;
	            }

	            autoScroll.x = (right ? 1: left? -1: 0);
	            autoScroll.y = (bottom? 1:  top? -1: 0);

	            if (!autoScroll.isScrolling) {
	                // set the autoScroll properties to those of the target
	                autoScroll.margin = options.margin;
	                autoScroll.speed  = options.speed;

	                autoScroll.start(this);
	            }
	        },

	        _updateEventTargets: function (target, currentTarget) {
	            this._eventTarget    = target;
	            this._curEventTarget = currentTarget;
	        }

	    };

	    function getInteractionFromPointer (pointer, eventType, eventTarget) {
	        var i = 0, len = interactions.length,
	            mouseEvent = (/mouse/i.test(pointer.pointerType || eventType)
	                          // MSPointerEvent.MSPOINTER_TYPE_MOUSE
	                          || pointer.pointerType === 4),
	            interaction;

	        var id = getPointerId(pointer);

	        // try to resume inertia with a new pointer
	        if (/down|start/i.test(eventType)) {
	            for (i = 0; i < len; i++) {
	                interaction = interactions[i];

	                var element = eventTarget;

	                if (interaction.inertiaStatus.active && interaction.target.options[interaction.prepared.name].inertia.allowResume
	                    && (interaction.mouse === mouseEvent)) {
	                    while (element) {
	                        // if the element is the interaction element
	                        if (element === interaction.element) {
	                            return interaction;
	                        }
	                        element = parentElement(element);
	                    }
	                }
	            }
	        }

	        // if it's a mouse interaction
	        if (mouseEvent || !(supportsTouch || supportsPointerEvent)) {

	            // find a mouse interaction that's not in inertia phase
	            for (i = 0; i < len; i++) {
	                if (interactions[i].mouse && !interactions[i].inertiaStatus.active) {
	                    return interactions[i];
	                }
	            }

	            // find any interaction specifically for mouse.
	            // if the eventType is a mousedown, and inertia is active
	            // ignore the interaction
	            for (i = 0; i < len; i++) {
	                if (interactions[i].mouse && !(/down/.test(eventType) && interactions[i].inertiaStatus.active)) {
	                    return interaction;
	                }
	            }

	            // create a new interaction for mouse
	            interaction = new Interaction();
	            interaction.mouse = true;

	            return interaction;
	        }

	        // get interaction that has this pointer
	        for (i = 0; i < len; i++) {
	            if (contains(interactions[i].pointerIds, id)) {
	                return interactions[i];
	            }
	        }

	        // at this stage, a pointerUp should not return an interaction
	        if (/up|end|out/i.test(eventType)) {
	            return null;
	        }

	        // get first idle interaction
	        for (i = 0; i < len; i++) {
	            interaction = interactions[i];

	            if ((!interaction.prepared.name || (interaction.target.options.gesture.enabled))
	                && !interaction.interacting()
	                && !(!mouseEvent && interaction.mouse)) {

	                return interaction;
	            }
	        }

	        return new Interaction();
	    }

	    function doOnInteractions (method) {
	        return (function (event) {
	            var interaction,
	                eventTarget = getActualElement(event.path
	                                               ? event.path[0]
	                                               : event.target),
	                curEventTarget = getActualElement(event.currentTarget),
	                i;

	            if (supportsTouch && /touch/.test(event.type)) {
	                prevTouchTime = new Date().getTime();

	                for (i = 0; i < event.changedTouches.length; i++) {
	                    var pointer = event.changedTouches[i];

	                    interaction = getInteractionFromPointer(pointer, event.type, eventTarget);

	                    if (!interaction) { continue; }

	                    interaction._updateEventTargets(eventTarget, curEventTarget);

	                    interaction[method](pointer, event, eventTarget, curEventTarget);
	                }
	            }
	            else {
	                if (!supportsPointerEvent && /mouse/.test(event.type)) {
	                    // ignore mouse events while touch interactions are active
	                    for (i = 0; i < interactions.length; i++) {
	                        if (!interactions[i].mouse && interactions[i].pointerIsDown) {
	                            return;
	                        }
	                    }

	                    // try to ignore mouse events that are simulated by the browser
	                    // after a touch event
	                    if (new Date().getTime() - prevTouchTime < 500) {
	                        return;
	                    }
	                }

	                interaction = getInteractionFromPointer(event, event.type, eventTarget);

	                if (!interaction) { return; }

	                interaction._updateEventTargets(eventTarget, curEventTarget);

	                interaction[method](event, event, eventTarget, curEventTarget);
	            }
	        });
	    }

	    function InteractEvent (interaction, event, action, phase, element, related) {
	        var client,
	            page,
	            target      = interaction.target,
	            snapStatus  = interaction.snapStatus,
	            restrictStatus  = interaction.restrictStatus,
	            pointers    = interaction.pointers,
	            deltaSource = (target && target.options || defaultOptions).deltaSource,
	            sourceX     = deltaSource + 'X',
	            sourceY     = deltaSource + 'Y',
	            options     = target? target.options: defaultOptions,
	            origin      = getOriginXY(target, element),
	            starting    = phase === 'start',
	            ending      = phase === 'end',
	            coords      = starting? interaction.startCoords : interaction.curCoords;

	        element = element || interaction.element;

	        page   = extend({}, coords.page);
	        client = extend({}, coords.client);

	        page.x -= origin.x;
	        page.y -= origin.y;

	        client.x -= origin.x;
	        client.y -= origin.y;

	        var relativePoints = options[action].snap && options[action].snap.relativePoints ;

	        if (checkSnap(target, action) && !(starting && relativePoints && relativePoints.length)) {
	            this.snap = {
	                range  : snapStatus.range,
	                locked : snapStatus.locked,
	                x      : snapStatus.snappedX,
	                y      : snapStatus.snappedY,
	                realX  : snapStatus.realX,
	                realY  : snapStatus.realY,
	                dx     : snapStatus.dx,
	                dy     : snapStatus.dy
	            };

	            if (snapStatus.locked) {
	                page.x += snapStatus.dx;
	                page.y += snapStatus.dy;
	                client.x += snapStatus.dx;
	                client.y += snapStatus.dy;
	            }
	        }

	        if (checkRestrict(target, action) && !(starting && options[action].restrict.elementRect) && restrictStatus.restricted) {
	            page.x += restrictStatus.dx;
	            page.y += restrictStatus.dy;
	            client.x += restrictStatus.dx;
	            client.y += restrictStatus.dy;

	            this.restrict = {
	                dx: restrictStatus.dx,
	                dy: restrictStatus.dy
	            };
	        }

	        this.pageX     = page.x;
	        this.pageY     = page.y;
	        this.clientX   = client.x;
	        this.clientY   = client.y;

	        this.x0        = interaction.startCoords.page.x - origin.x;
	        this.y0        = interaction.startCoords.page.y - origin.y;
	        this.clientX0  = interaction.startCoords.client.x - origin.x;
	        this.clientY0  = interaction.startCoords.client.y - origin.y;
	        this.ctrlKey   = event.ctrlKey;
	        this.altKey    = event.altKey;
	        this.shiftKey  = event.shiftKey;
	        this.metaKey   = event.metaKey;
	        this.button    = event.button;
	        this.buttons   = event.buttons;
	        this.target    = element;
	        this.t0        = interaction.downTimes[0];
	        this.type      = action + (phase || '');

	        this.interaction = interaction;
	        this.interactable = target;

	        var inertiaStatus = interaction.inertiaStatus;

	        if (inertiaStatus.active) {
	            this.detail = 'inertia';
	        }

	        if (related) {
	            this.relatedTarget = related;
	        }

	        // end event dx, dy is difference between start and end points
	        if (ending) {
	            if (deltaSource === 'client') {
	                this.dx = client.x - interaction.startCoords.client.x;
	                this.dy = client.y - interaction.startCoords.client.y;
	            }
	            else {
	                this.dx = page.x - interaction.startCoords.page.x;
	                this.dy = page.y - interaction.startCoords.page.y;
	            }
	        }
	        else if (starting) {
	            this.dx = 0;
	            this.dy = 0;
	        }
	        // copy properties from previousmove if starting inertia
	        else if (phase === 'inertiastart') {
	            this.dx = interaction.prevEvent.dx;
	            this.dy = interaction.prevEvent.dy;
	        }
	        else {
	            if (deltaSource === 'client') {
	                this.dx = client.x - interaction.prevEvent.clientX;
	                this.dy = client.y - interaction.prevEvent.clientY;
	            }
	            else {
	                this.dx = page.x - interaction.prevEvent.pageX;
	                this.dy = page.y - interaction.prevEvent.pageY;
	            }
	        }
	        if (interaction.prevEvent && interaction.prevEvent.detail === 'inertia'
	            && !inertiaStatus.active
	            && options[action].inertia && options[action].inertia.zeroResumeDelta) {

	            inertiaStatus.resumeDx += this.dx;
	            inertiaStatus.resumeDy += this.dy;

	            this.dx = this.dy = 0;
	        }

	        if (action === 'resize' && interaction.resizeAxes) {
	            if (options.resize.square) {
	                if (interaction.resizeAxes === 'y') {
	                    this.dx = this.dy;
	                }
	                else {
	                    this.dy = this.dx;
	                }
	                this.axes = 'xy';
	            }
	            else {
	                this.axes = interaction.resizeAxes;

	                if (interaction.resizeAxes === 'x') {
	                    this.dy = 0;
	                }
	                else if (interaction.resizeAxes === 'y') {
	                    this.dx = 0;
	                }
	            }
	        }
	        else if (action === 'gesture') {
	            this.touches = [pointers[0], pointers[1]];

	            if (starting) {
	                this.distance = touchDistance(pointers, deltaSource);
	                this.box      = touchBBox(pointers);
	                this.scale    = 1;
	                this.ds       = 0;
	                this.angle    = touchAngle(pointers, undefined, deltaSource);
	                this.da       = 0;
	            }
	            else if (ending || event instanceof InteractEvent) {
	                this.distance = interaction.prevEvent.distance;
	                this.box      = interaction.prevEvent.box;
	                this.scale    = interaction.prevEvent.scale;
	                this.ds       = this.scale - 1;
	                this.angle    = interaction.prevEvent.angle;
	                this.da       = this.angle - interaction.gesture.startAngle;
	            }
	            else {
	                this.distance = touchDistance(pointers, deltaSource);
	                this.box      = touchBBox(pointers);
	                this.scale    = this.distance / interaction.gesture.startDistance;
	                this.angle    = touchAngle(pointers, interaction.gesture.prevAngle, deltaSource);

	                this.ds = this.scale - interaction.gesture.prevScale;
	                this.da = this.angle - interaction.gesture.prevAngle;
	            }
	        }

	        if (starting) {
	            this.timeStamp = interaction.downTimes[0];
	            this.dt        = 0;
	            this.duration  = 0;
	            this.speed     = 0;
	            this.velocityX = 0;
	            this.velocityY = 0;
	        }
	        else if (phase === 'inertiastart') {
	            this.timeStamp = interaction.prevEvent.timeStamp;
	            this.dt        = interaction.prevEvent.dt;
	            this.duration  = interaction.prevEvent.duration;
	            this.speed     = interaction.prevEvent.speed;
	            this.velocityX = interaction.prevEvent.velocityX;
	            this.velocityY = interaction.prevEvent.velocityY;
	        }
	        else {
	            this.timeStamp = new Date().getTime();
	            this.dt        = this.timeStamp - interaction.prevEvent.timeStamp;
	            this.duration  = this.timeStamp - interaction.downTimes[0];

	            if (event instanceof InteractEvent) {
	                var dx = this[sourceX] - interaction.prevEvent[sourceX],
	                    dy = this[sourceY] - interaction.prevEvent[sourceY],
	                    dt = this.dt / 1000;

	                this.speed = hypot(dx, dy) / dt;
	                this.velocityX = dx / dt;
	                this.velocityY = dy / dt;
	            }
	            // if normal move or end event, use previous user event coords
	            else {
	                // speed and velocity in pixels per second
	                this.speed = interaction.pointerDelta[deltaSource].speed;
	                this.velocityX = interaction.pointerDelta[deltaSource].vx;
	                this.velocityY = interaction.pointerDelta[deltaSource].vy;
	            }
	        }

	        if ((ending || phase === 'inertiastart')
	            && interaction.prevEvent.speed > 600 && this.timeStamp - interaction.prevEvent.timeStamp < 150) {

	            var angle = 180 * Math.atan2(interaction.prevEvent.velocityY, interaction.prevEvent.velocityX) / Math.PI,
	                overlap = 22.5;

	            if (angle < 0) {
	                angle += 360;
	            }

	            var left = 135 - overlap <= angle && angle < 225 + overlap,
	                up   = 225 - overlap <= angle && angle < 315 + overlap,

	                right = !left && (315 - overlap <= angle || angle <  45 + overlap),
	                down  = !up   &&   45 - overlap <= angle && angle < 135 + overlap;

	            this.swipe = {
	                up   : up,
	                down : down,
	                left : left,
	                right: right,
	                angle: angle,
	                speed: interaction.prevEvent.speed,
	                velocity: {
	                    x: interaction.prevEvent.velocityX,
	                    y: interaction.prevEvent.velocityY
	                }
	            };
	        }
	    }

	    InteractEvent.prototype = {
	        preventDefault: blank,
	        stopImmediatePropagation: function () {
	            this.immediatePropagationStopped = this.propagationStopped = true;
	        },
	        stopPropagation: function () {
	            this.propagationStopped = true;
	        }
	    };

	    function preventOriginalDefault () {
	        this.originalEvent.preventDefault();
	    }

	    function getActionCursor (action) {
	        var cursor = '';

	        if (action.name === 'drag') {
	            cursor =  actionCursors.drag;
	        }
	        if (action.name === 'resize') {
	            if (action.axis) {
	                cursor =  actionCursors[action.name + action.axis];
	            }
	            else if (action.edges) {
	                var cursorKey = 'resize',
	                    edgeNames = ['top', 'bottom', 'left', 'right'];

	                for (var i = 0; i < 4; i++) {
	                    if (action.edges[edgeNames[i]]) {
	                        cursorKey += edgeNames[i];
	                    }
	                }

	                cursor = actionCursors[cursorKey];
	            }
	        }

	        return cursor;
	    }

	    function checkResizeEdge (name, value, page, element, interactableElement, rect, margin) {
	        // false, '', undefined, null
	        if (!value) { return false; }

	        // true value, use pointer coords and element rect
	        if (value === true) {
	            // if dimensions are negative, "switch" edges
	            var width = isNumber(rect.width)? rect.width : rect.right - rect.left,
	                height = isNumber(rect.height)? rect.height : rect.bottom - rect.top;

	            if (width < 0) {
	                if      (name === 'left' ) { name = 'right'; }
	                else if (name === 'right') { name = 'left' ; }
	            }
	            if (height < 0) {
	                if      (name === 'top'   ) { name = 'bottom'; }
	                else if (name === 'bottom') { name = 'top'   ; }
	            }

	            if (name === 'left'  ) { return page.x < ((width  >= 0? rect.left: rect.right ) + margin); }
	            if (name === 'top'   ) { return page.y < ((height >= 0? rect.top : rect.bottom) + margin); }

	            if (name === 'right' ) { return page.x > ((width  >= 0? rect.right : rect.left) - margin); }
	            if (name === 'bottom') { return page.y > ((height >= 0? rect.bottom: rect.top ) - margin); }
	        }

	        // the remaining checks require an element
	        if (!isElement(element)) { return false; }

	        return isElement(value)
	                    // the value is an element to use as a resize handle
	                    ? value === element
	                    // otherwise check if element matches value as selector
	                    : matchesUpTo(element, value, interactableElement);
	    }

	    function defaultActionChecker (pointer, interaction, element) {
	        var rect = this.getRect(element),
	            shouldResize = false,
	            action = null,
	            resizeAxes = null,
	            resizeEdges,
	            page = extend({}, interaction.curCoords.page),
	            options = this.options;

	        if (!rect) { return null; }

	        if (actionIsEnabled.resize && options.resize.enabled) {
	            var resizeOptions = options.resize;

	            resizeEdges = {
	                left: false, right: false, top: false, bottom: false
	            };

	            // if using resize.edges
	            if (isObject(resizeOptions.edges)) {
	                for (var edge in resizeEdges) {
	                    resizeEdges[edge] = checkResizeEdge(edge,
	                                                        resizeOptions.edges[edge],
	                                                        page,
	                                                        interaction._eventTarget,
	                                                        element,
	                                                        rect,
	                                                        resizeOptions.margin || margin);
	                }

	                resizeEdges.left = resizeEdges.left && !resizeEdges.right;
	                resizeEdges.top  = resizeEdges.top  && !resizeEdges.bottom;

	                shouldResize = resizeEdges.left || resizeEdges.right || resizeEdges.top || resizeEdges.bottom;
	            }
	            else {
	                var right  = options.resize.axis !== 'y' && page.x > (rect.right  - margin),
	                    bottom = options.resize.axis !== 'x' && page.y > (rect.bottom - margin);

	                shouldResize = right || bottom;
	                resizeAxes = (right? 'x' : '') + (bottom? 'y' : '');
	            }
	        }

	        action = shouldResize
	            ? 'resize'
	            : actionIsEnabled.drag && options.drag.enabled
	                ? 'drag'
	                : null;

	        if (actionIsEnabled.gesture
	            && interaction.pointerIds.length >=2
	            && !(interaction.dragging || interaction.resizing)) {
	            action = 'gesture';
	        }

	        if (action) {
	            return {
	                name: action,
	                axis: resizeAxes,
	                edges: resizeEdges
	            };
	        }

	        return null;
	    }

	    // Check if action is enabled globally and the current target supports it
	    // If so, return the validated action. Otherwise, return null
	    function validateAction (action, interactable) {
	        if (!isObject(action)) { return null; }

	        var actionName = action.name,
	            options = interactable.options;

	        if ((  (actionName  === 'resize'   && options.resize.enabled )
	            || (actionName      === 'drag'     && options.drag.enabled  )
	            || (actionName      === 'gesture'  && options.gesture.enabled))
	            && actionIsEnabled[actionName]) {

	            if (actionName === 'resize' || actionName === 'resizeyx') {
	                actionName = 'resizexy';
	            }

	            return action;
	        }
	        return null;
	    }

	    var listeners = {},
	        interactionListeners = [
	            'dragStart', 'dragMove', 'resizeStart', 'resizeMove', 'gestureStart', 'gestureMove',
	            'pointerOver', 'pointerOut', 'pointerHover', 'selectorDown',
	            'pointerDown', 'pointerMove', 'pointerUp', 'pointerCancel', 'pointerEnd',
	            'addPointer', 'removePointer', 'recordPointer', 'autoScrollMove'
	        ];

	    for (var i = 0, len = interactionListeners.length; i < len; i++) {
	        var name = interactionListeners[i];

	        listeners[name] = doOnInteractions(name);
	    }

	    // bound to the interactable context when a DOM event
	    // listener is added to a selector interactable
	    function delegateListener (event, useCapture) {
	        var fakeEvent = {},
	            delegated = delegatedEvents[event.type],
	            eventTarget = getActualElement(event.path
	                                           ? event.path[0]
	                                           : event.target),
	            element = eventTarget;

	        useCapture = useCapture? true: false;

	        // duplicate the event so that currentTarget can be changed
	        for (var prop in event) {
	            fakeEvent[prop] = event[prop];
	        }

	        fakeEvent.originalEvent = event;
	        fakeEvent.preventDefault = preventOriginalDefault;

	        // climb up document tree looking for selector matches
	        while (isElement(element)) {
	            for (var i = 0; i < delegated.selectors.length; i++) {
	                var selector = delegated.selectors[i],
	                    context = delegated.contexts[i];

	                if (matchesSelector(element, selector)
	                    && nodeContains(context, eventTarget)
	                    && nodeContains(context, element)) {

	                    var listeners = delegated.listeners[i];

	                    fakeEvent.currentTarget = element;

	                    for (var j = 0; j < listeners.length; j++) {
	                        if (listeners[j][1] === useCapture) {
	                            listeners[j][0](fakeEvent);
	                        }
	                    }
	                }
	            }

	            element = parentElement(element);
	        }
	    }

	    function delegateUseCapture (event) {
	        return delegateListener.call(this, event, true);
	    }

	    interactables.indexOfElement = function indexOfElement (element, context) {
	        context = context || document;

	        for (var i = 0; i < this.length; i++) {
	            var interactable = this[i];

	            if ((interactable.selector === element
	                && (interactable._context === context))
	                || (!interactable.selector && interactable._element === element)) {

	                return i;
	            }
	        }
	        return -1;
	    };

	    interactables.get = function interactableGet (element, options) {
	        return this[this.indexOfElement(element, options && options.context)];
	    };

	    interactables.forEachSelector = function (callback) {
	        for (var i = 0; i < this.length; i++) {
	            var interactable = this[i];

	            if (!interactable.selector) {
	                continue;
	            }

	            var ret = callback(interactable, interactable.selector, interactable._context, i, this);

	            if (ret !== undefined) {
	                return ret;
	            }
	        }
	    };

	    /*\
	     * interact
	     [ method ]
	     *
	     * The methods of this variable can be used to set elements as
	     * interactables and also to change various default settings.
	     *
	     * Calling it as a function and passing an element or a valid CSS selector
	     * string returns an Interactable object which has various methods to
	     * configure it.
	     *
	     - element (Element | string) The HTML or SVG Element to interact with or CSS selector
	     = (object) An @Interactable
	     *
	     > Usage
	     | interact(document.getElementById('draggable')).draggable(true);
	     |
	     | var rectables = interact('rect');
	     | rectables
	     |     .gesturable(true)
	     |     .on('gesturemove', function (event) {
	     |         // something cool...
	     |     })
	     |     .autoScroll(true);
	    \*/
	    function interact (element, options) {
	        return interactables.get(element, options) || new Interactable(element, options);
	    }

	    /*\
	     * Interactable
	     [ property ]
	     **
	     * Object type returned by @interact
	    \*/
	    function Interactable (element, options) {
	        this._element = element;
	        this._iEvents = this._iEvents || {};

	        var _window;

	        if (trySelector(element)) {
	            this.selector = element;

	            var context = options && options.context;

	            _window = context? getWindow(context) : window;

	            if (context && (_window.Node
	                    ? context instanceof _window.Node
	                    : (isElement(context) || context === _window.document))) {

	                this._context = context;
	            }
	        }
	        else {
	            _window = getWindow(element);

	            if (isElement(element, _window)) {

	                if (PointerEvent) {
	                    events.add(this._element, pEventTypes.down, listeners.pointerDown );
	                    events.add(this._element, pEventTypes.move, listeners.pointerHover);
	                }
	                else {
	                    events.add(this._element, 'mousedown' , listeners.pointerDown );
	                    events.add(this._element, 'mousemove' , listeners.pointerHover);
	                    events.add(this._element, 'touchstart', listeners.pointerDown );
	                    events.add(this._element, 'touchmove' , listeners.pointerHover);
	                }
	            }
	        }

	        this._doc = _window.document;

	        if (!contains(documents, this._doc)) {
	            listenToDocument(this._doc);
	        }

	        interactables.push(this);

	        this.set(options);
	    }

	    Interactable.prototype = {
	        setOnEvents: function (action, phases) {
	            if (action === 'drop') {
	                if (isFunction(phases.ondrop)          ) { this.ondrop           = phases.ondrop          ; }
	                if (isFunction(phases.ondropactivate)  ) { this.ondropactivate   = phases.ondropactivate  ; }
	                if (isFunction(phases.ondropdeactivate)) { this.ondropdeactivate = phases.ondropdeactivate; }
	                if (isFunction(phases.ondragenter)     ) { this.ondragenter      = phases.ondragenter     ; }
	                if (isFunction(phases.ondragleave)     ) { this.ondragleave      = phases.ondragleave     ; }
	                if (isFunction(phases.ondropmove)      ) { this.ondropmove       = phases.ondropmove      ; }
	            }
	            else {
	                action = 'on' + action;

	                if (isFunction(phases.onstart)       ) { this[action + 'start'         ] = phases.onstart         ; }
	                if (isFunction(phases.onmove)        ) { this[action + 'move'          ] = phases.onmove          ; }
	                if (isFunction(phases.onend)         ) { this[action + 'end'           ] = phases.onend           ; }
	                if (isFunction(phases.oninertiastart)) { this[action + 'inertiastart'  ] = phases.oninertiastart  ; }
	            }

	            return this;
	        },

	        /*\
	         * Interactable.draggable
	         [ method ]
	         *
	         * Gets or sets whether drag actions can be performed on the
	         * Interactable
	         *
	         = (boolean) Indicates if this can be the target of drag events
	         | var isDraggable = interact('ul li').draggable();
	         * or
	         - options (boolean | object) #optional true/false or An object with event listeners to be fired on drag events (object makes the Interactable draggable)
	         = (object) This Interactable
	         | interact(element).draggable({
	         |     onstart: function (event) {},
	         |     onmove : function (event) {},
	         |     onend  : function (event) {},
	         |
	         |     // the axis in which the first movement must be
	         |     // for the drag sequence to start
	         |     // 'xy' by default - any direction
	         |     axis: 'x' || 'y' || 'xy',
	         |
	         |     // max number of drags that can happen concurrently
	         |     // with elements of this Interactable. Infinity by default
	         |     max: Infinity,
	         |
	         |     // max number of drags that can target the same element+Interactable
	         |     // 1 by default
	         |     maxPerElement: 2
	         | });
	        \*/
	        draggable: function (options) {
	            if (isObject(options)) {
	                this.options.drag.enabled = options.enabled === false? false: true;
	                this.setPerAction('drag', options);
	                this.setOnEvents('drag', options);

	                if (/^x$|^y$|^xy$/.test(options.axis)) {
	                    this.options.drag.axis = options.axis;
	                }
	                else if (options.axis === null) {
	                    delete this.options.drag.axis;
	                }

	                return this;
	            }

	            if (isBool(options)) {
	                this.options.drag.enabled = options;

	                return this;
	            }

	            return this.options.drag;
	        },

	        setPerAction: function (action, options) {
	            // for all the default per-action options
	            for (var option in options) {
	                // if this option exists for this action
	                if (option in defaultOptions[action]) {
	                    // if the option in the options arg is an object value
	                    if (isObject(options[option])) {
	                        // duplicate the object
	                        this.options[action][option] = extend(this.options[action][option] || {}, options[option]);

	                        if (isObject(defaultOptions.perAction[option]) && 'enabled' in defaultOptions.perAction[option]) {
	                            this.options[action][option].enabled = options[option].enabled === false? false : true;
	                        }
	                    }
	                    else if (isBool(options[option]) && isObject(defaultOptions.perAction[option])) {
	                        this.options[action][option].enabled = options[option];
	                    }
	                    else if (options[option] !== undefined) {
	                        // or if it's not undefined, do a plain assignment
	                        this.options[action][option] = options[option];
	                    }
	                }
	            }
	        },

	        /*\
	         * Interactable.dropzone
	         [ method ]
	         *
	         * Returns or sets whether elements can be dropped onto this
	         * Interactable to trigger drop events
	         *
	         * Dropzones can receive the following events:
	         *  - `dropactivate` and `dropdeactivate` when an acceptable drag starts and ends
	         *  - `dragenter` and `dragleave` when a draggable enters and leaves the dropzone
	         *  - `dragmove` when a draggable that has entered the dropzone is moved
	         *  - `drop` when a draggable is dropped into this dropzone
	         *
	         *  Use the `accept` option to allow only elements that match the given CSS selector or element.
	         *
	         *  Use the `overlap` option to set how drops are checked for. The allowed values are:
	         *   - `'pointer'`, the pointer must be over the dropzone (default)
	         *   - `'center'`, the draggable element's center must be over the dropzone
	         *   - a number from 0-1 which is the `(intersection area) / (draggable area)`.
	         *       e.g. `0.5` for drop to happen when half of the area of the
	         *       draggable is over the dropzone
	         *
	         - options (boolean | object | null) #optional The new value to be set.
	         | interact('.drop').dropzone({
	         |   accept: '.can-drop' || document.getElementById('single-drop'),
	         |   overlap: 'pointer' || 'center' || zeroToOne
	         | }
	         = (boolean | object) The current setting or this Interactable
	        \*/
	        dropzone: function (options) {
	            if (isObject(options)) {
	                this.options.drop.enabled = options.enabled === false? false: true;
	                this.setOnEvents('drop', options);

	                if (/^(pointer|center)$/.test(options.overlap)) {
	                    this.options.drop.overlap = options.overlap;
	                }
	                else if (isNumber(options.overlap)) {
	                    this.options.drop.overlap = Math.max(Math.min(1, options.overlap), 0);
	                }
	                if ('accept' in options) {
	                  this.options.drop.accept = options.accept;
	                }
	                if ('checker' in options) {
	                  this.options.drop.checker = options.checker;
	                }

	                return this;
	            }

	            if (isBool(options)) {
	                this.options.drop.enabled = options;

	                return this;
	            }

	            return this.options.drop;
	        },

	        dropCheck: function (dragEvent, event, draggable, draggableElement, dropElement, rect) {
	            var dropped = false;

	            // if the dropzone has no rect (eg. display: none)
	            // call the custom dropChecker or just return false
	            if (!(rect = rect || this.getRect(dropElement))) {
	                return (this.options.drop.checker
	                    ? this.options.drop.checker(dragEvent, event, dropped, this, dropElement, draggable, draggableElement)
	                    : false);
	            }

	            var dropOverlap = this.options.drop.overlap;

	            if (dropOverlap === 'pointer') {
	                var page = getPageXY(dragEvent),
	                    origin = getOriginXY(draggable, draggableElement),
	                    horizontal,
	                    vertical;

	                page.x += origin.x;
	                page.y += origin.y;

	                horizontal = (page.x > rect.left) && (page.x < rect.right);
	                vertical   = (page.y > rect.top ) && (page.y < rect.bottom);

	                dropped = horizontal && vertical;
	            }

	            var dragRect = draggable.getRect(draggableElement);

	            if (dropOverlap === 'center') {
	                var cx = dragRect.left + dragRect.width  / 2,
	                    cy = dragRect.top  + dragRect.height / 2;

	                dropped = cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom;
	            }

	            if (isNumber(dropOverlap)) {
	                var overlapArea  = (Math.max(0, Math.min(rect.right , dragRect.right ) - Math.max(rect.left, dragRect.left))
	                                  * Math.max(0, Math.min(rect.bottom, dragRect.bottom) - Math.max(rect.top , dragRect.top ))),
	                    overlapRatio = overlapArea / (dragRect.width * dragRect.height);

	                dropped = overlapRatio >= dropOverlap;
	            }

	            if (this.options.drop.checker) {
	                dropped = this.options.drop.checker(dragEvent, event, dropped, this, dropElement, draggable, draggableElement);
	            }

	            return dropped;
	        },

	        /*\
	         * Interactable.dropChecker
	         [ method ]
	         *
	         * DEPRECATED. Use interactable.dropzone({ checker: function... }) instead.
	         *
	         * Gets or sets the function used to check if a dragged element is
	         * over this Interactable.
	         *
	         - checker (function) #optional The function that will be called when checking for a drop
	         = (Function | Interactable) The checker function or this Interactable
	         *
	         * The checker function takes the following arguments:
	         *
	         - dragEvent (InteractEvent) The related dragmove or dragend event
	         - event (TouchEvent | PointerEvent | MouseEvent) The user move/up/end Event related to the dragEvent
	         - dropped (boolean) The value from the default drop checker
	         - dropzone (Interactable) The dropzone interactable
	         - dropElement (Element) The dropzone element
	         - draggable (Interactable) The Interactable being dragged
	         - draggableElement (Element) The actual element that's being dragged
	         *
	         > Usage:
	         | interact(target)
	         | .dropChecker(function(dragEvent,         // related dragmove or dragend event
	         |                       event,             // TouchEvent/PointerEvent/MouseEvent
	         |                       dropped,           // bool result of the default checker
	         |                       dropzone,          // dropzone Interactable
	         |                       dropElement,       // dropzone elemnt
	         |                       draggable,         // draggable Interactable
	         |                       draggableElement) {// draggable element
	         |
	         |   return dropped && event.target.hasAttribute('allow-drop');
	         | }
	        \*/
	        dropChecker: function (checker) {
	            if (isFunction(checker)) {
	                this.options.drop.checker = checker;

	                return this;
	            }
	            if (checker === null) {
	                delete this.options.getRect;

	                return this;
	            }

	            return this.options.drop.checker;
	        },

	        /*\
	         * Interactable.accept
	         [ method ]
	         *
	         * Deprecated. add an `accept` property to the options object passed to
	         * @Interactable.dropzone instead.
	         *
	         * Gets or sets the Element or CSS selector match that this
	         * Interactable accepts if it is a dropzone.
	         *
	         - newValue (Element | string | null) #optional
	         * If it is an Element, then only that element can be dropped into this dropzone.
	         * If it is a string, the element being dragged must match it as a selector.
	         * If it is null, the accept options is cleared - it accepts any element.
	         *
	         = (string | Element | null | Interactable) The current accept option if given `undefined` or this Interactable
	        \*/
	        accept: function (newValue) {
	            if (isElement(newValue)) {
	                this.options.drop.accept = newValue;

	                return this;
	            }

	            // test if it is a valid CSS selector
	            if (trySelector(newValue)) {
	                this.options.drop.accept = newValue;

	                return this;
	            }

	            if (newValue === null) {
	                delete this.options.drop.accept;

	                return this;
	            }

	            return this.options.drop.accept;
	        },

	        /*\
	         * Interactable.resizable
	         [ method ]
	         *
	         * Gets or sets whether resize actions can be performed on the
	         * Interactable
	         *
	         = (boolean) Indicates if this can be the target of resize elements
	         | var isResizeable = interact('input[type=text]').resizable();
	         * or
	         - options (boolean | object) #optional true/false or An object with event listeners to be fired on resize events (object makes the Interactable resizable)
	         = (object) This Interactable
	         | interact(element).resizable({
	         |     onstart: function (event) {},
	         |     onmove : function (event) {},
	         |     onend  : function (event) {},
	         |
	         |     edges: {
	         |       top   : true,       // Use pointer coords to check for resize.
	         |       left  : false,      // Disable resizing from left edge.
	         |       bottom: '.resize-s',// Resize if pointer target matches selector
	         |       right : handleEl    // Resize if pointer target is the given Element
	         |     },
	         |
	         |     // Width and height can be adjusted independently. When `true`, width and
	         |     // height are adjusted at a 1:1 ratio.
	         |     square: false,
	         |
	         |     // Width and height can be adjusted independently. When `true`, width and
	         |     // height maintain the aspect ratio they had when resizing started.
	         |     preserveAspectRatio: false,
	         |
	         |     // a value of 'none' will limit the resize rect to a minimum of 0x0
	         |     // 'negate' will allow the rect to have negative width/height
	         |     // 'reposition' will keep the width/height positive by swapping
	         |     // the top and bottom edges and/or swapping the left and right edges
	         |     invert: 'none' || 'negate' || 'reposition'
	         |
	         |     // limit multiple resizes.
	         |     // See the explanation in the @Interactable.draggable example
	         |     max: Infinity,
	         |     maxPerElement: 1,
	         | });
	        \*/
	        resizable: function (options) {
	            if (isObject(options)) {
	                this.options.resize.enabled = options.enabled === false? false: true;
	                this.setPerAction('resize', options);
	                this.setOnEvents('resize', options);

	                if (/^x$|^y$|^xy$/.test(options.axis)) {
	                    this.options.resize.axis = options.axis;
	                }
	                else if (options.axis === null) {
	                    this.options.resize.axis = defaultOptions.resize.axis;
	                }

	                if (isBool(options.preserveAspectRatio)) {
	                    this.options.resize.preserveAspectRatio = options.preserveAspectRatio;
	                }
	                else if (isBool(options.square)) {
	                    this.options.resize.square = options.square;
	                }

	                return this;
	            }
	            if (isBool(options)) {
	                this.options.resize.enabled = options;

	                return this;
	            }
	            return this.options.resize;
	        },

	        /*\
	         * Interactable.squareResize
	         [ method ]
	         *
	         * Deprecated. Add a `square: true || false` property to @Interactable.resizable instead
	         *
	         * Gets or sets whether resizing is forced 1:1 aspect
	         *
	         = (boolean) Current setting
	         *
	         * or
	         *
	         - newValue (boolean) #optional
	         = (object) this Interactable
	        \*/
	        squareResize: function (newValue) {
	            if (isBool(newValue)) {
	                this.options.resize.square = newValue;

	                return this;
	            }

	            if (newValue === null) {
	                delete this.options.resize.square;

	                return this;
	            }

	            return this.options.resize.square;
	        },

	        /*\
	         * Interactable.gesturable
	         [ method ]
	         *
	         * Gets or sets whether multitouch gestures can be performed on the
	         * Interactable's element
	         *
	         = (boolean) Indicates if this can be the target of gesture events
	         | var isGestureable = interact(element).gesturable();
	         * or
	         - options (boolean | object) #optional true/false or An object with event listeners to be fired on gesture events (makes the Interactable gesturable)
	         = (object) this Interactable
	         | interact(element).gesturable({
	         |     onstart: function (event) {},
	         |     onmove : function (event) {},
	         |     onend  : function (event) {},
	         |
	         |     // limit multiple gestures.
	         |     // See the explanation in @Interactable.draggable example
	         |     max: Infinity,
	         |     maxPerElement: 1,
	         | });
	        \*/
	        gesturable: function (options) {
	            if (isObject(options)) {
	                this.options.gesture.enabled = options.enabled === false? false: true;
	                this.setPerAction('gesture', options);
	                this.setOnEvents('gesture', options);

	                return this;
	            }

	            if (isBool(options)) {
	                this.options.gesture.enabled = options;

	                return this;
	            }

	            return this.options.gesture;
	        },

	        /*\
	         * Interactable.autoScroll
	         [ method ]
	         **
	         * Deprecated. Add an `autoscroll` property to the options object
	         * passed to @Interactable.draggable or @Interactable.resizable instead.
	         *
	         * Returns or sets whether dragging and resizing near the edges of the
	         * window/container trigger autoScroll for this Interactable
	         *
	         = (object) Object with autoScroll properties
	         *
	         * or
	         *
	         - options (object | boolean) #optional
	         * options can be:
	         * - an object with margin, distance and interval properties,
	         * - true or false to enable or disable autoScroll or
	         = (Interactable) this Interactable
	        \*/
	        autoScroll: function (options) {
	            if (isObject(options)) {
	                options = extend({ actions: ['drag', 'resize']}, options);
	            }
	            else if (isBool(options)) {
	                options = { actions: ['drag', 'resize'], enabled: options };
	            }

	            return this.setOptions('autoScroll', options);
	        },

	        /*\
	         * Interactable.snap
	         [ method ]
	         **
	         * Deprecated. Add a `snap` property to the options object passed
	         * to @Interactable.draggable or @Interactable.resizable instead.
	         *
	         * Returns or sets if and how action coordinates are snapped. By
	         * default, snapping is relative to the pointer coordinates. You can
	         * change this by setting the
	         * [`elementOrigin`](https://github.com/taye/interact.js/pull/72).
	         **
	         = (boolean | object) `false` if snap is disabled; object with snap properties if snap is enabled
	         **
	         * or
	         **
	         - options (object | boolean | null) #optional
	         = (Interactable) this Interactable
	         > Usage
	         | interact(document.querySelector('#thing')).snap({
	         |     targets: [
	         |         // snap to this specific point
	         |         {
	         |             x: 100,
	         |             y: 100,
	         |             range: 25
	         |         },
	         |         // give this function the x and y page coords and snap to the object returned
	         |         function (x, y) {
	         |             return {
	         |                 x: x,
	         |                 y: (75 + 50 * Math.sin(x * 0.04)),
	         |                 range: 40
	         |             };
	         |         },
	         |         // create a function that snaps to a grid
	         |         interact.createSnapGrid({
	         |             x: 50,
	         |             y: 50,
	         |             range: 10,              // optional
	         |             offset: { x: 5, y: 10 } // optional
	         |         })
	         |     ],
	         |     // do not snap during normal movement.
	         |     // Instead, trigger only one snapped move event
	         |     // immediately before the end event.
	         |     endOnly: true,
	         |
	         |     relativePoints: [
	         |         { x: 0, y: 0 },  // snap relative to the top left of the element
	         |         { x: 1, y: 1 },  // and also to the bottom right
	         |     ],  
	         |
	         |     // offset the snap target coordinates
	         |     // can be an object with x/y or 'startCoords'
	         |     offset: { x: 50, y: 50 }
	         |   }
	         | });
	        \*/
	        snap: function (options) {
	            var ret = this.setOptions('snap', options);

	            if (ret === this) { return this; }

	            return ret.drag;
	        },

	        setOptions: function (option, options) {
	            var actions = options && isArray(options.actions)
	                    ? options.actions
	                    : ['drag'];

	            var i;

	            if (isObject(options) || isBool(options)) {
	                for (i = 0; i < actions.length; i++) {
	                    var action = /resize/.test(actions[i])? 'resize' : actions[i];

	                    if (!isObject(this.options[action])) { continue; }

	                    var thisOption = this.options[action][option];

	                    if (isObject(options)) {
	                        extend(thisOption, options);
	                        thisOption.enabled = options.enabled === false? false: true;

	                        if (option === 'snap') {
	                            if (thisOption.mode === 'grid') {
	                                thisOption.targets = [
	                                    interact.createSnapGrid(extend({
	                                        offset: thisOption.gridOffset || { x: 0, y: 0 }
	                                    }, thisOption.grid || {}))
	                                ];
	                            }
	                            else if (thisOption.mode === 'anchor') {
	                                thisOption.targets = thisOption.anchors;
	                            }
	                            else if (thisOption.mode === 'path') {
	                                thisOption.targets = thisOption.paths;
	                            }

	                            if ('elementOrigin' in options) {
	                                thisOption.relativePoints = [options.elementOrigin];
	                            }
	                        }
	                    }
	                    else if (isBool(options)) {
	                        thisOption.enabled = options;
	                    }
	                }

	                return this;
	            }

	            var ret = {},
	                allActions = ['drag', 'resize', 'gesture'];

	            for (i = 0; i < allActions.length; i++) {
	                if (option in defaultOptions[allActions[i]]) {
	                    ret[allActions[i]] = this.options[allActions[i]][option];
	                }
	            }

	            return ret;
	        },


	        /*\
	         * Interactable.inertia
	         [ method ]
	         **
	         * Deprecated. Add an `inertia` property to the options object passed
	         * to @Interactable.draggable or @Interactable.resizable instead.
	         *
	         * Returns or sets if and how events continue to run after the pointer is released
	         **
	         = (boolean | object) `false` if inertia is disabled; `object` with inertia properties if inertia is enabled
	         **
	         * or
	         **
	         - options (object | boolean | null) #optional
	         = (Interactable) this Interactable
	         > Usage
	         | // enable and use default settings
	         | interact(element).inertia(true);
	         |
	         | // enable and use custom settings
	         | interact(element).inertia({
	         |     // value greater than 0
	         |     // high values slow the object down more quickly
	         |     resistance     : 16,
	         |
	         |     // the minimum launch speed (pixels per second) that results in inertia start
	         |     minSpeed       : 200,
	         |
	         |     // inertia will stop when the object slows down to this speed
	         |     endSpeed       : 20,
	         |
	         |     // boolean; should actions be resumed when the pointer goes down during inertia
	         |     allowResume    : true,
	         |
	         |     // boolean; should the jump when resuming from inertia be ignored in event.dx/dy
	         |     zeroResumeDelta: false,
	         |
	         |     // if snap/restrict are set to be endOnly and inertia is enabled, releasing
	         |     // the pointer without triggering inertia will animate from the release
	         |     // point to the snaped/restricted point in the given amount of time (ms)
	         |     smoothEndDuration: 300,
	         |
	         |     // an array of action types that can have inertia (no gesture)
	         |     actions        : ['drag', 'resize']
	         | });
	         |
	         | // reset custom settings and use all defaults
	         | interact(element).inertia(null);
	        \*/
	        inertia: function (options) {
	            var ret = this.setOptions('inertia', options);

	            if (ret === this) { return this; }

	            return ret.drag;
	        },

	        getAction: function (pointer, event, interaction, element) {
	            var action = this.defaultActionChecker(pointer, interaction, element);

	            if (this.options.actionChecker) {
	                return this.options.actionChecker(pointer, event, action, this, element, interaction);
	            }

	            return action;
	        },

	        defaultActionChecker: defaultActionChecker,

	        /*\
	         * Interactable.actionChecker
	         [ method ]
	         *
	         * Gets or sets the function used to check action to be performed on
	         * pointerDown
	         *
	         - checker (function | null) #optional A function which takes a pointer event, defaultAction string, interactable, element and interaction as parameters and returns an object with name property 'drag' 'resize' or 'gesture' and optionally an `edges` object with boolean 'top', 'left', 'bottom' and right props.
	         = (Function | Interactable) The checker function or this Interactable
	         *
	         | interact('.resize-drag')
	         |   .resizable(true)
	         |   .draggable(true)
	         |   .actionChecker(function (pointer, event, action, interactable, element, interaction) {
	         |
	         |   if (interact.matchesSelector(event.target, '.drag-handle') {
	         |     // force drag with handle target
	         |     action.name = drag;
	         |   }
	         |   else {
	         |     // resize from the top and right edges
	         |     action.name  = 'resize';
	         |     action.edges = { top: true, right: true };
	         |   }
	         |
	         |   return action;
	         | });
	        \*/
	        actionChecker: function (checker) {
	            if (isFunction(checker)) {
	                this.options.actionChecker = checker;

	                return this;
	            }

	            if (checker === null) {
	                delete this.options.actionChecker;

	                return this;
	            }

	            return this.options.actionChecker;
	        },

	        /*\
	         * Interactable.getRect
	         [ method ]
	         *
	         * The default function to get an Interactables bounding rect. Can be
	         * overridden using @Interactable.rectChecker.
	         *
	         - element (Element) #optional The element to measure.
	         = (object) The object's bounding rectangle.
	         o {
	         o     top   : 0,
	         o     left  : 0,
	         o     bottom: 0,
	         o     right : 0,
	         o     width : 0,
	         o     height: 0
	         o }
	        \*/
	        getRect: function rectCheck (element) {
	            element = element || this._element;

	            if (this.selector && !(isElement(element))) {
	                element = this._context.querySelector(this.selector);
	            }

	            return getElementRect(element);
	        },

	        /*\
	         * Interactable.rectChecker
	         [ method ]
	         *
	         * Returns or sets the function used to calculate the interactable's
	         * element's rectangle
	         *
	         - checker (function) #optional A function which returns this Interactable's bounding rectangle. See @Interactable.getRect
	         = (function | object) The checker function or this Interactable
	        \*/
	        rectChecker: function (checker) {
	            if (isFunction(checker)) {
	                this.getRect = checker;

	                return this;
	            }

	            if (checker === null) {
	                delete this.options.getRect;

	                return this;
	            }

	            return this.getRect;
	        },

	        /*\
	         * Interactable.styleCursor
	         [ method ]
	         *
	         * Returns or sets whether the action that would be performed when the
	         * mouse on the element are checked on `mousemove` so that the cursor
	         * may be styled appropriately
	         *
	         - newValue (boolean) #optional
	         = (boolean | Interactable) The current setting or this Interactable
	        \*/
	        styleCursor: function (newValue) {
	            if (isBool(newValue)) {
	                this.options.styleCursor = newValue;

	                return this;
	            }

	            if (newValue === null) {
	                delete this.options.styleCursor;

	                return this;
	            }

	            return this.options.styleCursor;
	        },

	        /*\
	         * Interactable.preventDefault
	         [ method ]
	         *
	         * Returns or sets whether to prevent the browser's default behaviour
	         * in response to pointer events. Can be set to:
	         *  - `'always'` to always prevent
	         *  - `'never'` to never prevent
	         *  - `'auto'` to let interact.js try to determine what would be best
	         *
	         - newValue (string) #optional `true`, `false` or `'auto'`
	         = (string | Interactable) The current setting or this Interactable
	        \*/
	        preventDefault: function (newValue) {
	            if (/^(always|never|auto)$/.test(newValue)) {
	                this.options.preventDefault = newValue;
	                return this;
	            }

	            if (isBool(newValue)) {
	                this.options.preventDefault = newValue? 'always' : 'never';
	                return this;
	            }

	            return this.options.preventDefault;
	        },

	        /*\
	         * Interactable.origin
	         [ method ]
	         *
	         * Gets or sets the origin of the Interactable's element.  The x and y
	         * of the origin will be subtracted from action event coordinates.
	         *
	         - origin (object | string) #optional An object eg. { x: 0, y: 0 } or string 'parent', 'self' or any CSS selector
	         * OR
	         - origin (Element) #optional An HTML or SVG Element whose rect will be used
	         **
	         = (object) The current origin or this Interactable
	        \*/
	        origin: function (newValue) {
	            if (trySelector(newValue)) {
	                this.options.origin = newValue;
	                return this;
	            }
	            else if (isObject(newValue)) {
	                this.options.origin = newValue;
	                return this;
	            }

	            return this.options.origin;
	        },

	        /*\
	         * Interactable.deltaSource
	         [ method ]
	         *
	         * Returns or sets the mouse coordinate types used to calculate the
	         * movement of the pointer.
	         *
	         - newValue (string) #optional Use 'client' if you will be scrolling while interacting; Use 'page' if you want autoScroll to work
	         = (string | object) The current deltaSource or this Interactable
	        \*/
	        deltaSource: function (newValue) {
	            if (newValue === 'page' || newValue === 'client') {
	                this.options.deltaSource = newValue;

	                return this;
	            }

	            return this.options.deltaSource;
	        },

	        /*\
	         * Interactable.restrict
	         [ method ]
	         **
	         * Deprecated. Add a `restrict` property to the options object passed to
	         * @Interactable.draggable, @Interactable.resizable or @Interactable.gesturable instead.
	         *
	         * Returns or sets the rectangles within which actions on this
	         * interactable (after snap calculations) are restricted. By default,
	         * restricting is relative to the pointer coordinates. You can change
	         * this by setting the
	         * [`elementRect`](https://github.com/taye/interact.js/pull/72).
	         **
	         - options (object) #optional an object with keys drag, resize, and/or gesture whose values are rects, Elements, CSS selectors, or 'parent' or 'self'
	         = (object) The current restrictions object or this Interactable
	         **
	         | interact(element).restrict({
	         |     // the rect will be `interact.getElementRect(element.parentNode)`
	         |     drag: element.parentNode,
	         |
	         |     // x and y are relative to the the interactable's origin
	         |     resize: { x: 100, y: 100, width: 200, height: 200 }
	         | })
	         |
	         | interact('.draggable').restrict({
	         |     // the rect will be the selected element's parent
	         |     drag: 'parent',
	         |
	         |     // do not restrict during normal movement.
	         |     // Instead, trigger only one restricted move event
	         |     // immediately before the end event.
	         |     endOnly: true,
	         |
	         |     // https://github.com/taye/interact.js/pull/72#issue-41813493
	         |     elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
	         | });
	        \*/
	        restrict: function (options) {
	            if (!isObject(options)) {
	                return this.setOptions('restrict', options);
	            }

	            var actions = ['drag', 'resize', 'gesture'],
	                ret;

	            for (var i = 0; i < actions.length; i++) {
	                var action = actions[i];

	                if (action in options) {
	                    var perAction = extend({
	                            actions: [action],
	                            restriction: options[action]
	                        }, options);

	                    ret = this.setOptions('restrict', perAction);
	                }
	            }

	            return ret;
	        },

	        /*\
	         * Interactable.context
	         [ method ]
	         *
	         * Gets the selector context Node of the Interactable. The default is `window.document`.
	         *
	         = (Node) The context Node of this Interactable
	         **
	        \*/
	        context: function () {
	            return this._context;
	        },

	        _context: document,

	        /*\
	         * Interactable.ignoreFrom
	         [ method ]
	         *
	         * If the target of the `mousedown`, `pointerdown` or `touchstart`
	         * event or any of it's parents match the given CSS selector or
	         * Element, no drag/resize/gesture is started.
	         *
	         - newValue (string | Element | null) #optional a CSS selector string, an Element or `null` to not ignore any elements
	         = (string | Element | object) The current ignoreFrom value or this Interactable
	         **
	         | interact(element, { ignoreFrom: document.getElementById('no-action') });
	         | // or
	         | interact(element).ignoreFrom('input, textarea, a');
	        \*/
	        ignoreFrom: function (newValue) {
	            if (trySelector(newValue)) {            // CSS selector to match event.target
	                this.options.ignoreFrom = newValue;
	                return this;
	            }

	            if (isElement(newValue)) {              // specific element
	                this.options.ignoreFrom = newValue;
	                return this;
	            }

	            return this.options.ignoreFrom;
	        },

	        /*\
	         * Interactable.allowFrom
	         [ method ]
	         *
	         * A drag/resize/gesture is started only If the target of the
	         * `mousedown`, `pointerdown` or `touchstart` event or any of it's
	         * parents match the given CSS selector or Element.
	         *
	         - newValue (string | Element | null) #optional a CSS selector string, an Element or `null` to allow from any element
	         = (string | Element | object) The current allowFrom value or this Interactable
	         **
	         | interact(element, { allowFrom: document.getElementById('drag-handle') });
	         | // or
	         | interact(element).allowFrom('.handle');
	        \*/
	        allowFrom: function (newValue) {
	            if (trySelector(newValue)) {            // CSS selector to match event.target
	                this.options.allowFrom = newValue;
	                return this;
	            }

	            if (isElement(newValue)) {              // specific element
	                this.options.allowFrom = newValue;
	                return this;
	            }

	            return this.options.allowFrom;
	        },

	        /*\
	         * Interactable.element
	         [ method ]
	         *
	         * If this is not a selector Interactable, it returns the element this
	         * interactable represents
	         *
	         = (Element) HTML / SVG Element
	        \*/
	        element: function () {
	            return this._element;
	        },

	        /*\
	         * Interactable.fire
	         [ method ]
	         *
	         * Calls listeners for the given InteractEvent type bound globally
	         * and directly to this Interactable
	         *
	         - iEvent (InteractEvent) The InteractEvent object to be fired on this Interactable
	         = (Interactable) this Interactable
	        \*/
	        fire: function (iEvent) {
	            if (!(iEvent && iEvent.type) || !contains(eventTypes, iEvent.type)) {
	                return this;
	            }

	            var listeners,
	                i,
	                len,
	                onEvent = 'on' + iEvent.type,
	                funcName = '';

	            // Interactable#on() listeners
	            if (iEvent.type in this._iEvents) {
	                listeners = this._iEvents[iEvent.type];

	                for (i = 0, len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
	                    funcName = listeners[i].name;
	                    listeners[i](iEvent);
	                }
	            }

	            // interactable.onevent listener
	            if (isFunction(this[onEvent])) {
	                funcName = this[onEvent].name;
	                this[onEvent](iEvent);
	            }

	            // interact.on() listeners
	            if (iEvent.type in globalEvents && (listeners = globalEvents[iEvent.type]))  {

	                for (i = 0, len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
	                    funcName = listeners[i].name;
	                    listeners[i](iEvent);
	                }
	            }

	            return this;
	        },

	        /*\
	         * Interactable.on
	         [ method ]
	         *
	         * Binds a listener for an InteractEvent or DOM event.
	         *
	         - eventType  (string | array | object) The types of events to listen for
	         - listener   (function) The function to be called on the given event(s)
	         - useCapture (boolean) #optional useCapture flag for addEventListener
	         = (object) This Interactable
	        \*/
	        on: function (eventType, listener, useCapture) {
	            var i;

	            if (isString(eventType) && eventType.search(' ') !== -1) {
	                eventType = eventType.trim().split(/ +/);
	            }

	            if (isArray(eventType)) {
	                for (i = 0; i < eventType.length; i++) {
	                    this.on(eventType[i], listener, useCapture);
	                }

	                return this;
	            }

	            if (isObject(eventType)) {
	                for (var prop in eventType) {
	                    this.on(prop, eventType[prop], listener);
	                }

	                return this;
	            }

	            if (eventType === 'wheel') {
	                eventType = wheelEvent;
	            }

	            // convert to boolean
	            useCapture = useCapture? true: false;

	            if (contains(eventTypes, eventType)) {
	                // if this type of event was never bound to this Interactable
	                if (!(eventType in this._iEvents)) {
	                    this._iEvents[eventType] = [listener];
	                }
	                else {
	                    this._iEvents[eventType].push(listener);
	                }
	            }
	            // delegated event for selector
	            else if (this.selector) {
	                if (!delegatedEvents[eventType]) {
	                    delegatedEvents[eventType] = {
	                        selectors: [],
	                        contexts : [],
	                        listeners: []
	                    };

	                    // add delegate listener functions
	                    for (i = 0; i < documents.length; i++) {
	                        events.add(documents[i], eventType, delegateListener);
	                        events.add(documents[i], eventType, delegateUseCapture, true);
	                    }
	                }

	                var delegated = delegatedEvents[eventType],
	                    index;

	                for (index = delegated.selectors.length - 1; index >= 0; index--) {
	                    if (delegated.selectors[index] === this.selector
	                        && delegated.contexts[index] === this._context) {
	                        break;
	                    }
	                }

	                if (index === -1) {
	                    index = delegated.selectors.length;

	                    delegated.selectors.push(this.selector);
	                    delegated.contexts .push(this._context);
	                    delegated.listeners.push([]);
	                }

	                // keep listener and useCapture flag
	                delegated.listeners[index].push([listener, useCapture]);
	            }
	            else {
	                events.add(this._element, eventType, listener, useCapture);
	            }

	            return this;
	        },

	        /*\
	         * Interactable.off
	         [ method ]
	         *
	         * Removes an InteractEvent or DOM event listener
	         *
	         - eventType  (string | array | object) The types of events that were listened for
	         - listener   (function) The listener function to be removed
	         - useCapture (boolean) #optional useCapture flag for removeEventListener
	         = (object) This Interactable
	        \*/
	        off: function (eventType, listener, useCapture) {
	            var i;

	            if (isString(eventType) && eventType.search(' ') !== -1) {
	                eventType = eventType.trim().split(/ +/);
	            }

	            if (isArray(eventType)) {
	                for (i = 0; i < eventType.length; i++) {
	                    this.off(eventType[i], listener, useCapture);
	                }

	                return this;
	            }

	            if (isObject(eventType)) {
	                for (var prop in eventType) {
	                    this.off(prop, eventType[prop], listener);
	                }

	                return this;
	            }

	            var eventList,
	                index = -1;

	            // convert to boolean
	            useCapture = useCapture? true: false;

	            if (eventType === 'wheel') {
	                eventType = wheelEvent;
	            }

	            // if it is an action event type
	            if (contains(eventTypes, eventType)) {
	                eventList = this._iEvents[eventType];

	                if (eventList && (index = indexOf(eventList, listener)) !== -1) {
	                    this._iEvents[eventType].splice(index, 1);
	                }
	            }
	            // delegated event
	            else if (this.selector) {
	                var delegated = delegatedEvents[eventType],
	                    matchFound = false;

	                if (!delegated) { return this; }

	                // count from last index of delegated to 0
	                for (index = delegated.selectors.length - 1; index >= 0; index--) {
	                    // look for matching selector and context Node
	                    if (delegated.selectors[index] === this.selector
	                        && delegated.contexts[index] === this._context) {

	                        var listeners = delegated.listeners[index];

	                        // each item of the listeners array is an array: [function, useCaptureFlag]
	                        for (i = listeners.length - 1; i >= 0; i--) {
	                            var fn = listeners[i][0],
	                                useCap = listeners[i][1];

	                            // check if the listener functions and useCapture flags match
	                            if (fn === listener && useCap === useCapture) {
	                                // remove the listener from the array of listeners
	                                listeners.splice(i, 1);

	                                // if all listeners for this interactable have been removed
	                                // remove the interactable from the delegated arrays
	                                if (!listeners.length) {
	                                    delegated.selectors.splice(index, 1);
	                                    delegated.contexts .splice(index, 1);
	                                    delegated.listeners.splice(index, 1);

	                                    // remove delegate function from context
	                                    events.remove(this._context, eventType, delegateListener);
	                                    events.remove(this._context, eventType, delegateUseCapture, true);

	                                    // remove the arrays if they are empty
	                                    if (!delegated.selectors.length) {
	                                        delegatedEvents[eventType] = null;
	                                    }
	                                }

	                                // only remove one listener
	                                matchFound = true;
	                                break;
	                            }
	                        }

	                        if (matchFound) { break; }
	                    }
	                }
	            }
	            // remove listener from this Interatable's element
	            else {
	                events.remove(this._element, eventType, listener, useCapture);
	            }

	            return this;
	        },

	        /*\
	         * Interactable.set
	         [ method ]
	         *
	         * Reset the options of this Interactable
	         - options (object) The new settings to apply
	         = (object) This Interactable
	        \*/
	        set: function (options) {
	            if (!isObject(options)) {
	                options = {};
	            }

	            this.options = extend({}, defaultOptions.base);

	            var i,
	                actions = ['drag', 'drop', 'resize', 'gesture'],
	                methods = ['draggable', 'dropzone', 'resizable', 'gesturable'],
	                perActions = extend(extend({}, defaultOptions.perAction), options[action] || {});

	            for (i = 0; i < actions.length; i++) {
	                var action = actions[i];

	                this.options[action] = extend({}, defaultOptions[action]);

	                this.setPerAction(action, perActions);

	                this[methods[i]](options[action]);
	            }

	            var settings = [
	                    'accept', 'actionChecker', 'allowFrom', 'deltaSource',
	                    'dropChecker', 'ignoreFrom', 'origin', 'preventDefault',
	                    'rectChecker', 'styleCursor'
	                ];

	            for (i = 0, len = settings.length; i < len; i++) {
	                var setting = settings[i];

	                this.options[setting] = defaultOptions.base[setting];

	                if (setting in options) {
	                    this[setting](options[setting]);
	                }
	            }

	            return this;
	        },

	        /*\
	         * Interactable.unset
	         [ method ]
	         *
	         * Remove this interactable from the list of interactables and remove
	         * it's drag, drop, resize and gesture capabilities
	         *
	         = (object) @interact
	        \*/
	        unset: function () {
	            events.remove(this._element, 'all');

	            if (!isString(this.selector)) {
	                events.remove(this, 'all');
	                if (this.options.styleCursor) {
	                    this._element.style.cursor = '';
	                }
	            }
	            else {
	                // remove delegated events
	                for (var type in delegatedEvents) {
	                    var delegated = delegatedEvents[type];

	                    for (var i = 0; i < delegated.selectors.length; i++) {
	                        if (delegated.selectors[i] === this.selector
	                            && delegated.contexts[i] === this._context) {

	                            delegated.selectors.splice(i, 1);
	                            delegated.contexts .splice(i, 1);
	                            delegated.listeners.splice(i, 1);

	                            // remove the arrays if they are empty
	                            if (!delegated.selectors.length) {
	                                delegatedEvents[type] = null;
	                            }
	                        }

	                        events.remove(this._context, type, delegateListener);
	                        events.remove(this._context, type, delegateUseCapture, true);

	                        break;
	                    }
	                }
	            }

	            this.dropzone(false);

	            interactables.splice(indexOf(interactables, this), 1);

	            return interact;
	        }
	    };

	    function warnOnce (method, message) {
	        var warned = false;

	        return function () {
	            if (!warned) {
	                window.console.warn(message);
	                warned = true;
	            }

	            return method.apply(this, arguments);
	        };
	    }

	    Interactable.prototype.snap = warnOnce(Interactable.prototype.snap,
	         'Interactable#snap is deprecated. See the new documentation for snapping at http://interactjs.io/docs/snapping');
	    Interactable.prototype.restrict = warnOnce(Interactable.prototype.restrict,
	         'Interactable#restrict is deprecated. See the new documentation for resticting at http://interactjs.io/docs/restriction');
	    Interactable.prototype.inertia = warnOnce(Interactable.prototype.inertia,
	         'Interactable#inertia is deprecated. See the new documentation for inertia at http://interactjs.io/docs/inertia');
	    Interactable.prototype.autoScroll = warnOnce(Interactable.prototype.autoScroll,
	         'Interactable#autoScroll is deprecated. See the new documentation for autoScroll at http://interactjs.io/docs/#autoscroll');
	    Interactable.prototype.squareResize = warnOnce(Interactable.prototype.squareResize,
	         'Interactable#squareResize is deprecated. See http://interactjs.io/docs/#resize-square');

	    Interactable.prototype.accept = warnOnce(Interactable.prototype.accept,
	         'Interactable#accept is deprecated. use Interactable#dropzone({ accept: target }) instead');
	    Interactable.prototype.dropChecker = warnOnce(Interactable.prototype.dropChecker,
	         'Interactable#dropChecker is deprecated. use Interactable#dropzone({ dropChecker: checkerFunction }) instead');
	    Interactable.prototype.context = warnOnce(Interactable.prototype.context,
	         'Interactable#context as a method is deprecated. It will soon be a DOM Node instead');

	    /*\
	     * interact.isSet
	     [ method ]
	     *
	     * Check if an element has been set
	     - element (Element) The Element being searched for
	     = (boolean) Indicates if the element or CSS selector was previously passed to interact
	    \*/
	    interact.isSet = function(element, options) {
	        return interactables.indexOfElement(element, options && options.context) !== -1;
	    };

	    /*\
	     * interact.on
	     [ method ]
	     *
	     * Adds a global listener for an InteractEvent or adds a DOM event to
	     * `document`
	     *
	     - type       (string | array | object) The types of events to listen for
	     - listener   (function) The function to be called on the given event(s)
	     - useCapture (boolean) #optional useCapture flag for addEventListener
	     = (object) interact
	    \*/
	    interact.on = function (type, listener, useCapture) {
	        if (isString(type) && type.search(' ') !== -1) {
	            type = type.trim().split(/ +/);
	        }

	        if (isArray(type)) {
	            for (var i = 0; i < type.length; i++) {
	                interact.on(type[i], listener, useCapture);
	            }

	            return interact;
	        }

	        if (isObject(type)) {
	            for (var prop in type) {
	                interact.on(prop, type[prop], listener);
	            }

	            return interact;
	        }

	        // if it is an InteractEvent type, add listener to globalEvents
	        if (contains(eventTypes, type)) {
	            // if this type of event was never bound
	            if (!globalEvents[type]) {
	                globalEvents[type] = [listener];
	            }
	            else {
	                globalEvents[type].push(listener);
	            }
	        }
	        // If non InteractEvent type, addEventListener to document
	        else {
	            events.add(document, type, listener, useCapture);
	        }

	        return interact;
	    };

	    /*\
	     * interact.off
	     [ method ]
	     *
	     * Removes a global InteractEvent listener or DOM event from `document`
	     *
	     - type       (string | array | object) The types of events that were listened for
	     - listener   (function) The listener function to be removed
	     - useCapture (boolean) #optional useCapture flag for removeEventListener
	     = (object) interact
	     \*/
	    interact.off = function (type, listener, useCapture) {
	        if (isString(type) && type.search(' ') !== -1) {
	            type = type.trim().split(/ +/);
	        }

	        if (isArray(type)) {
	            for (var i = 0; i < type.length; i++) {
	                interact.off(type[i], listener, useCapture);
	            }

	            return interact;
	        }

	        if (isObject(type)) {
	            for (var prop in type) {
	                interact.off(prop, type[prop], listener);
	            }

	            return interact;
	        }

	        if (!contains(eventTypes, type)) {
	            events.remove(document, type, listener, useCapture);
	        }
	        else {
	            var index;

	            if (type in globalEvents
	                && (index = indexOf(globalEvents[type], listener)) !== -1) {
	                globalEvents[type].splice(index, 1);
	            }
	        }

	        return interact;
	    };

	    /*\
	     * interact.enableDragging
	     [ method ]
	     *
	     * Deprecated.
	     *
	     * Returns or sets whether dragging is enabled for any Interactables
	     *
	     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
	     = (boolean | object) The current setting or interact
	    \*/
	    interact.enableDragging = warnOnce(function (newValue) {
	        if (newValue !== null && newValue !== undefined) {
	            actionIsEnabled.drag = newValue;

	            return interact;
	        }
	        return actionIsEnabled.drag;
	    }, 'interact.enableDragging is deprecated and will soon be removed.');

	    /*\
	     * interact.enableResizing
	     [ method ]
	     *
	     * Deprecated.
	     *
	     * Returns or sets whether resizing is enabled for any Interactables
	     *
	     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
	     = (boolean | object) The current setting or interact
	    \*/
	    interact.enableResizing = warnOnce(function (newValue) {
	        if (newValue !== null && newValue !== undefined) {
	            actionIsEnabled.resize = newValue;

	            return interact;
	        }
	        return actionIsEnabled.resize;
	    }, 'interact.enableResizing is deprecated and will soon be removed.');

	    /*\
	     * interact.enableGesturing
	     [ method ]
	     *
	     * Deprecated.
	     *
	     * Returns or sets whether gesturing is enabled for any Interactables
	     *
	     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
	     = (boolean | object) The current setting or interact
	    \*/
	    interact.enableGesturing = warnOnce(function (newValue) {
	        if (newValue !== null && newValue !== undefined) {
	            actionIsEnabled.gesture = newValue;

	            return interact;
	        }
	        return actionIsEnabled.gesture;
	    }, 'interact.enableGesturing is deprecated and will soon be removed.');

	    interact.eventTypes = eventTypes;

	    /*\
	     * interact.debug
	     [ method ]
	     *
	     * Returns debugging data
	     = (object) An object with properties that outline the current state and expose internal functions and variables
	    \*/
	    interact.debug = function () {
	        var interaction = interactions[0] || new Interaction();

	        return {
	            interactions          : interactions,
	            target                : interaction.target,
	            dragging              : interaction.dragging,
	            resizing              : interaction.resizing,
	            gesturing             : interaction.gesturing,
	            prepared              : interaction.prepared,
	            matches               : interaction.matches,
	            matchElements         : interaction.matchElements,

	            prevCoords            : interaction.prevCoords,
	            startCoords           : interaction.startCoords,

	            pointerIds            : interaction.pointerIds,
	            pointers              : interaction.pointers,
	            addPointer            : listeners.addPointer,
	            removePointer         : listeners.removePointer,
	            recordPointer        : listeners.recordPointer,

	            snap                  : interaction.snapStatus,
	            restrict              : interaction.restrictStatus,
	            inertia               : interaction.inertiaStatus,

	            downTime              : interaction.downTimes[0],
	            downEvent             : interaction.downEvent,
	            downPointer           : interaction.downPointer,
	            prevEvent             : interaction.prevEvent,

	            Interactable          : Interactable,
	            interactables         : interactables,
	            pointerIsDown         : interaction.pointerIsDown,
	            defaultOptions        : defaultOptions,
	            defaultActionChecker  : defaultActionChecker,

	            actionCursors         : actionCursors,
	            dragMove              : listeners.dragMove,
	            resizeMove            : listeners.resizeMove,
	            gestureMove           : listeners.gestureMove,
	            pointerUp             : listeners.pointerUp,
	            pointerDown           : listeners.pointerDown,
	            pointerMove           : listeners.pointerMove,
	            pointerHover          : listeners.pointerHover,

	            eventTypes            : eventTypes,

	            events                : events,
	            globalEvents          : globalEvents,
	            delegatedEvents       : delegatedEvents,

	            prefixedPropREs       : prefixedPropREs
	        };
	    };

	    // expose the functions used to calculate multi-touch properties
	    interact.getPointerAverage = pointerAverage;
	    interact.getTouchBBox     = touchBBox;
	    interact.getTouchDistance = touchDistance;
	    interact.getTouchAngle    = touchAngle;

	    interact.getElementRect         = getElementRect;
	    interact.getElementClientRect   = getElementClientRect;
	    interact.matchesSelector        = matchesSelector;
	    interact.closest                = closest;

	    /*\
	     * interact.margin
	     [ method ]
	     *
	     * Deprecated. Use `interact(target).resizable({ margin: number });` instead.
	     * Returns or sets the margin for autocheck resizing used in
	     * @Interactable.getAction. That is the distance from the bottom and right
	     * edges of an element clicking in which will start resizing
	     *
	     - newValue (number) #optional
	     = (number | interact) The current margin value or interact
	    \*/
	    interact.margin = warnOnce(function (newvalue) {
	        if (isNumber(newvalue)) {
	            margin = newvalue;

	            return interact;
	        }
	        return margin;
	    },
	    'interact.margin is deprecated. Use interact(target).resizable({ margin: number }); instead.') ;

	    /*\
	     * interact.supportsTouch
	     [ method ]
	     *
	     = (boolean) Whether or not the browser supports touch input
	    \*/
	    interact.supportsTouch = function () {
	        return supportsTouch;
	    };

	    /*\
	     * interact.supportsPointerEvent
	     [ method ]
	     *
	     = (boolean) Whether or not the browser supports PointerEvents
	    \*/
	    interact.supportsPointerEvent = function () {
	        return supportsPointerEvent;
	    };

	    /*\
	     * interact.stop
	     [ method ]
	     *
	     * Cancels all interactions (end events are not fired)
	     *
	     - event (Event) An event on which to call preventDefault()
	     = (object) interact
	    \*/
	    interact.stop = function (event) {
	        for (var i = interactions.length - 1; i >= 0; i--) {
	            interactions[i].stop(event);
	        }

	        return interact;
	    };

	    /*\
	     * interact.dynamicDrop
	     [ method ]
	     *
	     * Returns or sets whether the dimensions of dropzone elements are
	     * calculated on every dragmove or only on dragstart for the default
	     * dropChecker
	     *
	     - newValue (boolean) #optional True to check on each move. False to check only before start
	     = (boolean | interact) The current setting or interact
	    \*/
	    interact.dynamicDrop = function (newValue) {
	        if (isBool(newValue)) {
	            //if (dragging && dynamicDrop !== newValue && !newValue) {
	                //calcRects(dropzones);
	            //}

	            dynamicDrop = newValue;

	            return interact;
	        }
	        return dynamicDrop;
	    };

	    /*\
	     * interact.pointerMoveTolerance
	     [ method ]
	     * Returns or sets the distance the pointer must be moved before an action
	     * sequence occurs. This also affects tolerance for tap events.
	     *
	     - newValue (number) #optional The movement from the start position must be greater than this value
	     = (number | Interactable) The current setting or interact
	    \*/
	    interact.pointerMoveTolerance = function (newValue) {
	        if (isNumber(newValue)) {
	            pointerMoveTolerance = newValue;

	            return this;
	        }

	        return pointerMoveTolerance;
	    };

	    /*\
	     * interact.maxInteractions
	     [ method ]
	     **
	     * Returns or sets the maximum number of concurrent interactions allowed.
	     * By default only 1 interaction is allowed at a time (for backwards
	     * compatibility). To allow multiple interactions on the same Interactables
	     * and elements, you need to enable it in the draggable, resizable and
	     * gesturable `'max'` and `'maxPerElement'` options.
	     **
	     - newValue (number) #optional Any number. newValue <= 0 means no interactions.
	    \*/
	    interact.maxInteractions = function (newValue) {
	        if (isNumber(newValue)) {
	            maxInteractions = newValue;

	            return this;
	        }

	        return maxInteractions;
	    };

	    interact.createSnapGrid = function (grid) {
	        return function (x, y) {
	            var offsetX = 0,
	                offsetY = 0;

	            if (isObject(grid.offset)) {
	                offsetX = grid.offset.x;
	                offsetY = grid.offset.y;
	            }

	            var gridx = Math.round((x - offsetX) / grid.x),
	                gridy = Math.round((y - offsetY) / grid.y),

	                newX = gridx * grid.x + offsetX,
	                newY = gridy * grid.y + offsetY;

	            return {
	                x: newX,
	                y: newY,
	                range: grid.range
	            };
	        };
	    };

	    function endAllInteractions (event) {
	        for (var i = 0; i < interactions.length; i++) {
	            interactions[i].pointerEnd(event, event);
	        }
	    }

	    function listenToDocument (doc) {
	        if (contains(documents, doc)) { return; }

	        var win = doc.defaultView || doc.parentWindow;

	        // add delegate event listener
	        for (var eventType in delegatedEvents) {
	            events.add(doc, eventType, delegateListener);
	            events.add(doc, eventType, delegateUseCapture, true);
	        }

	        if (PointerEvent) {
	            if (PointerEvent === win.MSPointerEvent) {
	                pEventTypes = {
	                    up: 'MSPointerUp', down: 'MSPointerDown', over: 'mouseover',
	                    out: 'mouseout', move: 'MSPointerMove', cancel: 'MSPointerCancel' };
	            }
	            else {
	                pEventTypes = {
	                    up: 'pointerup', down: 'pointerdown', over: 'pointerover',
	                    out: 'pointerout', move: 'pointermove', cancel: 'pointercancel' };
	            }

	            events.add(doc, pEventTypes.down  , listeners.selectorDown );
	            events.add(doc, pEventTypes.move  , listeners.pointerMove  );
	            events.add(doc, pEventTypes.over  , listeners.pointerOver  );
	            events.add(doc, pEventTypes.out   , listeners.pointerOut   );
	            events.add(doc, pEventTypes.up    , listeners.pointerUp    );
	            events.add(doc, pEventTypes.cancel, listeners.pointerCancel);

	            // autoscroll
	            events.add(doc, pEventTypes.move, listeners.autoScrollMove);
	        }
	        else {
	            events.add(doc, 'mousedown', listeners.selectorDown);
	            events.add(doc, 'mousemove', listeners.pointerMove );
	            events.add(doc, 'mouseup'  , listeners.pointerUp   );
	            events.add(doc, 'mouseover', listeners.pointerOver );
	            events.add(doc, 'mouseout' , listeners.pointerOut  );

	            events.add(doc, 'touchstart' , listeners.selectorDown );
	            events.add(doc, 'touchmove'  , listeners.pointerMove  );
	            events.add(doc, 'touchend'   , listeners.pointerUp    );
	            events.add(doc, 'touchcancel', listeners.pointerCancel);

	            // autoscroll
	            events.add(doc, 'mousemove', listeners.autoScrollMove);
	            events.add(doc, 'touchmove', listeners.autoScrollMove);
	        }

	        events.add(win, 'blur', endAllInteractions);

	        try {
	            if (win.frameElement) {
	                var parentDoc = win.frameElement.ownerDocument,
	                    parentWindow = parentDoc.defaultView;

	                events.add(parentDoc   , 'mouseup'      , listeners.pointerEnd);
	                events.add(parentDoc   , 'touchend'     , listeners.pointerEnd);
	                events.add(parentDoc   , 'touchcancel'  , listeners.pointerEnd);
	                events.add(parentDoc   , 'pointerup'    , listeners.pointerEnd);
	                events.add(parentDoc   , 'MSPointerUp'  , listeners.pointerEnd);
	                events.add(parentWindow, 'blur'         , endAllInteractions );
	            }
	        }
	        catch (error) {
	            interact.windowParentError = error;
	        }

	        // prevent native HTML5 drag on interact.js target elements
	        events.add(doc, 'dragstart', function (event) {
	            for (var i = 0; i < interactions.length; i++) {
	                var interaction = interactions[i];

	                if (interaction.element
	                    && (interaction.element === event.target
	                        || nodeContains(interaction.element, event.target))) {

	                    interaction.checkAndPreventDefault(event, interaction.target, interaction.element);
	                    return;
	                }
	            }
	        });

	        if (events.useAttachEvent) {
	            // For IE's lack of Event#preventDefault
	            events.add(doc, 'selectstart', function (event) {
	                var interaction = interactions[0];

	                if (interaction.currentAction()) {
	                    interaction.checkAndPreventDefault(event);
	                }
	            });

	            // For IE's bad dblclick event sequence
	            events.add(doc, 'dblclick', doOnInteractions('ie8Dblclick'));
	        }

	        documents.push(doc);
	    }

	    listenToDocument(document);

	    function indexOf (array, target) {
	        for (var i = 0, len = array.length; i < len; i++) {
	            if (array[i] === target) {
	                return i;
	            }
	        }

	        return -1;
	    }

	    function contains (array, target) {
	        return indexOf(array, target) !== -1;
	    }

	    function matchesSelector (element, selector, nodeList) {
	        if (ie8MatchesSelector) {
	            return ie8MatchesSelector(element, selector, nodeList);
	        }

	        // remove /deep/ from selectors if shadowDOM polyfill is used
	        if (window !== realWindow) {
	            selector = selector.replace(/\/deep\//g, ' ');
	        }

	        return element[prefixedMatchesSelector](selector);
	    }

	    function matchesUpTo (element, selector, limit) {
	        while (isElement(element)) {
	            if (matchesSelector(element, selector)) {
	                return true;
	            }

	            element = parentElement(element);

	            if (element === limit) {
	                return matchesSelector(element, selector);
	            }
	        }

	        return false;
	    }

	    // For IE8's lack of an Element#matchesSelector
	    // taken from http://tanalin.com/en/blog/2012/12/matches-selector-ie8/ and modified
	    if (!(prefixedMatchesSelector in Element.prototype) || !isFunction(Element.prototype[prefixedMatchesSelector])) {
	        ie8MatchesSelector = function (element, selector, elems) {
	            elems = elems || element.parentNode.querySelectorAll(selector);

	            for (var i = 0, len = elems.length; i < len; i++) {
	                if (elems[i] === element) {
	                    return true;
	                }
	            }

	            return false;
	        };
	    }

	    // requestAnimationFrame polyfill
	    (function() {
	        var lastTime = 0,
	            vendors = ['ms', 'moz', 'webkit', 'o'];

	        for(var x = 0; x < vendors.length && !realWindow.requestAnimationFrame; ++x) {
	            reqFrame = realWindow[vendors[x]+'RequestAnimationFrame'];
	            cancelFrame = realWindow[vendors[x]+'CancelAnimationFrame'] || realWindow[vendors[x]+'CancelRequestAnimationFrame'];
	        }

	        if (!reqFrame) {
	            reqFrame = function(callback) {
	                var currTime = new Date().getTime(),
	                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
	                    id = setTimeout(function() { callback(currTime + timeToCall); },
	                  timeToCall);
	                lastTime = currTime + timeToCall;
	                return id;
	            };
	        }

	        if (!cancelFrame) {
	            cancelFrame = function(id) {
	                clearTimeout(id);
	            };
	        }
	    }());

	    /* global exports: true, module, define */

	    // http://documentcloud.github.io/underscore/docs/underscore.html#section-11
	    if (true) {
	        if (typeof module !== 'undefined' && module.exports) {
	            exports = module.exports = interact;
	        }
	        exports.interact = interact;
	    }
	    // AMD
	    else if (typeof define === 'function' && define.amd) {
	        define('interact', function() {
	            return interact;
	        });
	    }
	    else {
	        realWindow.interact = interact;
	    }

	} (typeof window === 'undefined'? undefined : window));


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * VERSION: 1.19.0
	 * DATE: 2016-07-14
	 * UPDATES AND DOCS AT: http://greensock.com
	 * 
	 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin, BezierPlugin, AttrPlugin, DirectionalRotationPlugin
	 *
	 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
	 * This work is subject to the terms at http://greensock.com/standard-license or for
	 * Club GreenSock members, the software agreement that was issued with your membership.
	 * 
	 * @author: Jack Doyle, jack@greensock.com
	 **/
	var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("TweenMax",["core.Animation","core.SimpleTimeline","TweenLite"],function(a,b,c){var d=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},e=function(a,b,c){var d,e,f=a.cycle;for(d in f)e=f[d],a[d]="function"==typeof e?e(c,b[c]):e[c%e.length];delete a.cycle},f=function(a,b,d){c.call(this,a,b,d),this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._dirty=!0,this.render=f.prototype.render},g=1e-10,h=c._internals,i=h.isSelector,j=h.isArray,k=f.prototype=c.to({},.1,{}),l=[];f.version="1.19.0",k.constructor=f,k.kill()._gc=!1,f.killTweensOf=f.killDelayedCallsTo=c.killTweensOf,f.getTweensOf=c.getTweensOf,f.lagSmoothing=c.lagSmoothing,f.ticker=c.ticker,f.render=c.render,k.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),c.prototype.invalidate.call(this)},k.updateTo=function(a,b){var d,e=this.ratio,f=this.vars.immediateRender||a.immediateRender;b&&this._startTime<this._timeline._time&&(this._startTime=this._timeline._time,this._uncache(!1),this._gc?this._enabled(!0,!1):this._timeline.insert(this,this._startTime-this._delay));for(d in a)this.vars[d]=a[d];if(this._initted||f)if(b)this._initted=!1,f&&this.render(0,!0,!0);else if(this._gc&&this._enabled(!0,!1),this._notifyPluginsOfEnabled&&this._firstPT&&c._onPluginEvent("_onDisable",this),this._time/this._duration>.998){var g=this._totalTime;this.render(0,!0,!1),this._initted=!1,this.render(g,!0,!1)}else if(this._initted=!1,this._init(),this._time>0||f)for(var h,i=1/(1-e),j=this._firstPT;j;)h=j.s+j.c,j.c*=i,j.s=h-j.c,j=j._next;return this},k.render=function(a,b,c){this._initted||0===this._duration&&this.vars.repeat&&this.invalidate();var d,e,f,i,j,k,l,m,n=this._dirty?this.totalDuration():this._totalDuration,o=this._time,p=this._totalTime,q=this._cycle,r=this._duration,s=this._rawPrevTime;if(a>=n-1e-7?(this._totalTime=n,this._cycle=this._repeat,this._yoyo&&0!==(1&this._cycle)?(this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0):(this._time=r,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1),this._reversed||(d=!0,e="onComplete",c=c||this._timeline.autoRemoveChildren),0===r&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0),(0>s||0>=a&&a>=-1e-7||s===g&&"isPause"!==this.data)&&s!==a&&(c=!0,s>g&&(e="onReverseComplete")),this._rawPrevTime=m=!b||a||s===a?a:g)):1e-7>a?(this._totalTime=this._time=this._cycle=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==p||0===r&&s>0)&&(e="onReverseComplete",d=this._reversed),0>a&&(this._active=!1,0===r&&(this._initted||!this.vars.lazy||c)&&(s>=0&&(c=!0),this._rawPrevTime=m=!b||a||s===a?a:g)),this._initted||(c=!0)):(this._totalTime=this._time=a,0!==this._repeat&&(i=r+this._repeatDelay,this._cycle=this._totalTime/i>>0,0!==this._cycle&&this._cycle===this._totalTime/i&&a>=p&&this._cycle--,this._time=this._totalTime-this._cycle*i,this._yoyo&&0!==(1&this._cycle)&&(this._time=r-this._time),this._time>r?this._time=r:this._time<0&&(this._time=0)),this._easeType?(j=this._time/r,k=this._easeType,l=this._easePower,(1===k||3===k&&j>=.5)&&(j=1-j),3===k&&(j*=2),1===l?j*=j:2===l?j*=j*j:3===l?j*=j*j*j:4===l&&(j*=j*j*j*j),1===k?this.ratio=1-j:2===k?this.ratio=j:this._time/r<.5?this.ratio=j/2:this.ratio=1-j/2):this.ratio=this._ease.getRatio(this._time/r)),o===this._time&&!c&&q===this._cycle)return void(p!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=o,this._totalTime=p,this._rawPrevTime=s,this._cycle=q,h.lazyTweens.push(this),void(this._lazy=[a,b]);this._time&&!d?this.ratio=this._ease.getRatio(this._time/r):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==o&&a>=0&&(this._active=!0),0===p&&(2===this._initted&&a>0&&this._init(),this._startAt&&(a>=0?this._startAt.render(a,b,c):e||(e="_dummyGS")),this.vars.onStart&&(0!==this._totalTime||0===r)&&(b||this._callback("onStart"))),f=this._firstPT;f;)f.f?f.t[f.p](f.c*this.ratio+f.s):f.t[f.p]=f.c*this.ratio+f.s,f=f._next;this._onUpdate&&(0>a&&this._startAt&&this._startTime&&this._startAt.render(a,b,c),b||(this._totalTime!==p||e)&&this._callback("onUpdate")),this._cycle!==q&&(b||this._gc||this.vars.onRepeat&&this._callback("onRepeat")),e&&(!this._gc||c)&&(0>a&&this._startAt&&!this._onUpdate&&this._startTime&&this._startAt.render(a,b,c),d&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[e]&&this._callback(e),0===r&&this._rawPrevTime===g&&m!==g&&(this._rawPrevTime=0))},f.to=function(a,b,c){return new f(a,b,c)},f.from=function(a,b,c){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,new f(a,b,c)},f.fromTo=function(a,b,c,d){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,new f(a,b,d)},f.staggerTo=f.allTo=function(a,b,g,h,k,m,n){h=h||0;var o,p,q,r,s=0,t=[],u=function(){g.onComplete&&g.onComplete.apply(g.onCompleteScope||this,arguments),k.apply(n||g.callbackScope||this,m||l)},v=g.cycle,w=g.startAt&&g.startAt.cycle;for(j(a)||("string"==typeof a&&(a=c.selector(a)||a),i(a)&&(a=d(a))),a=a||[],0>h&&(a=d(a),a.reverse(),h*=-1),o=a.length-1,q=0;o>=q;q++){p={};for(r in g)p[r]=g[r];if(v&&(e(p,a,q),null!=p.duration&&(b=p.duration,delete p.duration)),w){w=p.startAt={};for(r in g.startAt)w[r]=g.startAt[r];e(p.startAt,a,q)}p.delay=s+(p.delay||0),q===o&&k&&(p.onComplete=u),t[q]=new f(a[q],b,p),s+=h}return t},f.staggerFrom=f.allFrom=function(a,b,c,d,e,g,h){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,f.staggerTo(a,b,c,d,e,g,h)},f.staggerFromTo=f.allFromTo=function(a,b,c,d,e,g,h,i){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,f.staggerTo(a,b,d,e,g,h,i)},f.delayedCall=function(a,b,c,d,e){return new f(b,0,{delay:a,onComplete:b,onCompleteParams:c,callbackScope:d,onReverseComplete:b,onReverseCompleteParams:c,immediateRender:!1,useFrames:e,overwrite:0})},f.set=function(a,b){return new f(a,0,b)},f.isTweening=function(a){return c.getTweensOf(a,!0).length>0};var m=function(a,b){for(var d=[],e=0,f=a._first;f;)f instanceof c?d[e++]=f:(b&&(d[e++]=f),d=d.concat(m(f,b)),e=d.length),f=f._next;return d},n=f.getAllTweens=function(b){return m(a._rootTimeline,b).concat(m(a._rootFramesTimeline,b))};f.killAll=function(a,c,d,e){null==c&&(c=!0),null==d&&(d=!0);var f,g,h,i=n(0!=e),j=i.length,k=c&&d&&e;for(h=0;j>h;h++)g=i[h],(k||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&(a?g.totalTime(g._reversed?0:g.totalDuration()):g._enabled(!1,!1))},f.killChildTweensOf=function(a,b){if(null!=a){var e,g,k,l,m,n=h.tweenLookup;if("string"==typeof a&&(a=c.selector(a)||a),i(a)&&(a=d(a)),j(a))for(l=a.length;--l>-1;)f.killChildTweensOf(a[l],b);else{e=[];for(k in n)for(g=n[k].target.parentNode;g;)g===a&&(e=e.concat(n[k].tweens)),g=g.parentNode;for(m=e.length,l=0;m>l;l++)b&&e[l].totalTime(e[l].totalDuration()),e[l]._enabled(!1,!1)}}};var o=function(a,c,d,e){c=c!==!1,d=d!==!1,e=e!==!1;for(var f,g,h=n(e),i=c&&d&&e,j=h.length;--j>-1;)g=h[j],(i||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&g.paused(a)};return f.pauseAll=function(a,b,c){o(!0,a,b,c)},f.resumeAll=function(a,b,c){o(!1,a,b,c)},f.globalTimeScale=function(b){var d=a._rootTimeline,e=c.ticker.time;return arguments.length?(b=b||g,d._startTime=e-(e-d._startTime)*d._timeScale/b,d=a._rootFramesTimeline,e=c.ticker.frame,d._startTime=e-(e-d._startTime)*d._timeScale/b,d._timeScale=a._rootTimeline._timeScale=b,b):d._timeScale},k.progress=function(a,b){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),b):this._time/this.duration()},k.totalProgress=function(a,b){return arguments.length?this.totalTime(this.totalDuration()*a,b):this._totalTime/this.totalDuration()},k.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),a>this._duration&&(a=this._duration),this._yoyo&&0!==(1&this._cycle)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(a,b)):this._time},k.duration=function(b){return arguments.length?a.prototype.duration.call(this,b):this._duration},k.totalDuration=function(a){return arguments.length?-1===this._repeat?this:this.duration((a-this._repeat*this._repeatDelay)/(this._repeat+1)):(this._dirty&&(this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat,this._dirty=!1),this._totalDuration)},k.repeat=function(a){return arguments.length?(this._repeat=a,this._uncache(!0)):this._repeat},k.repeatDelay=function(a){return arguments.length?(this._repeatDelay=a,this._uncache(!0)):this._repeatDelay},k.yoyo=function(a){return arguments.length?(this._yoyo=a,this):this._yoyo},f},!0),_gsScope._gsDefine("TimelineLite",["core.Animation","core.SimpleTimeline","TweenLite"],function(a,b,c){var d=function(a){b.call(this,a),this._labels={},this.autoRemoveChildren=this.vars.autoRemoveChildren===!0,this.smoothChildTiming=this.vars.smoothChildTiming===!0,this._sortChildren=!0,this._onUpdate=this.vars.onUpdate;var c,d,e=this.vars;for(d in e)c=e[d],i(c)&&-1!==c.join("").indexOf("{self}")&&(e[d]=this._swapSelfInParams(c));i(e.tweens)&&this.add(e.tweens,0,e.align,e.stagger)},e=1e-10,f=c._internals,g=d._internals={},h=f.isSelector,i=f.isArray,j=f.lazyTweens,k=f.lazyRender,l=_gsScope._gsDefine.globals,m=function(a){var b,c={};for(b in a)c[b]=a[b];return c},n=function(a,b,c){var d,e,f=a.cycle;for(d in f)e=f[d],a[d]="function"==typeof e?e.call(b[c],c):e[c%e.length];delete a.cycle},o=g.pauseCallback=function(){},p=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},q=d.prototype=new b;return d.version="1.19.0",q.constructor=d,q.kill()._gc=q._forcingPlayhead=q._hasPause=!1,q.to=function(a,b,d,e){var f=d.repeat&&l.TweenMax||c;return b?this.add(new f(a,b,d),e):this.set(a,d,e)},q.from=function(a,b,d,e){return this.add((d.repeat&&l.TweenMax||c).from(a,b,d),e)},q.fromTo=function(a,b,d,e,f){var g=e.repeat&&l.TweenMax||c;return b?this.add(g.fromTo(a,b,d,e),f):this.set(a,e,f)},q.staggerTo=function(a,b,e,f,g,i,j,k){var l,o,q=new d({onComplete:i,onCompleteParams:j,callbackScope:k,smoothChildTiming:this.smoothChildTiming}),r=e.cycle;for("string"==typeof a&&(a=c.selector(a)||a),a=a||[],h(a)&&(a=p(a)),f=f||0,0>f&&(a=p(a),a.reverse(),f*=-1),o=0;o<a.length;o++)l=m(e),l.startAt&&(l.startAt=m(l.startAt),l.startAt.cycle&&n(l.startAt,a,o)),r&&(n(l,a,o),null!=l.duration&&(b=l.duration,delete l.duration)),q.to(a[o],b,l,o*f);return this.add(q,g)},q.staggerFrom=function(a,b,c,d,e,f,g,h){return c.immediateRender=0!=c.immediateRender,c.runBackwards=!0,this.staggerTo(a,b,c,d,e,f,g,h)},q.staggerFromTo=function(a,b,c,d,e,f,g,h,i){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,this.staggerTo(a,b,d,e,f,g,h,i)},q.call=function(a,b,d,e){return this.add(c.delayedCall(0,a,b,d),e)},q.set=function(a,b,d){return d=this._parseTimeOrLabel(d,0,!0),null==b.immediateRender&&(b.immediateRender=d===this._time&&!this._paused),this.add(new c(a,0,b),d)},d.exportRoot=function(a,b){a=a||{},null==a.smoothChildTiming&&(a.smoothChildTiming=!0);var e,f,g=new d(a),h=g._timeline;for(null==b&&(b=!0),h._remove(g,!0),g._startTime=0,g._rawPrevTime=g._time=g._totalTime=h._time,e=h._first;e;)f=e._next,b&&e instanceof c&&e.target===e.vars.onComplete||g.add(e,e._startTime-e._delay),e=f;return h.add(g,0),g},q.add=function(e,f,g,h){var j,k,l,m,n,o;if("number"!=typeof f&&(f=this._parseTimeOrLabel(f,0,!0,e)),!(e instanceof a)){if(e instanceof Array||e&&e.push&&i(e)){for(g=g||"normal",h=h||0,j=f,k=e.length,l=0;k>l;l++)i(m=e[l])&&(m=new d({tweens:m})),this.add(m,j),"string"!=typeof m&&"function"!=typeof m&&("sequence"===g?j=m._startTime+m.totalDuration()/m._timeScale:"start"===g&&(m._startTime-=m.delay())),j+=h;return this._uncache(!0)}if("string"==typeof e)return this.addLabel(e,f);if("function"!=typeof e)throw"Cannot add "+e+" into the timeline; it is not a tween, timeline, function, or string.";e=c.delayedCall(0,e)}if(b.prototype.add.call(this,e,f),(this._gc||this._time===this._duration)&&!this._paused&&this._duration<this.duration())for(n=this,o=n.rawTime()>e._startTime;n._timeline;)o&&n._timeline.smoothChildTiming?n.totalTime(n._totalTime,!0):n._gc&&n._enabled(!0,!1),n=n._timeline;return this},q.remove=function(b){if(b instanceof a){this._remove(b,!1);var c=b._timeline=b.vars.useFrames?a._rootFramesTimeline:a._rootTimeline;return b._startTime=(b._paused?b._pauseTime:c._time)-(b._reversed?b.totalDuration()-b._totalTime:b._totalTime)/b._timeScale,this}if(b instanceof Array||b&&b.push&&i(b)){for(var d=b.length;--d>-1;)this.remove(b[d]);return this}return"string"==typeof b?this.removeLabel(b):this.kill(null,b)},q._remove=function(a,c){b.prototype._remove.call(this,a,c);var d=this._last;return d?this._time>d._startTime+d._totalDuration/d._timeScale&&(this._time=this.duration(),this._totalTime=this._totalDuration):this._time=this._totalTime=this._duration=this._totalDuration=0,this},q.append=function(a,b){return this.add(a,this._parseTimeOrLabel(null,b,!0,a))},q.insert=q.insertMultiple=function(a,b,c,d){return this.add(a,b||0,c,d)},q.appendMultiple=function(a,b,c,d){return this.add(a,this._parseTimeOrLabel(null,b,!0,a),c,d)},q.addLabel=function(a,b){return this._labels[a]=this._parseTimeOrLabel(b),this},q.addPause=function(a,b,d,e){var f=c.delayedCall(0,o,d,e||this);return f.vars.onComplete=f.vars.onReverseComplete=b,f.data="isPause",this._hasPause=!0,this.add(f,a)},q.removeLabel=function(a){return delete this._labels[a],this},q.getLabelTime=function(a){return null!=this._labels[a]?this._labels[a]:-1},q._parseTimeOrLabel=function(b,c,d,e){var f;if(e instanceof a&&e.timeline===this)this.remove(e);else if(e&&(e instanceof Array||e.push&&i(e)))for(f=e.length;--f>-1;)e[f]instanceof a&&e[f].timeline===this&&this.remove(e[f]);if("string"==typeof c)return this._parseTimeOrLabel(c,d&&"number"==typeof b&&null==this._labels[c]?b-this.duration():0,d);if(c=c||0,"string"!=typeof b||!isNaN(b)&&null==this._labels[b])null==b&&(b=this.duration());else{if(f=b.indexOf("="),-1===f)return null==this._labels[b]?d?this._labels[b]=this.duration()+c:c:this._labels[b]+c;c=parseInt(b.charAt(f-1)+"1",10)*Number(b.substr(f+1)),b=f>1?this._parseTimeOrLabel(b.substr(0,f-1),0,d):this.duration()}return Number(b)+c},q.seek=function(a,b){return this.totalTime("number"==typeof a?a:this._parseTimeOrLabel(a),b!==!1)},q.stop=function(){return this.paused(!0)},q.gotoAndPlay=function(a,b){return this.play(a,b)},q.gotoAndStop=function(a,b){return this.pause(a,b)},q.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,g,h,i,l,m,n=this._dirty?this.totalDuration():this._totalDuration,o=this._time,p=this._startTime,q=this._timeScale,r=this._paused;if(a>=n-1e-7)this._totalTime=this._time=n,this._reversed||this._hasPausedChild()||(f=!0,h="onComplete",i=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||this._rawPrevTime<0||this._rawPrevTime===e)&&this._rawPrevTime!==a&&this._first&&(i=!0,this._rawPrevTime>e&&(h="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,a=n+1e-4;else if(1e-7>a)if(this._totalTime=this._time=0,(0!==o||0===this._duration&&this._rawPrevTime!==e&&(this._rawPrevTime>0||0>a&&this._rawPrevTime>=0))&&(h="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(i=f=!0,h="onReverseComplete"):this._rawPrevTime>=0&&this._first&&(i=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(i=!0)}else{if(this._hasPause&&!this._forcingPlayhead&&!b){if(a>=o)for(d=this._first;d&&d._startTime<=a&&!l;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(l=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!l;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(l=d),d=d._prev;l&&(this._time=a=l._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}this._totalTime=this._time=this._rawPrevTime=a}if(this._time!==o&&this._first||c||i||l){if(this._initted||(this._initted=!0),this._active||!this._paused&&this._time!==o&&a>0&&(this._active=!0),0===o&&this.vars.onStart&&(0===this._time&&this._duration||b||this._callback("onStart")),m=this._time,m>=o)for(d=this._first;d&&(g=d._next,m===this._time&&(!this._paused||r));)(d._active||d._startTime<=m&&!d._paused&&!d._gc)&&(l===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=g;else for(d=this._last;d&&(g=d._prev,m===this._time&&(!this._paused||r));){if(d._active||d._startTime<=o&&!d._paused&&!d._gc){if(l===d){for(l=d._prev;l&&l.endTime()>this._time;)l.render(l._reversed?l.totalDuration()-(a-l._startTime)*l._timeScale:(a-l._startTime)*l._timeScale,b,c),l=l._prev;l=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=g}this._onUpdate&&(b||(j.length&&k(),this._callback("onUpdate"))),h&&(this._gc||(p===this._startTime||q!==this._timeScale)&&(0===this._time||n>=this.totalDuration())&&(f&&(j.length&&k(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[h]&&this._callback(h)))}},q._hasPausedChild=function(){for(var a=this._first;a;){if(a._paused||a instanceof d&&a._hasPausedChild())return!0;a=a._next}return!1},q.getChildren=function(a,b,d,e){e=e||-9999999999;for(var f=[],g=this._first,h=0;g;)g._startTime<e||(g instanceof c?b!==!1&&(f[h++]=g):(d!==!1&&(f[h++]=g),a!==!1&&(f=f.concat(g.getChildren(!0,b,d)),h=f.length))),g=g._next;return f},q.getTweensOf=function(a,b){var d,e,f=this._gc,g=[],h=0;for(f&&this._enabled(!0,!0),d=c.getTweensOf(a),e=d.length;--e>-1;)(d[e].timeline===this||b&&this._contains(d[e]))&&(g[h++]=d[e]);return f&&this._enabled(!1,!0),g},q.recent=function(){return this._recent},q._contains=function(a){for(var b=a.timeline;b;){if(b===this)return!0;b=b.timeline}return!1},q.shiftChildren=function(a,b,c){c=c||0;for(var d,e=this._first,f=this._labels;e;)e._startTime>=c&&(e._startTime+=a),e=e._next;if(b)for(d in f)f[d]>=c&&(f[d]+=a);return this._uncache(!0)},q._kill=function(a,b){if(!a&&!b)return this._enabled(!1,!1);for(var c=b?this.getTweensOf(b):this.getChildren(!0,!0,!1),d=c.length,e=!1;--d>-1;)c[d]._kill(a,b)&&(e=!0);return e},q.clear=function(a){var b=this.getChildren(!1,!0,!0),c=b.length;for(this._time=this._totalTime=0;--c>-1;)b[c]._enabled(!1,!1);return a!==!1&&(this._labels={}),this._uncache(!0)},q.invalidate=function(){for(var b=this._first;b;)b.invalidate(),b=b._next;return a.prototype.invalidate.call(this)},q._enabled=function(a,c){if(a===this._gc)for(var d=this._first;d;)d._enabled(a,!0),d=d._next;return b.prototype._enabled.call(this,a,c)},q.totalTime=function(b,c,d){this._forcingPlayhead=!0;var e=a.prototype.totalTime.apply(this,arguments);return this._forcingPlayhead=!1,e},q.duration=function(a){return arguments.length?(0!==this.duration()&&0!==a&&this.timeScale(this._duration/a),this):(this._dirty&&this.totalDuration(),this._duration)},q.totalDuration=function(a){if(!arguments.length){if(this._dirty){for(var b,c,d=0,e=this._last,f=999999999999;e;)b=e._prev,e._dirty&&e.totalDuration(),e._startTime>f&&this._sortChildren&&!e._paused?this.add(e,e._startTime-e._delay):f=e._startTime,e._startTime<0&&!e._paused&&(d-=e._startTime,this._timeline.smoothChildTiming&&(this._startTime+=e._startTime/this._timeScale),this.shiftChildren(-e._startTime,!1,-9999999999),f=0),c=e._startTime+e._totalDuration/e._timeScale,c>d&&(d=c),e=b;this._duration=this._totalDuration=d,this._dirty=!1}return this._totalDuration}return a&&this.totalDuration()?this.timeScale(this._totalDuration/a):this},q.paused=function(b){if(!b)for(var c=this._first,d=this._time;c;)c._startTime===d&&"isPause"===c.data&&(c._rawPrevTime=0),c=c._next;return a.prototype.paused.apply(this,arguments)},q.usesFrames=function(){for(var b=this._timeline;b._timeline;)b=b._timeline;return b===a._rootFramesTimeline},q.rawTime=function(){return this._paused?this._totalTime:(this._timeline.rawTime()-this._startTime)*this._timeScale},d},!0),_gsScope._gsDefine("TimelineMax",["TimelineLite","TweenLite","easing.Ease"],function(a,b,c){var d=function(b){a.call(this,b),this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._dirty=!0},e=1e-10,f=b._internals,g=f.lazyTweens,h=f.lazyRender,i=_gsScope._gsDefine.globals,j=new c(null,null,1,0),k=d.prototype=new a;return k.constructor=d,k.kill()._gc=!1,d.version="1.19.0",k.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),a.prototype.invalidate.call(this)},k.addCallback=function(a,c,d,e){return this.add(b.delayedCall(0,a,d,e),c)},k.removeCallback=function(a,b){if(a)if(null==b)this._kill(null,a);else for(var c=this.getTweensOf(a,!1),d=c.length,e=this._parseTimeOrLabel(b);--d>-1;)c[d]._startTime===e&&c[d]._enabled(!1,!1);return this},k.removePause=function(b){return this.removeCallback(a._internals.pauseCallback,b)},k.tweenTo=function(a,c){c=c||{};var d,e,f,g={ease:j,useFrames:this.usesFrames(),immediateRender:!1},h=c.repeat&&i.TweenMax||b;for(e in c)g[e]=c[e];return g.time=this._parseTimeOrLabel(a),d=Math.abs(Number(g.time)-this._time)/this._timeScale||.001,f=new h(this,d,g),g.onStart=function(){f.target.paused(!0),f.vars.time!==f.target.time()&&d===f.duration()&&f.duration(Math.abs(f.vars.time-f.target.time())/f.target._timeScale),c.onStart&&f._callback("onStart")},f},k.tweenFromTo=function(a,b,c){c=c||{},a=this._parseTimeOrLabel(a),c.startAt={onComplete:this.seek,onCompleteParams:[a],callbackScope:this},c.immediateRender=c.immediateRender!==!1;var d=this.tweenTo(b,c);return d.duration(Math.abs(d.vars.time-a)/this._timeScale||.001)},k.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,i,j,k,l,m,n,o=this._dirty?this.totalDuration():this._totalDuration,p=this._duration,q=this._time,r=this._totalTime,s=this._startTime,t=this._timeScale,u=this._rawPrevTime,v=this._paused,w=this._cycle;if(a>=o-1e-7)this._locked||(this._totalTime=o,this._cycle=this._repeat),this._reversed||this._hasPausedChild()||(f=!0,j="onComplete",k=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||0>u||u===e)&&u!==a&&this._first&&(k=!0,u>e&&(j="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,this._yoyo&&0!==(1&this._cycle)?this._time=a=0:(this._time=p,a=p+1e-4);else if(1e-7>a)if(this._locked||(this._totalTime=this._cycle=0),this._time=0,(0!==q||0===p&&u!==e&&(u>0||0>a&&u>=0)&&!this._locked)&&(j="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(k=f=!0,j="onReverseComplete"):u>=0&&this._first&&(k=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=p||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(k=!0)}else if(0===p&&0>u&&(k=!0),this._time=this._rawPrevTime=a,this._locked||(this._totalTime=a,0!==this._repeat&&(l=p+this._repeatDelay,this._cycle=this._totalTime/l>>0,0!==this._cycle&&this._cycle===this._totalTime/l&&a>=r&&this._cycle--,this._time=this._totalTime-this._cycle*l,this._yoyo&&0!==(1&this._cycle)&&(this._time=p-this._time),this._time>p?(this._time=p,a=p+1e-4):this._time<0?this._time=a=0:a=this._time)),this._hasPause&&!this._forcingPlayhead&&!b){if(a=this._time,a>=q)for(d=this._first;d&&d._startTime<=a&&!m;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(m=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!m;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(m=d),d=d._prev;m&&(this._time=a=m._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}if(this._cycle!==w&&!this._locked){var x=this._yoyo&&0!==(1&w),y=x===(this._yoyo&&0!==(1&this._cycle)),z=this._totalTime,A=this._cycle,B=this._rawPrevTime,C=this._time;if(this._totalTime=w*p,this._cycle<w?x=!x:this._totalTime+=p,this._time=q,this._rawPrevTime=0===p?u-1e-4:u,this._cycle=w,this._locked=!0,q=x?0:p,this.render(q,b,0===p),b||this._gc||this.vars.onRepeat&&this._callback("onRepeat"),q!==this._time)return;if(y&&(q=x?p+1e-4:-1e-4,this.render(q,!0,!1)),this._locked=!1,this._paused&&!v)return;this._time=C,this._totalTime=z,this._cycle=A,this._rawPrevTime=B}if(!(this._time!==q&&this._first||c||k||m))return void(r!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(this._initted||(this._initted=!0),this._active||!this._paused&&this._totalTime!==r&&a>0&&(this._active=!0),0===r&&this.vars.onStart&&(0===this._totalTime&&this._totalDuration||b||this._callback("onStart")),n=this._time,n>=q)for(d=this._first;d&&(i=d._next,n===this._time&&(!this._paused||v));)(d._active||d._startTime<=this._time&&!d._paused&&!d._gc)&&(m===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=i;else for(d=this._last;d&&(i=d._prev,n===this._time&&(!this._paused||v));){if(d._active||d._startTime<=q&&!d._paused&&!d._gc){if(m===d){for(m=d._prev;m&&m.endTime()>this._time;)m.render(m._reversed?m.totalDuration()-(a-m._startTime)*m._timeScale:(a-m._startTime)*m._timeScale,b,c),m=m._prev;m=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=i}this._onUpdate&&(b||(g.length&&h(),this._callback("onUpdate"))),j&&(this._locked||this._gc||(s===this._startTime||t!==this._timeScale)&&(0===this._time||o>=this.totalDuration())&&(f&&(g.length&&h(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[j]&&this._callback(j)))},k.getActive=function(a,b,c){null==a&&(a=!0),null==b&&(b=!0),null==c&&(c=!1);var d,e,f=[],g=this.getChildren(a,b,c),h=0,i=g.length;for(d=0;i>d;d++)e=g[d],e.isActive()&&(f[h++]=e);return f},k.getLabelAfter=function(a){a||0!==a&&(a=this._time);var b,c=this.getLabelsArray(),d=c.length;for(b=0;d>b;b++)if(c[b].time>a)return c[b].name;return null},k.getLabelBefore=function(a){null==a&&(a=this._time);for(var b=this.getLabelsArray(),c=b.length;--c>-1;)if(b[c].time<a)return b[c].name;return null},k.getLabelsArray=function(){var a,b=[],c=0;for(a in this._labels)b[c++]={time:this._labels[a],name:a};return b.sort(function(a,b){return a.time-b.time}),b},k.progress=function(a,b){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),b):this._time/this.duration()},k.totalProgress=function(a,b){return arguments.length?this.totalTime(this.totalDuration()*a,b):this._totalTime/this.totalDuration()},k.totalDuration=function(b){return arguments.length?-1!==this._repeat&&b?this.timeScale(this.totalDuration()/b):this:(this._dirty&&(a.prototype.totalDuration.call(this),this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat),this._totalDuration)},k.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),a>this._duration&&(a=this._duration),this._yoyo&&0!==(1&this._cycle)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(a,b)):this._time},k.repeat=function(a){return arguments.length?(this._repeat=a,this._uncache(!0)):this._repeat},k.repeatDelay=function(a){return arguments.length?(this._repeatDelay=a,this._uncache(!0)):this._repeatDelay},k.yoyo=function(a){return arguments.length?(this._yoyo=a,this):this._yoyo},k.currentLabel=function(a){return arguments.length?this.seek(a,!0):this.getLabelBefore(this._time+1e-8)},d},!0),function(){var a=180/Math.PI,b=[],c=[],d=[],e={},f=_gsScope._gsDefine.globals,g=function(a,b,c,d){c===d&&(c=d-(d-b)/1e6),a===b&&(b=a+(c-a)/1e6),this.a=a,this.b=b,this.c=c,this.d=d,this.da=d-a,this.ca=c-a,this.ba=b-a},h=",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",i=function(a,b,c,d){var e={a:a},f={},g={},h={c:d},i=(a+b)/2,j=(b+c)/2,k=(c+d)/2,l=(i+j)/2,m=(j+k)/2,n=(m-l)/8;return e.b=i+(a-i)/4,f.b=l+n,e.c=f.a=(e.b+f.b)/2,f.c=g.a=(l+m)/2,g.b=m-n,h.b=k+(d-k)/4,g.c=h.a=(g.b+h.b)/2,[e,f,g,h]},j=function(a,e,f,g,h){var j,k,l,m,n,o,p,q,r,s,t,u,v,w=a.length-1,x=0,y=a[0].a;for(j=0;w>j;j++)n=a[x],k=n.a,l=n.d,m=a[x+1].d,h?(t=b[j],u=c[j],v=(u+t)*e*.25/(g?.5:d[j]||.5),o=l-(l-k)*(g?.5*e:0!==t?v/t:0),p=l+(m-l)*(g?.5*e:0!==u?v/u:0),q=l-(o+((p-o)*(3*t/(t+u)+.5)/4||0))):(o=l-(l-k)*e*.5,p=l+(m-l)*e*.5,q=l-(o+p)/2),o+=q,p+=q,n.c=r=o,0!==j?n.b=y:n.b=y=n.a+.6*(n.c-n.a),n.da=l-k,n.ca=r-k,n.ba=y-k,f?(s=i(k,y,r,l),a.splice(x,1,s[0],s[1],s[2],s[3]),x+=4):x++,y=p;n=a[x],n.b=y,n.c=y+.4*(n.d-y),n.da=n.d-n.a,n.ca=n.c-n.a,n.ba=y-n.a,f&&(s=i(n.a,y,n.c,n.d),a.splice(x,1,s[0],s[1],s[2],s[3]))},k=function(a,d,e,f){var h,i,j,k,l,m,n=[];if(f)for(a=[f].concat(a),i=a.length;--i>-1;)"string"==typeof(m=a[i][d])&&"="===m.charAt(1)&&(a[i][d]=f[d]+Number(m.charAt(0)+m.substr(2)));if(h=a.length-2,0>h)return n[0]=new g(a[0][d],0,0,a[-1>h?0:1][d]),n;for(i=0;h>i;i++)j=a[i][d],k=a[i+1][d],n[i]=new g(j,0,0,k),e&&(l=a[i+2][d],b[i]=(b[i]||0)+(k-j)*(k-j),c[i]=(c[i]||0)+(l-k)*(l-k));return n[i]=new g(a[i][d],0,0,a[i+1][d]),n},l=function(a,f,g,i,l,m){var n,o,p,q,r,s,t,u,v={},w=[],x=m||a[0];l="string"==typeof l?","+l+",":h,null==f&&(f=1);for(o in a[0])w.push(o);if(a.length>1){for(u=a[a.length-1],t=!0,n=w.length;--n>-1;)if(o=w[n],Math.abs(x[o]-u[o])>.05){t=!1;break}t&&(a=a.concat(),m&&a.unshift(m),a.push(a[1]),m=a[a.length-3])}for(b.length=c.length=d.length=0,n=w.length;--n>-1;)o=w[n],e[o]=-1!==l.indexOf(","+o+","),v[o]=k(a,o,e[o],m);for(n=b.length;--n>-1;)b[n]=Math.sqrt(b[n]),c[n]=Math.sqrt(c[n]);if(!i){for(n=w.length;--n>-1;)if(e[o])for(p=v[w[n]],s=p.length-1,q=0;s>q;q++)r=p[q+1].da/c[q]+p[q].da/b[q]||0,d[q]=(d[q]||0)+r*r;for(n=d.length;--n>-1;)d[n]=Math.sqrt(d[n])}for(n=w.length,q=g?4:1;--n>-1;)o=w[n],p=v[o],j(p,f,g,i,e[o]),t&&(p.splice(0,q),p.splice(p.length-q,q));return v},m=function(a,b,c){b=b||"soft";var d,e,f,h,i,j,k,l,m,n,o,p={},q="cubic"===b?3:2,r="soft"===b,s=[];if(r&&c&&(a=[c].concat(a)),null==a||a.length<q+1)throw"invalid Bezier data";for(m in a[0])s.push(m);for(j=s.length;--j>-1;){for(m=s[j],p[m]=i=[],n=0,l=a.length,k=0;l>k;k++)d=null==c?a[k][m]:"string"==typeof(o=a[k][m])&&"="===o.charAt(1)?c[m]+Number(o.charAt(0)+o.substr(2)):Number(o),r&&k>1&&l-1>k&&(i[n++]=(d+i[n-2])/2),i[n++]=d;for(l=n-q+1,n=0,k=0;l>k;k+=q)d=i[k],e=i[k+1],f=i[k+2],h=2===q?0:i[k+3],i[n++]=o=3===q?new g(d,e,f,h):new g(d,(2*e+d)/3,(2*e+f)/3,f);i.length=n}return p},n=function(a,b,c){for(var d,e,f,g,h,i,j,k,l,m,n,o=1/c,p=a.length;--p>-1;)for(m=a[p],f=m.a,g=m.d-f,h=m.c-f,i=m.b-f,d=e=0,k=1;c>=k;k++)j=o*k,l=1-j,d=e-(e=(j*j*g+3*l*(j*h+l*i))*j),n=p*c+k-1,b[n]=(b[n]||0)+d*d},o=function(a,b){b=b>>0||6;var c,d,e,f,g=[],h=[],i=0,j=0,k=b-1,l=[],m=[];for(c in a)n(a[c],g,b);for(e=g.length,d=0;e>d;d++)i+=Math.sqrt(g[d]),f=d%b,m[f]=i,f===k&&(j+=i,f=d/b>>0,l[f]=m,h[f]=j,i=0,m=[]);return{length:j,lengths:h,
	segments:l}},p=_gsScope._gsDefine.plugin({propName:"bezier",priority:-1,version:"1.3.7",API:2,global:!0,init:function(a,b,c){this._target=a,b instanceof Array&&(b={values:b}),this._func={},this._mod={},this._props=[],this._timeRes=null==b.timeResolution?6:parseInt(b.timeResolution,10);var d,e,f,g,h,i=b.values||[],j={},k=i[0],n=b.autoRotate||c.vars.orientToBezier;this._autoRotate=n?n instanceof Array?n:[["x","y","rotation",n===!0?0:Number(n)||0]]:null;for(d in k)this._props.push(d);for(f=this._props.length;--f>-1;)d=this._props[f],this._overwriteProps.push(d),e=this._func[d]="function"==typeof a[d],j[d]=e?a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]():parseFloat(a[d]),h||j[d]!==i[0][d]&&(h=j);if(this._beziers="cubic"!==b.type&&"quadratic"!==b.type&&"soft"!==b.type?l(i,isNaN(b.curviness)?1:b.curviness,!1,"thruBasic"===b.type,b.correlate,h):m(i,b.type,j),this._segCount=this._beziers[d].length,this._timeRes){var p=o(this._beziers,this._timeRes);this._length=p.length,this._lengths=p.lengths,this._segments=p.segments,this._l1=this._li=this._s1=this._si=0,this._l2=this._lengths[0],this._curSeg=this._segments[0],this._s2=this._curSeg[0],this._prec=1/this._curSeg.length}if(n=this._autoRotate)for(this._initialRotations=[],n[0]instanceof Array||(this._autoRotate=n=[n]),f=n.length;--f>-1;){for(g=0;3>g;g++)d=n[f][g],this._func[d]="function"==typeof a[d]?a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]:!1;d=n[f][2],this._initialRotations[f]=(this._func[d]?this._func[d].call(this._target):this._target[d])||0,this._overwriteProps.push(d)}return this._startRatio=c.vars.runBackwards?1:0,!0},set:function(b){var c,d,e,f,g,h,i,j,k,l,m=this._segCount,n=this._func,o=this._target,p=b!==this._startRatio;if(this._timeRes){if(k=this._lengths,l=this._curSeg,b*=this._length,e=this._li,b>this._l2&&m-1>e){for(j=m-1;j>e&&(this._l2=k[++e])<=b;);this._l1=k[e-1],this._li=e,this._curSeg=l=this._segments[e],this._s2=l[this._s1=this._si=0]}else if(b<this._l1&&e>0){for(;e>0&&(this._l1=k[--e])>=b;);0===e&&b<this._l1?this._l1=0:e++,this._l2=k[e],this._li=e,this._curSeg=l=this._segments[e],this._s1=l[(this._si=l.length-1)-1]||0,this._s2=l[this._si]}if(c=e,b-=this._l1,e=this._si,b>this._s2&&e<l.length-1){for(j=l.length-1;j>e&&(this._s2=l[++e])<=b;);this._s1=l[e-1],this._si=e}else if(b<this._s1&&e>0){for(;e>0&&(this._s1=l[--e])>=b;);0===e&&b<this._s1?this._s1=0:e++,this._s2=l[e],this._si=e}h=(e+(b-this._s1)/(this._s2-this._s1))*this._prec||0}else c=0>b?0:b>=1?m-1:m*b>>0,h=(b-c*(1/m))*m;for(d=1-h,e=this._props.length;--e>-1;)f=this._props[e],g=this._beziers[f][c],i=(h*h*g.da+3*d*(h*g.ca+d*g.ba))*h+g.a,this._mod[f]&&(i=this._mod[f](i,o)),n[f]?o[f](i):o[f]=i;if(this._autoRotate){var q,r,s,t,u,v,w,x=this._autoRotate;for(e=x.length;--e>-1;)f=x[e][2],v=x[e][3]||0,w=x[e][4]===!0?1:a,g=this._beziers[x[e][0]],q=this._beziers[x[e][1]],g&&q&&(g=g[c],q=q[c],r=g.a+(g.b-g.a)*h,t=g.b+(g.c-g.b)*h,r+=(t-r)*h,t+=(g.c+(g.d-g.c)*h-t)*h,s=q.a+(q.b-q.a)*h,u=q.b+(q.c-q.b)*h,s+=(u-s)*h,u+=(q.c+(q.d-q.c)*h-u)*h,i=p?Math.atan2(u-s,t-r)*w+v:this._initialRotations[e],this._mod[f]&&(i=this._mod[f](i,o)),n[f]?o[f](i):o[f]=i)}}}),q=p.prototype;p.bezierThrough=l,p.cubicToQuadratic=i,p._autoCSS=!0,p.quadraticToCubic=function(a,b,c){return new g(a,(2*b+a)/3,(2*b+c)/3,c)},p._cssRegister=function(){var a=f.CSSPlugin;if(a){var b=a._internals,c=b._parseToProxy,d=b._setPluginRatio,e=b.CSSPropTween;b._registerComplexSpecialProp("bezier",{parser:function(a,b,f,g,h,i){b instanceof Array&&(b={values:b}),i=new p;var j,k,l,m=b.values,n=m.length-1,o=[],q={};if(0>n)return h;for(j=0;n>=j;j++)l=c(a,m[j],g,h,i,n!==j),o[j]=l.end;for(k in b)q[k]=b[k];return q.values=o,h=new e(a,"bezier",0,0,l.pt,2),h.data=l,h.plugin=i,h.setRatio=d,0===q.autoRotate&&(q.autoRotate=!0),!q.autoRotate||q.autoRotate instanceof Array||(j=q.autoRotate===!0?0:Number(q.autoRotate),q.autoRotate=null!=l.end.left?[["left","top","rotation",j,!1]]:null!=l.end.x?[["x","y","rotation",j,!1]]:!1),q.autoRotate&&(g._transform||g._enableTransforms(!1),l.autoRotate=g._target._gsTransform,l.proxy.rotation=l.autoRotate.rotation||0,g._overwriteProps.push("rotation")),i._onInitTween(l.proxy,q,g._tween),h}})}},q._mod=function(a){for(var b,c=this._overwriteProps,d=c.length;--d>-1;)b=a[c[d]],b&&"function"==typeof b&&(this._mod[c[d]]=b)},q._kill=function(a){var b,c,d=this._props;for(b in this._beziers)if(b in a)for(delete this._beziers[b],delete this._func[b],c=d.length;--c>-1;)d[c]===b&&d.splice(c,1);if(d=this._autoRotate)for(c=d.length;--c>-1;)a[d[c][2]]&&d.splice(c,1);return this._super._kill.call(this,a)}}(),_gsScope._gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(a,b){var c,d,e,f,g=function(){a.call(this,"css"),this._overwriteProps.length=0,this.setRatio=g.prototype.setRatio},h=_gsScope._gsDefine.globals,i={},j=g.prototype=new a("css");j.constructor=g,g.version="1.19.0",g.API=2,g.defaultTransformPerspective=0,g.defaultSkewType="compensated",g.defaultSmoothOrigin=!0,j="px",g.suffixMap={top:j,right:j,bottom:j,left:j,width:j,height:j,fontSize:j,padding:j,margin:j,perspective:j,lineHeight:""};var k,l,m,n,o,p,q,r,s=/(?:\-|\.|\b)(\d|\.|e\-)+/g,t=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,u=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,v=/(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,w=/(?:\d|\-|\+|=|#|\.)*/g,x=/opacity *= *([^)]*)/i,y=/opacity:([^;]*)/i,z=/alpha\(opacity *=.+?\)/i,A=/^(rgb|hsl)/,B=/([A-Z])/g,C=/-([a-z])/gi,D=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,E=function(a,b){return b.toUpperCase()},F=/(?:Left|Right|Width)/i,G=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,H=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,I=/,(?=[^\)]*(?:\(|$))/gi,J=/[\s,\(]/i,K=Math.PI/180,L=180/Math.PI,M={},N=document,O=function(a){return N.createElementNS?N.createElementNS("http://www.w3.org/1999/xhtml",a):N.createElement(a)},P=O("div"),Q=O("img"),R=g._internals={_specialProps:i},S=navigator.userAgent,T=function(){var a=S.indexOf("Android"),b=O("a");return m=-1!==S.indexOf("Safari")&&-1===S.indexOf("Chrome")&&(-1===a||Number(S.substr(a+8,1))>3),o=m&&Number(S.substr(S.indexOf("Version/")+8,1))<6,n=-1!==S.indexOf("Firefox"),(/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(S)||/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(S))&&(p=parseFloat(RegExp.$1)),b?(b.style.cssText="top:1px;opacity:.55;",/^0.55/.test(b.style.opacity)):!1}(),U=function(a){return x.test("string"==typeof a?a:(a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100:1},V=function(a){window.console&&console.log(a)},W="",X="",Y=function(a,b){b=b||P;var c,d,e=b.style;if(void 0!==e[a])return a;for(a=a.charAt(0).toUpperCase()+a.substr(1),c=["O","Moz","ms","Ms","Webkit"],d=5;--d>-1&&void 0===e[c[d]+a];);return d>=0?(X=3===d?"ms":c[d],W="-"+X.toLowerCase()+"-",X+a):null},Z=N.defaultView?N.defaultView.getComputedStyle:function(){},$=g.getStyle=function(a,b,c,d,e){var f;return T||"opacity"!==b?(!d&&a.style[b]?f=a.style[b]:(c=c||Z(a))?f=c[b]||c.getPropertyValue(b)||c.getPropertyValue(b.replace(B,"-$1").toLowerCase()):a.currentStyle&&(f=a.currentStyle[b]),null==e||f&&"none"!==f&&"auto"!==f&&"auto auto"!==f?f:e):U(a)},_=R.convertToPixels=function(a,c,d,e,f){if("px"===e||!e)return d;if("auto"===e||!d)return 0;var h,i,j,k=F.test(c),l=a,m=P.style,n=0>d,o=1===d;if(n&&(d=-d),o&&(d*=100),"%"===e&&-1!==c.indexOf("border"))h=d/100*(k?a.clientWidth:a.clientHeight);else{if(m.cssText="border:0 solid red;position:"+$(a,"position")+";line-height:0;","%"!==e&&l.appendChild&&"v"!==e.charAt(0)&&"rem"!==e)m[k?"borderLeftWidth":"borderTopWidth"]=d+e;else{if(l=a.parentNode||N.body,i=l._gsCache,j=b.ticker.frame,i&&k&&i.time===j)return i.width*d/100;m[k?"width":"height"]=d+e}l.appendChild(P),h=parseFloat(P[k?"offsetWidth":"offsetHeight"]),l.removeChild(P),k&&"%"===e&&g.cacheWidths!==!1&&(i=l._gsCache=l._gsCache||{},i.time=j,i.width=h/d*100),0!==h||f||(h=_(a,c,d,e,!0))}return o&&(h/=100),n?-h:h},aa=R.calculateOffset=function(a,b,c){if("absolute"!==$(a,"position",c))return 0;var d="left"===b?"Left":"Top",e=$(a,"margin"+d,c);return a["offset"+d]-(_(a,b,parseFloat(e),e.replace(w,""))||0)},ba=function(a,b){var c,d,e,f={};if(b=b||Z(a,null))if(c=b.length)for(;--c>-1;)e=b[c],(-1===e.indexOf("-transform")||Ca===e)&&(f[e.replace(C,E)]=b.getPropertyValue(e));else for(c in b)(-1===c.indexOf("Transform")||Ba===c)&&(f[c]=b[c]);else if(b=a.currentStyle||a.style)for(c in b)"string"==typeof c&&void 0===f[c]&&(f[c.replace(C,E)]=b[c]);return T||(f.opacity=U(a)),d=Pa(a,b,!1),f.rotation=d.rotation,f.skewX=d.skewX,f.scaleX=d.scaleX,f.scaleY=d.scaleY,f.x=d.x,f.y=d.y,Ea&&(f.z=d.z,f.rotationX=d.rotationX,f.rotationY=d.rotationY,f.scaleZ=d.scaleZ),f.filters&&delete f.filters,f},ca=function(a,b,c,d,e){var f,g,h,i={},j=a.style;for(g in c)"cssText"!==g&&"length"!==g&&isNaN(g)&&(b[g]!==(f=c[g])||e&&e[g])&&-1===g.indexOf("Origin")&&("number"==typeof f||"string"==typeof f)&&(i[g]="auto"!==f||"left"!==g&&"top"!==g?""!==f&&"auto"!==f&&"none"!==f||"string"!=typeof b[g]||""===b[g].replace(v,"")?f:0:aa(a,g),void 0!==j[g]&&(h=new ra(j,g,j[g],h)));if(d)for(g in d)"className"!==g&&(i[g]=d[g]);return{difs:i,firstMPT:h}},da={width:["Left","Right"],height:["Top","Bottom"]},ea=["marginLeft","marginRight","marginTop","marginBottom"],fa=function(a,b,c){if("svg"===(a.nodeName+"").toLowerCase())return(c||Z(a))[b]||0;if(a.getBBox&&Ma(a))return a.getBBox()[b]||0;var d=parseFloat("width"===b?a.offsetWidth:a.offsetHeight),e=da[b],f=e.length;for(c=c||Z(a,null);--f>-1;)d-=parseFloat($(a,"padding"+e[f],c,!0))||0,d-=parseFloat($(a,"border"+e[f]+"Width",c,!0))||0;return d},ga=function(a,b){if("contain"===a||"auto"===a||"auto auto"===a)return a+" ";(null==a||""===a)&&(a="0 0");var c,d=a.split(" "),e=-1!==a.indexOf("left")?"0%":-1!==a.indexOf("right")?"100%":d[0],f=-1!==a.indexOf("top")?"0%":-1!==a.indexOf("bottom")?"100%":d[1];if(d.length>3&&!b){for(d=a.split(", ").join(",").split(","),a=[],c=0;c<d.length;c++)a.push(ga(d[c]));return a.join(",")}return null==f?f="center"===e?"50%":"0":"center"===f&&(f="50%"),("center"===e||isNaN(parseFloat(e))&&-1===(e+"").indexOf("="))&&(e="50%"),a=e+" "+f+(d.length>2?" "+d[2]:""),b&&(b.oxp=-1!==e.indexOf("%"),b.oyp=-1!==f.indexOf("%"),b.oxr="="===e.charAt(1),b.oyr="="===f.charAt(1),b.ox=parseFloat(e.replace(v,"")),b.oy=parseFloat(f.replace(v,"")),b.v=a),b||a},ha=function(a,b){return"function"==typeof a&&(a=a(r,q)),"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2)):parseFloat(a)-parseFloat(b)||0},ia=function(a,b){return"function"==typeof a&&(a=a(r,q)),null==a?b:"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2))+b:parseFloat(a)||0},ja=function(a,b,c,d){var e,f,g,h,i,j=1e-6;return"function"==typeof a&&(a=a(r,q)),null==a?h=b:"number"==typeof a?h=a:(e=360,f=a.split("_"),i="="===a.charAt(1),g=(i?parseInt(a.charAt(0)+"1",10)*parseFloat(f[0].substr(2)):parseFloat(f[0]))*(-1===a.indexOf("rad")?1:L)-(i?0:b),f.length&&(d&&(d[c]=b+g),-1!==a.indexOf("short")&&(g%=e,g!==g%(e/2)&&(g=0>g?g+e:g-e)),-1!==a.indexOf("_cw")&&0>g?g=(g+9999999999*e)%e-(g/e|0)*e:-1!==a.indexOf("ccw")&&g>0&&(g=(g-9999999999*e)%e-(g/e|0)*e)),h=b+g),j>h&&h>-j&&(h=0),h},ka={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},la=function(a,b,c){return a=0>a?a+1:a>1?a-1:a,255*(1>6*a?b+(c-b)*a*6:.5>a?c:2>3*a?b+(c-b)*(2/3-a)*6:b)+.5|0},ma=g.parseColor=function(a,b){var c,d,e,f,g,h,i,j,k,l,m;if(a)if("number"==typeof a)c=[a>>16,a>>8&255,255&a];else{if(","===a.charAt(a.length-1)&&(a=a.substr(0,a.length-1)),ka[a])c=ka[a];else if("#"===a.charAt(0))4===a.length&&(d=a.charAt(1),e=a.charAt(2),f=a.charAt(3),a="#"+d+d+e+e+f+f),a=parseInt(a.substr(1),16),c=[a>>16,a>>8&255,255&a];else if("hsl"===a.substr(0,3))if(c=m=a.match(s),b){if(-1!==a.indexOf("="))return a.match(t)}else g=Number(c[0])%360/360,h=Number(c[1])/100,i=Number(c[2])/100,e=.5>=i?i*(h+1):i+h-i*h,d=2*i-e,c.length>3&&(c[3]=Number(a[3])),c[0]=la(g+1/3,d,e),c[1]=la(g,d,e),c[2]=la(g-1/3,d,e);else c=a.match(s)||ka.transparent;c[0]=Number(c[0]),c[1]=Number(c[1]),c[2]=Number(c[2]),c.length>3&&(c[3]=Number(c[3]))}else c=ka.black;return b&&!m&&(d=c[0]/255,e=c[1]/255,f=c[2]/255,j=Math.max(d,e,f),k=Math.min(d,e,f),i=(j+k)/2,j===k?g=h=0:(l=j-k,h=i>.5?l/(2-j-k):l/(j+k),g=j===d?(e-f)/l+(f>e?6:0):j===e?(f-d)/l+2:(d-e)/l+4,g*=60),c[0]=g+.5|0,c[1]=100*h+.5|0,c[2]=100*i+.5|0),c},na=function(a,b){var c,d,e,f=a.match(oa)||[],g=0,h=f.length?"":a;for(c=0;c<f.length;c++)d=f[c],e=a.substr(g,a.indexOf(d,g)-g),g+=e.length+d.length,d=ma(d,b),3===d.length&&d.push(1),h+=e+(b?"hsla("+d[0]+","+d[1]+"%,"+d[2]+"%,"+d[3]:"rgba("+d.join(","))+")";return h+a.substr(g)},oa="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";for(j in ka)oa+="|"+j+"\\b";oa=new RegExp(oa+")","gi"),g.colorStringFilter=function(a){var b,c=a[0]+a[1];oa.test(c)&&(b=-1!==c.indexOf("hsl(")||-1!==c.indexOf("hsla("),a[0]=na(a[0],b),a[1]=na(a[1],b)),oa.lastIndex=0},b.defaultStringFilter||(b.defaultStringFilter=g.colorStringFilter);var pa=function(a,b,c,d){if(null==a)return function(a){return a};var e,f=b?(a.match(oa)||[""])[0]:"",g=a.split(f).join("").match(u)||[],h=a.substr(0,a.indexOf(g[0])),i=")"===a.charAt(a.length-1)?")":"",j=-1!==a.indexOf(" ")?" ":",",k=g.length,l=k>0?g[0].replace(s,""):"";return k?e=b?function(a){var b,m,n,o;if("number"==typeof a)a+=l;else if(d&&I.test(a)){for(o=a.replace(I,"|").split("|"),n=0;n<o.length;n++)o[n]=e(o[n]);return o.join(",")}if(b=(a.match(oa)||[f])[0],m=a.split(b).join("").match(u)||[],n=m.length,k>n--)for(;++n<k;)m[n]=c?m[(n-1)/2|0]:g[n];return h+m.join(j)+j+b+i+(-1!==a.indexOf("inset")?" inset":"")}:function(a){var b,f,m;if("number"==typeof a)a+=l;else if(d&&I.test(a)){for(f=a.replace(I,"|").split("|"),m=0;m<f.length;m++)f[m]=e(f[m]);return f.join(",")}if(b=a.match(u)||[],m=b.length,k>m--)for(;++m<k;)b[m]=c?b[(m-1)/2|0]:g[m];return h+b.join(j)+i}:function(a){return a}},qa=function(a){return a=a.split(","),function(b,c,d,e,f,g,h){var i,j=(c+"").split(" ");for(h={},i=0;4>i;i++)h[a[i]]=j[i]=j[i]||j[(i-1)/2>>0];return e.parse(b,h,f,g)}},ra=(R._setPluginRatio=function(a){this.plugin.setRatio(a);for(var b,c,d,e,f,g=this.data,h=g.proxy,i=g.firstMPT,j=1e-6;i;)b=h[i.v],i.r?b=Math.round(b):j>b&&b>-j&&(b=0),i.t[i.p]=b,i=i._next;if(g.autoRotate&&(g.autoRotate.rotation=g.mod?g.mod(h.rotation,this.t):h.rotation),1===a||0===a)for(i=g.firstMPT,f=1===a?"e":"b";i;){if(c=i.t,c.type){if(1===c.type){for(e=c.xs0+c.s+c.xs1,d=1;d<c.l;d++)e+=c["xn"+d]+c["xs"+(d+1)];c[f]=e}}else c[f]=c.s+c.xs0;i=i._next}},function(a,b,c,d,e){this.t=a,this.p=b,this.v=c,this.r=e,d&&(d._prev=this,this._next=d)}),sa=(R._parseToProxy=function(a,b,c,d,e,f){var g,h,i,j,k,l=d,m={},n={},o=c._transform,p=M;for(c._transform=null,M=b,d=k=c.parse(a,b,d,e),M=p,f&&(c._transform=o,l&&(l._prev=null,l._prev&&(l._prev._next=null)));d&&d!==l;){if(d.type<=1&&(h=d.p,n[h]=d.s+d.c,m[h]=d.s,f||(j=new ra(d,"s",h,j,d.r),d.c=0),1===d.type))for(g=d.l;--g>0;)i="xn"+g,h=d.p+"_"+i,n[h]=d.data[i],m[h]=d[i],f||(j=new ra(d,i,h,j,d.rxp[i]));d=d._next}return{proxy:m,end:n,firstMPT:j,pt:k}},R.CSSPropTween=function(a,b,d,e,g,h,i,j,k,l,m){this.t=a,this.p=b,this.s=d,this.c=e,this.n=i||b,a instanceof sa||f.push(this.n),this.r=j,this.type=h||0,k&&(this.pr=k,c=!0),this.b=void 0===l?d:l,this.e=void 0===m?d+e:m,g&&(this._next=g,g._prev=this)}),ta=function(a,b,c,d,e,f){var g=new sa(a,b,c,d-c,e,-1,f);return g.b=c,g.e=g.xs0=d,g},ua=g.parseComplex=function(a,b,c,d,e,f,h,i,j,l){c=c||f||"","function"==typeof d&&(d=d(r,q)),h=new sa(a,b,0,0,h,l?2:1,null,!1,i,c,d),d+="",e&&oa.test(d+c)&&(d=[c,d],g.colorStringFilter(d),c=d[0],d=d[1]);var m,n,o,p,u,v,w,x,y,z,A,B,C,D=c.split(", ").join(",").split(" "),E=d.split(", ").join(",").split(" "),F=D.length,G=k!==!1;for((-1!==d.indexOf(",")||-1!==c.indexOf(","))&&(D=D.join(" ").replace(I,", ").split(" "),E=E.join(" ").replace(I,", ").split(" "),F=D.length),F!==E.length&&(D=(f||"").split(" "),F=D.length),h.plugin=j,h.setRatio=l,oa.lastIndex=0,m=0;F>m;m++)if(p=D[m],u=E[m],x=parseFloat(p),x||0===x)h.appendXtra("",x,ha(u,x),u.replace(t,""),G&&-1!==u.indexOf("px"),!0);else if(e&&oa.test(p))B=u.indexOf(")")+1,B=")"+(B?u.substr(B):""),C=-1!==u.indexOf("hsl")&&T,p=ma(p,C),u=ma(u,C),y=p.length+u.length>6,y&&!T&&0===u[3]?(h["xs"+h.l]+=h.l?" transparent":"transparent",h.e=h.e.split(E[m]).join("transparent")):(T||(y=!1),C?h.appendXtra(y?"hsla(":"hsl(",p[0],ha(u[0],p[0]),",",!1,!0).appendXtra("",p[1],ha(u[1],p[1]),"%,",!1).appendXtra("",p[2],ha(u[2],p[2]),y?"%,":"%"+B,!1):h.appendXtra(y?"rgba(":"rgb(",p[0],u[0]-p[0],",",!0,!0).appendXtra("",p[1],u[1]-p[1],",",!0).appendXtra("",p[2],u[2]-p[2],y?",":B,!0),y&&(p=p.length<4?1:p[3],h.appendXtra("",p,(u.length<4?1:u[3])-p,B,!1))),oa.lastIndex=0;else if(v=p.match(s)){if(w=u.match(t),!w||w.length!==v.length)return h;for(o=0,n=0;n<v.length;n++)A=v[n],z=p.indexOf(A,o),h.appendXtra(p.substr(o,z-o),Number(A),ha(w[n],A),"",G&&"px"===p.substr(z+A.length,2),0===n),o=z+A.length;h["xs"+h.l]+=p.substr(o)}else h["xs"+h.l]+=h.l||h["xs"+h.l]?" "+u:u;if(-1!==d.indexOf("=")&&h.data){for(B=h.xs0+h.data.s,m=1;m<h.l;m++)B+=h["xs"+m]+h.data["xn"+m];h.e=B+h["xs"+m]}return h.l||(h.type=-1,h.xs0=h.e),h.xfirst||h},va=9;for(j=sa.prototype,j.l=j.pr=0;--va>0;)j["xn"+va]=0,j["xs"+va]="";j.xs0="",j._next=j._prev=j.xfirst=j.data=j.plugin=j.setRatio=j.rxp=null,j.appendXtra=function(a,b,c,d,e,f){var g=this,h=g.l;return g["xs"+h]+=f&&(h||g["xs"+h])?" "+a:a||"",c||0===h||g.plugin?(g.l++,g.type=g.setRatio?2:1,g["xs"+g.l]=d||"",h>0?(g.data["xn"+h]=b+c,g.rxp["xn"+h]=e,g["xn"+h]=b,g.plugin||(g.xfirst=new sa(g,"xn"+h,b,c,g.xfirst||g,0,g.n,e,g.pr),g.xfirst.xs0=0),g):(g.data={s:b+c},g.rxp={},g.s=b,g.c=c,g.r=e,g)):(g["xs"+h]+=b+(d||""),g)};var wa=function(a,b){b=b||{},this.p=b.prefix?Y(a)||a:a,i[a]=i[this.p]=this,this.format=b.formatter||pa(b.defaultValue,b.color,b.collapsible,b.multi),b.parser&&(this.parse=b.parser),this.clrs=b.color,this.multi=b.multi,this.keyword=b.keyword,this.dflt=b.defaultValue,this.pr=b.priority||0},xa=R._registerComplexSpecialProp=function(a,b,c){"object"!=typeof b&&(b={parser:c});var d,e,f=a.split(","),g=b.defaultValue;for(c=c||[g],d=0;d<f.length;d++)b.prefix=0===d&&b.prefix,b.defaultValue=c[d]||g,e=new wa(f[d],b)},ya=R._registerPluginProp=function(a){if(!i[a]){var b=a.charAt(0).toUpperCase()+a.substr(1)+"Plugin";xa(a,{parser:function(a,c,d,e,f,g,j){var k=h.com.greensock.plugins[b];return k?(k._cssRegister(),i[d].parse(a,c,d,e,f,g,j)):(V("Error: "+b+" js file not loaded."),f)}})}};j=wa.prototype,j.parseComplex=function(a,b,c,d,e,f){var g,h,i,j,k,l,m=this.keyword;if(this.multi&&(I.test(c)||I.test(b)?(h=b.replace(I,"|").split("|"),i=c.replace(I,"|").split("|")):m&&(h=[b],i=[c])),i){for(j=i.length>h.length?i.length:h.length,g=0;j>g;g++)b=h[g]=h[g]||this.dflt,c=i[g]=i[g]||this.dflt,m&&(k=b.indexOf(m),l=c.indexOf(m),k!==l&&(-1===l?h[g]=h[g].split(m).join(""):-1===k&&(h[g]+=" "+m)));b=h.join(", "),c=i.join(", ")}return ua(a,this.p,b,c,this.clrs,this.dflt,d,this.pr,e,f)},j.parse=function(a,b,c,d,f,g,h){return this.parseComplex(a.style,this.format($(a,this.p,e,!1,this.dflt)),this.format(b),f,g)},g.registerSpecialProp=function(a,b,c){xa(a,{parser:function(a,d,e,f,g,h,i){var j=new sa(a,e,0,0,g,2,e,!1,c);return j.plugin=h,j.setRatio=b(a,d,f._tween,e),j},priority:c})},g.useSVGTransformAttr=m||n;var za,Aa="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),Ba=Y("transform"),Ca=W+"transform",Da=Y("transformOrigin"),Ea=null!==Y("perspective"),Fa=R.Transform=function(){this.perspective=parseFloat(g.defaultTransformPerspective)||0,this.force3D=g.defaultForce3D!==!1&&Ea?g.defaultForce3D||"auto":!1},Ga=window.SVGElement,Ha=function(a,b,c){var d,e=N.createElementNS("http://www.w3.org/2000/svg",a),f=/([a-z])([A-Z])/g;for(d in c)e.setAttributeNS(null,d.replace(f,"$1-$2").toLowerCase(),c[d]);return b.appendChild(e),e},Ia=N.documentElement,Ja=function(){var a,b,c,d=p||/Android/i.test(S)&&!window.chrome;return N.createElementNS&&!d&&(a=Ha("svg",Ia),b=Ha("rect",a,{width:100,height:50,x:100}),c=b.getBoundingClientRect().width,b.style[Da]="50% 50%",b.style[Ba]="scaleX(0.5)",d=c===b.getBoundingClientRect().width&&!(n&&Ea),Ia.removeChild(a)),d}(),Ka=function(a,b,c,d,e,f){var h,i,j,k,l,m,n,o,p,q,r,s,t,u,v=a._gsTransform,w=Oa(a,!0);v&&(t=v.xOrigin,u=v.yOrigin),(!d||(h=d.split(" ")).length<2)&&(n=a.getBBox(),b=ga(b).split(" "),h=[(-1!==b[0].indexOf("%")?parseFloat(b[0])/100*n.width:parseFloat(b[0]))+n.x,(-1!==b[1].indexOf("%")?parseFloat(b[1])/100*n.height:parseFloat(b[1]))+n.y]),c.xOrigin=k=parseFloat(h[0]),c.yOrigin=l=parseFloat(h[1]),d&&w!==Na&&(m=w[0],n=w[1],o=w[2],p=w[3],q=w[4],r=w[5],s=m*p-n*o,i=k*(p/s)+l*(-o/s)+(o*r-p*q)/s,j=k*(-n/s)+l*(m/s)-(m*r-n*q)/s,k=c.xOrigin=h[0]=i,l=c.yOrigin=h[1]=j),v&&(f&&(c.xOffset=v.xOffset,c.yOffset=v.yOffset,v=c),e||e!==!1&&g.defaultSmoothOrigin!==!1?(i=k-t,j=l-u,v.xOffset+=i*w[0]+j*w[2]-i,v.yOffset+=i*w[1]+j*w[3]-j):v.xOffset=v.yOffset=0),f||a.setAttribute("data-svg-origin",h.join(" "))},La=function(a){try{return a.getBBox()}catch(a){}},Ma=function(a){return!!(Ga&&a.getBBox&&a.getCTM&&La(a)&&(!a.parentNode||a.parentNode.getBBox&&a.parentNode.getCTM))},Na=[1,0,0,1,0,0],Oa=function(a,b){var c,d,e,f,g,h,i=a._gsTransform||new Fa,j=1e5,k=a.style;if(Ba?d=$(a,Ca,null,!0):a.currentStyle&&(d=a.currentStyle.filter.match(G),d=d&&4===d.length?[d[0].substr(4),Number(d[2].substr(4)),Number(d[1].substr(4)),d[3].substr(4),i.x||0,i.y||0].join(","):""),c=!d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d,c&&Ba&&((h="none"===Z(a).display)||!a.parentNode)&&(h&&(f=k.display,k.display="block"),a.parentNode||(g=1,Ia.appendChild(a)),d=$(a,Ca,null,!0),c=!d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d,f?k.display=f:h&&Ta(k,"display"),g&&Ia.removeChild(a)),(i.svg||a.getBBox&&Ma(a))&&(c&&-1!==(k[Ba]+"").indexOf("matrix")&&(d=k[Ba],c=0),e=a.getAttribute("transform"),c&&e&&(-1!==e.indexOf("matrix")?(d=e,c=0):-1!==e.indexOf("translate")&&(d="matrix(1,0,0,1,"+e.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",")+")",c=0))),c)return Na;for(e=(d||"").match(s)||[],va=e.length;--va>-1;)f=Number(e[va]),e[va]=(g=f-(f|=0))?(g*j+(0>g?-.5:.5)|0)/j+f:f;return b&&e.length>6?[e[0],e[1],e[4],e[5],e[12],e[13]]:e},Pa=R.getTransform=function(a,c,d,e){if(a._gsTransform&&d&&!e)return a._gsTransform;var f,h,i,j,k,l,m=d?a._gsTransform||new Fa:new Fa,n=m.scaleX<0,o=2e-5,p=1e5,q=Ea?parseFloat($(a,Da,c,!1,"0 0 0").split(" ")[2])||m.zOrigin||0:0,r=parseFloat(g.defaultTransformPerspective)||0;if(m.svg=!(!a.getBBox||!Ma(a)),m.svg&&(Ka(a,$(a,Da,c,!1,"50% 50%")+"",m,a.getAttribute("data-svg-origin")),za=g.useSVGTransformAttr||Ja),f=Oa(a),f!==Na){if(16===f.length){var s,t,u,v,w,x=f[0],y=f[1],z=f[2],A=f[3],B=f[4],C=f[5],D=f[6],E=f[7],F=f[8],G=f[9],H=f[10],I=f[12],J=f[13],K=f[14],M=f[11],N=Math.atan2(D,H);m.zOrigin&&(K=-m.zOrigin,I=F*K-f[12],J=G*K-f[13],K=H*K+m.zOrigin-f[14]),m.rotationX=N*L,N&&(v=Math.cos(-N),w=Math.sin(-N),s=B*v+F*w,t=C*v+G*w,u=D*v+H*w,F=B*-w+F*v,G=C*-w+G*v,H=D*-w+H*v,M=E*-w+M*v,B=s,C=t,D=u),N=Math.atan2(-z,H),m.rotationY=N*L,N&&(v=Math.cos(-N),w=Math.sin(-N),s=x*v-F*w,t=y*v-G*w,u=z*v-H*w,G=y*w+G*v,H=z*w+H*v,M=A*w+M*v,x=s,y=t,z=u),N=Math.atan2(y,x),m.rotation=N*L,N&&(v=Math.cos(-N),w=Math.sin(-N),x=x*v+B*w,t=y*v+C*w,C=y*-w+C*v,D=z*-w+D*v,y=t),m.rotationX&&Math.abs(m.rotationX)+Math.abs(m.rotation)>359.9&&(m.rotationX=m.rotation=0,m.rotationY=180-m.rotationY),m.scaleX=(Math.sqrt(x*x+y*y)*p+.5|0)/p,m.scaleY=(Math.sqrt(C*C+G*G)*p+.5|0)/p,m.scaleZ=(Math.sqrt(D*D+H*H)*p+.5|0)/p,m.rotationX||m.rotationY?m.skewX=0:(m.skewX=B||C?Math.atan2(B,C)*L+m.rotation:m.skewX||0,Math.abs(m.skewX)>90&&Math.abs(m.skewX)<270&&(n?(m.scaleX*=-1,m.skewX+=m.rotation<=0?180:-180,m.rotation+=m.rotation<=0?180:-180):(m.scaleY*=-1,m.skewX+=m.skewX<=0?180:-180))),m.perspective=M?1/(0>M?-M:M):0,m.x=I,m.y=J,m.z=K,m.svg&&(m.x-=m.xOrigin-(m.xOrigin*x-m.yOrigin*B),m.y-=m.yOrigin-(m.yOrigin*y-m.xOrigin*C))}else if(!Ea||e||!f.length||m.x!==f[4]||m.y!==f[5]||!m.rotationX&&!m.rotationY){var O=f.length>=6,P=O?f[0]:1,Q=f[1]||0,R=f[2]||0,S=O?f[3]:1;m.x=f[4]||0,m.y=f[5]||0,i=Math.sqrt(P*P+Q*Q),j=Math.sqrt(S*S+R*R),k=P||Q?Math.atan2(Q,P)*L:m.rotation||0,l=R||S?Math.atan2(R,S)*L+k:m.skewX||0,Math.abs(l)>90&&Math.abs(l)<270&&(n?(i*=-1,l+=0>=k?180:-180,k+=0>=k?180:-180):(j*=-1,l+=0>=l?180:-180)),m.scaleX=i,m.scaleY=j,m.rotation=k,m.skewX=l,Ea&&(m.rotationX=m.rotationY=m.z=0,m.perspective=r,m.scaleZ=1),m.svg&&(m.x-=m.xOrigin-(m.xOrigin*P+m.yOrigin*R),m.y-=m.yOrigin-(m.xOrigin*Q+m.yOrigin*S))}m.zOrigin=q;for(h in m)m[h]<o&&m[h]>-o&&(m[h]=0)}return d&&(a._gsTransform=m,m.svg&&(za&&a.style[Ba]?b.delayedCall(.001,function(){Ta(a.style,Ba)}):!za&&a.getAttribute("transform")&&b.delayedCall(.001,function(){a.removeAttribute("transform")}))),m},Qa=function(a){var b,c,d=this.data,e=-d.rotation*K,f=e+d.skewX*K,g=1e5,h=(Math.cos(e)*d.scaleX*g|0)/g,i=(Math.sin(e)*d.scaleX*g|0)/g,j=(Math.sin(f)*-d.scaleY*g|0)/g,k=(Math.cos(f)*d.scaleY*g|0)/g,l=this.t.style,m=this.t.currentStyle;if(m){c=i,i=-j,j=-c,b=m.filter,l.filter="";var n,o,q=this.t.offsetWidth,r=this.t.offsetHeight,s="absolute"!==m.position,t="progid:DXImageTransform.Microsoft.Matrix(M11="+h+", M12="+i+", M21="+j+", M22="+k,u=d.x+q*d.xPercent/100,v=d.y+r*d.yPercent/100;if(null!=d.ox&&(n=(d.oxp?q*d.ox*.01:d.ox)-q/2,o=(d.oyp?r*d.oy*.01:d.oy)-r/2,u+=n-(n*h+o*i),v+=o-(n*j+o*k)),s?(n=q/2,o=r/2,t+=", Dx="+(n-(n*h+o*i)+u)+", Dy="+(o-(n*j+o*k)+v)+")"):t+=", sizingMethod='auto expand')",-1!==b.indexOf("DXImageTransform.Microsoft.Matrix(")?l.filter=b.replace(H,t):l.filter=t+" "+b,(0===a||1===a)&&1===h&&0===i&&0===j&&1===k&&(s&&-1===t.indexOf("Dx=0, Dy=0")||x.test(b)&&100!==parseFloat(RegExp.$1)||-1===b.indexOf(b.indexOf("Alpha"))&&l.removeAttribute("filter")),!s){var y,z,A,B=8>p?1:-1;for(n=d.ieOffsetX||0,o=d.ieOffsetY||0,d.ieOffsetX=Math.round((q-((0>h?-h:h)*q+(0>i?-i:i)*r))/2+u),d.ieOffsetY=Math.round((r-((0>k?-k:k)*r+(0>j?-j:j)*q))/2+v),va=0;4>va;va++)z=ea[va],y=m[z],c=-1!==y.indexOf("px")?parseFloat(y):_(this.t,z,parseFloat(y),y.replace(w,""))||0,A=c!==d[z]?2>va?-d.ieOffsetX:-d.ieOffsetY:2>va?n-d.ieOffsetX:o-d.ieOffsetY,l[z]=(d[z]=Math.round(c-A*(0===va||2===va?1:B)))+"px"}}},Ra=R.set3DTransformRatio=R.setTransformRatio=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,o,p,q,r,s,t,u,v,w,x,y,z=this.data,A=this.t.style,B=z.rotation,C=z.rotationX,D=z.rotationY,E=z.scaleX,F=z.scaleY,G=z.scaleZ,H=z.x,I=z.y,J=z.z,L=z.svg,M=z.perspective,N=z.force3D;if(((1===a||0===a)&&"auto"===N&&(this.tween._totalTime===this.tween._totalDuration||!this.tween._totalTime)||!N)&&!J&&!M&&!D&&!C&&1===G||za&&L||!Ea)return void(B||z.skewX||L?(B*=K,x=z.skewX*K,y=1e5,b=Math.cos(B)*E,e=Math.sin(B)*E,c=Math.sin(B-x)*-F,f=Math.cos(B-x)*F,x&&"simple"===z.skewType&&(s=Math.tan(x-z.skewY*K),s=Math.sqrt(1+s*s),c*=s,f*=s,z.skewY&&(s=Math.tan(z.skewY*K),s=Math.sqrt(1+s*s),b*=s,e*=s)),L&&(H+=z.xOrigin-(z.xOrigin*b+z.yOrigin*c)+z.xOffset,I+=z.yOrigin-(z.xOrigin*e+z.yOrigin*f)+z.yOffset,za&&(z.xPercent||z.yPercent)&&(p=this.t.getBBox(),H+=.01*z.xPercent*p.width,I+=.01*z.yPercent*p.height),p=1e-6,p>H&&H>-p&&(H=0),p>I&&I>-p&&(I=0)),u=(b*y|0)/y+","+(e*y|0)/y+","+(c*y|0)/y+","+(f*y|0)/y+","+H+","+I+")",L&&za?this.t.setAttribute("transform","matrix("+u):A[Ba]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+u):A[Ba]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+E+",0,0,"+F+","+H+","+I+")");if(n&&(p=1e-4,p>E&&E>-p&&(E=G=2e-5),p>F&&F>-p&&(F=G=2e-5),!M||z.z||z.rotationX||z.rotationY||(M=0)),B||z.skewX)B*=K,q=b=Math.cos(B),r=e=Math.sin(B),z.skewX&&(B-=z.skewX*K,q=Math.cos(B),r=Math.sin(B),"simple"===z.skewType&&(s=Math.tan((z.skewX-z.skewY)*K),s=Math.sqrt(1+s*s),q*=s,r*=s,z.skewY&&(s=Math.tan(z.skewY*K),s=Math.sqrt(1+s*s),b*=s,e*=s))),c=-r,f=q;else{if(!(D||C||1!==G||M||L))return void(A[Ba]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) translate3d(":"translate3d(")+H+"px,"+I+"px,"+J+"px)"+(1!==E||1!==F?" scale("+E+","+F+")":""));b=f=1,c=e=0}j=1,d=g=h=i=k=l=0,m=M?-1/M:0,o=z.zOrigin,p=1e-6,v=",",w="0",B=D*K,B&&(q=Math.cos(B),r=Math.sin(B),h=-r,k=m*-r,d=b*r,g=e*r,j=q,m*=q,b*=q,e*=q),B=C*K,B&&(q=Math.cos(B),r=Math.sin(B),s=c*q+d*r,t=f*q+g*r,i=j*r,l=m*r,d=c*-r+d*q,g=f*-r+g*q,j*=q,m*=q,c=s,f=t),1!==G&&(d*=G,g*=G,j*=G,m*=G),1!==F&&(c*=F,f*=F,i*=F,l*=F),1!==E&&(b*=E,e*=E,h*=E,k*=E),(o||L)&&(o&&(H+=d*-o,I+=g*-o,J+=j*-o+o),L&&(H+=z.xOrigin-(z.xOrigin*b+z.yOrigin*c)+z.xOffset,I+=z.yOrigin-(z.xOrigin*e+z.yOrigin*f)+z.yOffset),p>H&&H>-p&&(H=w),p>I&&I>-p&&(I=w),p>J&&J>-p&&(J=0)),u=z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix3d(":"matrix3d(",u+=(p>b&&b>-p?w:b)+v+(p>e&&e>-p?w:e)+v+(p>h&&h>-p?w:h),u+=v+(p>k&&k>-p?w:k)+v+(p>c&&c>-p?w:c)+v+(p>f&&f>-p?w:f),C||D||1!==G?(u+=v+(p>i&&i>-p?w:i)+v+(p>l&&l>-p?w:l)+v+(p>d&&d>-p?w:d),u+=v+(p>g&&g>-p?w:g)+v+(p>j&&j>-p?w:j)+v+(p>m&&m>-p?w:m)+v):u+=",0,0,0,0,1,0,",u+=H+v+I+v+J+v+(M?1+-J/M:1)+")",A[Ba]=u};j=Fa.prototype,j.x=j.y=j.z=j.skewX=j.skewY=j.rotation=j.rotationX=j.rotationY=j.zOrigin=j.xPercent=j.yPercent=j.xOffset=j.yOffset=0,j.scaleX=j.scaleY=j.scaleZ=1,xa("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin",{parser:function(a,b,c,d,f,h,i){if(d._lastParsedTransform===i)return f;d._lastParsedTransform=i;var j;"function"==typeof i[c]&&(j=i[c],i[c]=b);var k,l,m,n,o,p,s,t,u,v=a._gsTransform,w=a.style,x=1e-6,y=Aa.length,z=i,A={},B="transformOrigin",C=Pa(a,e,!0,z.parseTransform),D=z.transform&&("function"==typeof z.transform?z.transform(r,q):z.transform);if(d._transform=C,D&&"string"==typeof D&&Ba)l=P.style,l[Ba]=D,l.display="block",l.position="absolute",N.body.appendChild(P),k=Pa(P,null,!1),C.svg&&(p=C.xOrigin,s=C.yOrigin,k.x-=C.xOffset,k.y-=C.yOffset,(z.transformOrigin||z.svgOrigin)&&(D={},Ka(a,ga(z.transformOrigin),D,z.svgOrigin,z.smoothOrigin,!0),p=D.xOrigin,s=D.yOrigin,k.x-=D.xOffset-C.xOffset,k.y-=D.yOffset-C.yOffset),(p||s)&&(t=Oa(P,!0),k.x-=p-(p*t[0]+s*t[2]),k.y-=s-(p*t[1]+s*t[3]))),N.body.removeChild(P),k.perspective||(k.perspective=C.perspective),null!=z.xPercent&&(k.xPercent=ia(z.xPercent,C.xPercent)),null!=z.yPercent&&(k.yPercent=ia(z.yPercent,C.yPercent));else if("object"==typeof z){if(k={scaleX:ia(null!=z.scaleX?z.scaleX:z.scale,C.scaleX),scaleY:ia(null!=z.scaleY?z.scaleY:z.scale,C.scaleY),scaleZ:ia(z.scaleZ,C.scaleZ),x:ia(z.x,C.x),y:ia(z.y,C.y),z:ia(z.z,C.z),xPercent:ia(z.xPercent,C.xPercent),yPercent:ia(z.yPercent,C.yPercent),perspective:ia(z.transformPerspective,C.perspective)},o=z.directionalRotation,null!=o)if("object"==typeof o)for(l in o)z[l]=o[l];else z.rotation=o;"string"==typeof z.x&&-1!==z.x.indexOf("%")&&(k.x=0,k.xPercent=ia(z.x,C.xPercent)),"string"==typeof z.y&&-1!==z.y.indexOf("%")&&(k.y=0,k.yPercent=ia(z.y,C.yPercent)),k.rotation=ja("rotation"in z?z.rotation:"shortRotation"in z?z.shortRotation+"_short":"rotationZ"in z?z.rotationZ:C.rotation-C.skewY,C.rotation-C.skewY,"rotation",A),Ea&&(k.rotationX=ja("rotationX"in z?z.rotationX:"shortRotationX"in z?z.shortRotationX+"_short":C.rotationX||0,C.rotationX,"rotationX",A),k.rotationY=ja("rotationY"in z?z.rotationY:"shortRotationY"in z?z.shortRotationY+"_short":C.rotationY||0,C.rotationY,"rotationY",A)),k.skewX=ja(z.skewX,C.skewX-C.skewY),(k.skewY=ja(z.skewY,C.skewY))&&(k.skewX+=k.skewY,k.rotation+=k.skewY)}for(Ea&&null!=z.force3D&&(C.force3D=z.force3D,n=!0),C.skewType=z.skewType||C.skewType||g.defaultSkewType,m=C.force3D||C.z||C.rotationX||C.rotationY||k.z||k.rotationX||k.rotationY||k.perspective,m||null==z.scale||(k.scaleZ=1);--y>-1;)u=Aa[y],D=k[u]-C[u],(D>x||-x>D||null!=z[u]||null!=M[u])&&(n=!0,
	f=new sa(C,u,C[u],D,f),u in A&&(f.e=A[u]),f.xs0=0,f.plugin=h,d._overwriteProps.push(f.n));return D=z.transformOrigin,C.svg&&(D||z.svgOrigin)&&(p=C.xOffset,s=C.yOffset,Ka(a,ga(D),k,z.svgOrigin,z.smoothOrigin),f=ta(C,"xOrigin",(v?C:k).xOrigin,k.xOrigin,f,B),f=ta(C,"yOrigin",(v?C:k).yOrigin,k.yOrigin,f,B),(p!==C.xOffset||s!==C.yOffset)&&(f=ta(C,"xOffset",v?p:C.xOffset,C.xOffset,f,B),f=ta(C,"yOffset",v?s:C.yOffset,C.yOffset,f,B)),D=za?null:"0px 0px"),(D||Ea&&m&&C.zOrigin)&&(Ba?(n=!0,u=Da,D=(D||$(a,u,e,!1,"50% 50%"))+"",f=new sa(w,u,0,0,f,-1,B),f.b=w[u],f.plugin=h,Ea?(l=C.zOrigin,D=D.split(" "),C.zOrigin=(D.length>2&&(0===l||"0px"!==D[2])?parseFloat(D[2]):l)||0,f.xs0=f.e=D[0]+" "+(D[1]||"50%")+" 0px",f=new sa(C,"zOrigin",0,0,f,-1,f.n),f.b=l,f.xs0=f.e=C.zOrigin):f.xs0=f.e=D):ga(D+"",C)),n&&(d._transformType=C.svg&&za||!m&&3!==this._transformType?2:3),j&&(i[c]=j),f},prefix:!0}),xa("boxShadow",{defaultValue:"0px 0px 0px 0px #999",prefix:!0,color:!0,multi:!0,keyword:"inset"}),xa("borderRadius",{defaultValue:"0px",parser:function(a,b,c,f,g,h){b=this.format(b);var i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],z=a.style;for(q=parseFloat(a.offsetWidth),r=parseFloat(a.offsetHeight),i=b.split(" "),j=0;j<y.length;j++)this.p.indexOf("border")&&(y[j]=Y(y[j])),m=l=$(a,y[j],e,!1,"0px"),-1!==m.indexOf(" ")&&(l=m.split(" "),m=l[0],l=l[1]),n=k=i[j],o=parseFloat(m),t=m.substr((o+"").length),u="="===n.charAt(1),u?(p=parseInt(n.charAt(0)+"1",10),n=n.substr(2),p*=parseFloat(n),s=n.substr((p+"").length-(0>p?1:0))||""):(p=parseFloat(n),s=n.substr((p+"").length)),""===s&&(s=d[c]||t),s!==t&&(v=_(a,"borderLeft",o,t),w=_(a,"borderTop",o,t),"%"===s?(m=v/q*100+"%",l=w/r*100+"%"):"em"===s?(x=_(a,"borderLeft",1,"em"),m=v/x+"em",l=w/x+"em"):(m=v+"px",l=w+"px"),u&&(n=parseFloat(m)+p+s,k=parseFloat(l)+p+s)),g=ua(z,y[j],m+" "+l,n+" "+k,!1,"0px",g);return g},prefix:!0,formatter:pa("0px 0px 0px 0px",!1,!0)}),xa("borderBottomLeftRadius,borderBottomRightRadius,borderTopLeftRadius,borderTopRightRadius",{defaultValue:"0px",parser:function(a,b,c,d,f,g){return ua(a.style,c,this.format($(a,c,e,!1,"0px 0px")),this.format(b),!1,"0px",f)},prefix:!0,formatter:pa("0px 0px",!1,!0)}),xa("backgroundPosition",{defaultValue:"0 0",parser:function(a,b,c,d,f,g){var h,i,j,k,l,m,n="background-position",o=e||Z(a,null),q=this.format((o?p?o.getPropertyValue(n+"-x")+" "+o.getPropertyValue(n+"-y"):o.getPropertyValue(n):a.currentStyle.backgroundPositionX+" "+a.currentStyle.backgroundPositionY)||"0 0"),r=this.format(b);if(-1!==q.indexOf("%")!=(-1!==r.indexOf("%"))&&r.split(",").length<2&&(m=$(a,"backgroundImage").replace(D,""),m&&"none"!==m)){for(h=q.split(" "),i=r.split(" "),Q.setAttribute("src",m),j=2;--j>-1;)q=h[j],k=-1!==q.indexOf("%"),k!==(-1!==i[j].indexOf("%"))&&(l=0===j?a.offsetWidth-Q.width:a.offsetHeight-Q.height,h[j]=k?parseFloat(q)/100*l+"px":parseFloat(q)/l*100+"%");q=h.join(" ")}return this.parseComplex(a.style,q,r,f,g)},formatter:ga}),xa("backgroundSize",{defaultValue:"0 0",formatter:function(a){return a+="",ga(-1===a.indexOf(" ")?a+" "+a:a)}}),xa("perspective",{defaultValue:"0px",prefix:!0}),xa("perspectiveOrigin",{defaultValue:"50% 50%",prefix:!0}),xa("transformStyle",{prefix:!0}),xa("backfaceVisibility",{prefix:!0}),xa("userSelect",{prefix:!0}),xa("margin",{parser:qa("marginTop,marginRight,marginBottom,marginLeft")}),xa("padding",{parser:qa("paddingTop,paddingRight,paddingBottom,paddingLeft")}),xa("clip",{defaultValue:"rect(0px,0px,0px,0px)",parser:function(a,b,c,d,f,g){var h,i,j;return 9>p?(i=a.currentStyle,j=8>p?" ":",",h="rect("+i.clipTop+j+i.clipRight+j+i.clipBottom+j+i.clipLeft+")",b=this.format(b).split(",").join(j)):(h=this.format($(a,this.p,e,!1,this.dflt)),b=this.format(b)),this.parseComplex(a.style,h,b,f,g)}}),xa("textShadow",{defaultValue:"0px 0px 0px #999",color:!0,multi:!0}),xa("autoRound,strictUnits",{parser:function(a,b,c,d,e){return e}}),xa("border",{defaultValue:"0px solid #000",parser:function(a,b,c,d,f,g){var h=$(a,"borderTopWidth",e,!1,"0px"),i=this.format(b).split(" "),j=i[0].replace(w,"");return"px"!==j&&(h=parseFloat(h)/_(a,"borderTopWidth",1,j)+j),this.parseComplex(a.style,this.format(h+" "+$(a,"borderTopStyle",e,!1,"solid")+" "+$(a,"borderTopColor",e,!1,"#000")),i.join(" "),f,g)},color:!0,formatter:function(a){var b=a.split(" ");return b[0]+" "+(b[1]||"solid")+" "+(a.match(oa)||["#000"])[0]}}),xa("borderWidth",{parser:qa("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}),xa("float,cssFloat,styleFloat",{parser:function(a,b,c,d,e,f){var g=a.style,h="cssFloat"in g?"cssFloat":"styleFloat";return new sa(g,h,0,0,e,-1,c,!1,0,g[h],b)}});var Sa=function(a){var b,c=this.t,d=c.filter||$(this.data,"filter")||"",e=this.s+this.c*a|0;100===e&&(-1===d.indexOf("atrix(")&&-1===d.indexOf("radient(")&&-1===d.indexOf("oader(")?(c.removeAttribute("filter"),b=!$(this.data,"filter")):(c.filter=d.replace(z,""),b=!0)),b||(this.xn1&&(c.filter=d=d||"alpha(opacity="+e+")"),-1===d.indexOf("pacity")?0===e&&this.xn1||(c.filter=d+" alpha(opacity="+e+")"):c.filter=d.replace(x,"opacity="+e))};xa("opacity,alpha,autoAlpha",{defaultValue:"1",parser:function(a,b,c,d,f,g){var h=parseFloat($(a,"opacity",e,!1,"1")),i=a.style,j="autoAlpha"===c;return"string"==typeof b&&"="===b.charAt(1)&&(b=("-"===b.charAt(0)?-1:1)*parseFloat(b.substr(2))+h),j&&1===h&&"hidden"===$(a,"visibility",e)&&0!==b&&(h=0),T?f=new sa(i,"opacity",h,b-h,f):(f=new sa(i,"opacity",100*h,100*(b-h),f),f.xn1=j?1:0,i.zoom=1,f.type=2,f.b="alpha(opacity="+f.s+")",f.e="alpha(opacity="+(f.s+f.c)+")",f.data=a,f.plugin=g,f.setRatio=Sa),j&&(f=new sa(i,"visibility",0,0,f,-1,null,!1,0,0!==h?"inherit":"hidden",0===b?"hidden":"inherit"),f.xs0="inherit",d._overwriteProps.push(f.n),d._overwriteProps.push(c)),f}});var Ta=function(a,b){b&&(a.removeProperty?(("ms"===b.substr(0,2)||"webkit"===b.substr(0,6))&&(b="-"+b),a.removeProperty(b.replace(B,"-$1").toLowerCase())):a.removeAttribute(b))},Ua=function(a){if(this.t._gsClassPT=this,1===a||0===a){this.t.setAttribute("class",0===a?this.b:this.e);for(var b=this.data,c=this.t.style;b;)b.v?c[b.p]=b.v:Ta(c,b.p),b=b._next;1===a&&this.t._gsClassPT===this&&(this.t._gsClassPT=null)}else this.t.getAttribute("class")!==this.e&&this.t.setAttribute("class",this.e)};xa("className",{parser:function(a,b,d,f,g,h,i){var j,k,l,m,n,o=a.getAttribute("class")||"",p=a.style.cssText;if(g=f._classNamePT=new sa(a,d,0,0,g,2),g.setRatio=Ua,g.pr=-11,c=!0,g.b=o,k=ba(a,e),l=a._gsClassPT){for(m={},n=l.data;n;)m[n.p]=1,n=n._next;l.setRatio(1)}return a._gsClassPT=g,g.e="="!==b.charAt(1)?b:o.replace(new RegExp("(?:\\s|^)"+b.substr(2)+"(?![\\w-])"),"")+("+"===b.charAt(0)?" "+b.substr(2):""),a.setAttribute("class",g.e),j=ca(a,k,ba(a),i,m),a.setAttribute("class",o),g.data=j.firstMPT,a.style.cssText=p,g=g.xfirst=f.parse(a,j.difs,g,h)}});var Va=function(a){if((1===a||0===a)&&this.data._totalTime===this.data._totalDuration&&"isFromStart"!==this.data.data){var b,c,d,e,f,g=this.t.style,h=i.transform.parse;if("all"===this.e)g.cssText="",e=!0;else for(b=this.e.split(" ").join("").split(","),d=b.length;--d>-1;)c=b[d],i[c]&&(i[c].parse===h?e=!0:c="transformOrigin"===c?Da:i[c].p),Ta(g,c);e&&(Ta(g,Ba),f=this.t._gsTransform,f&&(f.svg&&(this.t.removeAttribute("data-svg-origin"),this.t.removeAttribute("transform")),delete this.t._gsTransform))}};for(xa("clearProps",{parser:function(a,b,d,e,f){return f=new sa(a,d,0,0,f,2),f.setRatio=Va,f.e=b,f.pr=-10,f.data=e._tween,c=!0,f}}),j="bezier,throwProps,physicsProps,physics2D".split(","),va=j.length;va--;)ya(j[va]);j=g.prototype,j._firstPT=j._lastParsedTransform=j._transform=null,j._onInitTween=function(a,b,h,j){if(!a.nodeType)return!1;this._target=q=a,this._tween=h,this._vars=b,r=j,k=b.autoRound,c=!1,d=b.suffixMap||g.suffixMap,e=Z(a,""),f=this._overwriteProps;var n,p,s,t,u,v,w,x,z,A=a.style;if(l&&""===A.zIndex&&(n=$(a,"zIndex",e),("auto"===n||""===n)&&this._addLazySet(A,"zIndex",0)),"string"==typeof b&&(t=A.cssText,n=ba(a,e),A.cssText=t+";"+b,n=ca(a,n,ba(a)).difs,!T&&y.test(b)&&(n.opacity=parseFloat(RegExp.$1)),b=n,A.cssText=t),b.className?this._firstPT=p=i.className.parse(a,b.className,"className",this,null,null,b):this._firstPT=p=this.parse(a,b,null),this._transformType){for(z=3===this._transformType,Ba?m&&(l=!0,""===A.zIndex&&(w=$(a,"zIndex",e),("auto"===w||""===w)&&this._addLazySet(A,"zIndex",0)),o&&this._addLazySet(A,"WebkitBackfaceVisibility",this._vars.WebkitBackfaceVisibility||(z?"visible":"hidden"))):A.zoom=1,s=p;s&&s._next;)s=s._next;x=new sa(a,"transform",0,0,null,2),this._linkCSSP(x,null,s),x.setRatio=Ba?Ra:Qa,x.data=this._transform||Pa(a,e,!0),x.tween=h,x.pr=-1,f.pop()}if(c){for(;p;){for(v=p._next,s=t;s&&s.pr>p.pr;)s=s._next;(p._prev=s?s._prev:u)?p._prev._next=p:t=p,(p._next=s)?s._prev=p:u=p,p=v}this._firstPT=t}return!0},j.parse=function(a,b,c,f){var g,h,j,l,m,n,o,p,s,t,u=a.style;for(g in b)n=b[g],"function"==typeof n&&(n=n(r,q)),h=i[g],h?c=h.parse(a,n,g,this,c,f,b):(m=$(a,g,e)+"",s="string"==typeof n,"color"===g||"fill"===g||"stroke"===g||-1!==g.indexOf("Color")||s&&A.test(n)?(s||(n=ma(n),n=(n.length>3?"rgba(":"rgb(")+n.join(",")+")"),c=ua(u,g,m,n,!0,"transparent",c,0,f)):s&&J.test(n)?c=ua(u,g,m,n,!0,null,c,0,f):(j=parseFloat(m),o=j||0===j?m.substr((j+"").length):"",(""===m||"auto"===m)&&("width"===g||"height"===g?(j=fa(a,g,e),o="px"):"left"===g||"top"===g?(j=aa(a,g,e),o="px"):(j="opacity"!==g?0:1,o="")),t=s&&"="===n.charAt(1),t?(l=parseInt(n.charAt(0)+"1",10),n=n.substr(2),l*=parseFloat(n),p=n.replace(w,"")):(l=parseFloat(n),p=s?n.replace(w,""):""),""===p&&(p=g in d?d[g]:o),n=l||0===l?(t?l+j:l)+p:b[g],o!==p&&""!==p&&(l||0===l)&&j&&(j=_(a,g,j,o),"%"===p?(j/=_(a,g,100,"%")/100,b.strictUnits!==!0&&(m=j+"%")):"em"===p||"rem"===p||"vw"===p||"vh"===p?j/=_(a,g,1,p):"px"!==p&&(l=_(a,g,l,p),p="px"),t&&(l||0===l)&&(n=l+j+p)),t&&(l+=j),!j&&0!==j||!l&&0!==l?void 0!==u[g]&&(n||n+""!="NaN"&&null!=n)?(c=new sa(u,g,l||j||0,0,c,-1,g,!1,0,m,n),c.xs0="none"!==n||"display"!==g&&-1===g.indexOf("Style")?n:m):V("invalid "+g+" tween value: "+b[g]):(c=new sa(u,g,j,l-j,c,0,g,k!==!1&&("px"===p||"zIndex"===g),0,m,n),c.xs0=p))),f&&c&&!c.plugin&&(c.plugin=f);return c},j.setRatio=function(a){var b,c,d,e=this._firstPT,f=1e-6;if(1!==a||this._tween._time!==this._tween._duration&&0!==this._tween._time)if(a||this._tween._time!==this._tween._duration&&0!==this._tween._time||this._tween._rawPrevTime===-1e-6)for(;e;){if(b=e.c*a+e.s,e.r?b=Math.round(b):f>b&&b>-f&&(b=0),e.type)if(1===e.type)if(d=e.l,2===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2;else if(3===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3;else if(4===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4;else if(5===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4+e.xn4+e.xs5;else{for(c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}else-1===e.type?e.t[e.p]=e.xs0:e.setRatio&&e.setRatio(a);else e.t[e.p]=b+e.xs0;e=e._next}else for(;e;)2!==e.type?e.t[e.p]=e.b:e.setRatio(a),e=e._next;else for(;e;){if(2!==e.type)if(e.r&&-1!==e.type)if(b=Math.round(e.s+e.c),e.type){if(1===e.type){for(d=e.l,c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}}else e.t[e.p]=b+e.xs0;else e.t[e.p]=e.e;else e.setRatio(a);e=e._next}},j._enableTransforms=function(a){this._transform=this._transform||Pa(this._target,e,!0),this._transformType=this._transform.svg&&za||!a&&3!==this._transformType?2:3};var Wa=function(a){this.t[this.p]=this.e,this.data._linkCSSP(this,this._next,null,!0)};j._addLazySet=function(a,b,c){var d=this._firstPT=new sa(a,b,0,0,this._firstPT,2);d.e=c,d.setRatio=Wa,d.data=this},j._linkCSSP=function(a,b,c,d){return a&&(b&&(b._prev=a),a._next&&(a._next._prev=a._prev),a._prev?a._prev._next=a._next:this._firstPT===a&&(this._firstPT=a._next,d=!0),c?c._next=a:d||null!==this._firstPT||(this._firstPT=a),a._next=b,a._prev=c),a},j._mod=function(a){for(var b=this._firstPT;b;)"function"==typeof a[b.p]&&a[b.p]===Math.round&&(b.r=1),b=b._next},j._kill=function(b){var c,d,e,f=b;if(b.autoAlpha||b.alpha){f={};for(d in b)f[d]=b[d];f.opacity=1,f.autoAlpha&&(f.visibility=1)}for(b.className&&(c=this._classNamePT)&&(e=c.xfirst,e&&e._prev?this._linkCSSP(e._prev,c._next,e._prev._prev):e===this._firstPT&&(this._firstPT=c._next),c._next&&this._linkCSSP(c._next,c._next._next,e._prev),this._classNamePT=null),c=this._firstPT;c;)c.plugin&&c.plugin!==d&&c.plugin._kill&&(c.plugin._kill(b),d=c.plugin),c=c._next;return a.prototype._kill.call(this,f)};var Xa=function(a,b,c){var d,e,f,g;if(a.slice)for(e=a.length;--e>-1;)Xa(a[e],b,c);else for(d=a.childNodes,e=d.length;--e>-1;)f=d[e],g=f.type,f.style&&(b.push(ba(f)),c&&c.push(f)),1!==g&&9!==g&&11!==g||!f.childNodes.length||Xa(f,b,c)};return g.cascadeTo=function(a,c,d){var e,f,g,h,i=b.to(a,c,d),j=[i],k=[],l=[],m=[],n=b._internals.reservedProps;for(a=i._targets||i.target,Xa(a,k,m),i.render(c,!0,!0),Xa(a,l),i.render(0,!0,!0),i._enabled(!0),e=m.length;--e>-1;)if(f=ca(m[e],k[e],l[e]),f.firstMPT){f=f.difs;for(g in d)n[g]&&(f[g]=d[g]);h={};for(g in f)h[g]=k[e][g];j.push(b.fromTo(m[e],c,h,f))}return j},a.activate([g]),g},!0),function(){var a=_gsScope._gsDefine.plugin({propName:"roundProps",version:"1.6.0",priority:-1,API:2,init:function(a,b,c){return this._tween=c,!0}}),b=function(a){for(;a;)a.f||a.blob||(a.m=Math.round),a=a._next},c=a.prototype;c._onInitAllProps=function(){for(var a,c,d,e=this._tween,f=e.vars.roundProps.join?e.vars.roundProps:e.vars.roundProps.split(","),g=f.length,h={},i=e._propLookup.roundProps;--g>-1;)h[f[g]]=Math.round;for(g=f.length;--g>-1;)for(a=f[g],c=e._firstPT;c;)d=c._next,c.pg?c.t._mod(h):c.n===a&&(2===c.f&&c.t?b(c.t._firstPT):(this._add(c.t,a,c.s,c.c),d&&(d._prev=c._prev),c._prev?c._prev._next=d:e._firstPT===c&&(e._firstPT=d),c._next=c._prev=null,e._propLookup[a]=i)),c=d;return!1},c._add=function(a,b,c,d){this._addTween(a,b,c,c+d,b,Math.round),this._overwriteProps.push(b)}}(),function(){_gsScope._gsDefine.plugin({propName:"attr",API:2,version:"0.6.0",init:function(a,b,c,d){var e,f;if("function"!=typeof a.setAttribute)return!1;for(e in b)f=b[e],"function"==typeof f&&(f=f(d,a)),this._addTween(a,"setAttribute",a.getAttribute(e)+"",f+"",e,!1,e),this._overwriteProps.push(e);return!0}})}(),_gsScope._gsDefine.plugin({propName:"directionalRotation",version:"0.3.0",API:2,init:function(a,b,c,d){"object"!=typeof b&&(b={rotation:b}),this.finals={};var e,f,g,h,i,j,k=b.useRadians===!0?2*Math.PI:360,l=1e-6;for(e in b)"useRadians"!==e&&(h=b[e],"function"==typeof h&&(h=h(d,a)),j=(h+"").split("_"),f=j[0],g=parseFloat("function"!=typeof a[e]?a[e]:a[e.indexOf("set")||"function"!=typeof a["get"+e.substr(3)]?e:"get"+e.substr(3)]()),h=this.finals[e]="string"==typeof f&&"="===f.charAt(1)?g+parseInt(f.charAt(0)+"1",10)*Number(f.substr(2)):Number(f)||0,i=h-g,j.length&&(f=j.join("_"),-1!==f.indexOf("short")&&(i%=k,i!==i%(k/2)&&(i=0>i?i+k:i-k)),-1!==f.indexOf("_cw")&&0>i?i=(i+9999999999*k)%k-(i/k|0)*k:-1!==f.indexOf("ccw")&&i>0&&(i=(i-9999999999*k)%k-(i/k|0)*k)),(i>l||-l>i)&&(this._addTween(a,e,g,g+i,e),this._overwriteProps.push(e)));return!0},set:function(a){var b;if(1!==a)this._super.setRatio.call(this,a);else for(b=this._firstPT;b;)b.f?b.t[b.p](this.finals[b.p]):b.t[b.p]=this.finals[b.p],b=b._next}})._autoCSS=!0,_gsScope._gsDefine("easing.Back",["easing.Ease"],function(a){var b,c,d,e=_gsScope.GreenSockGlobals||_gsScope,f=e.com.greensock,g=2*Math.PI,h=Math.PI/2,i=f._class,j=function(b,c){var d=i("easing."+b,function(){},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,d},k=a.register||function(){},l=function(a,b,c,d,e){var f=i("easing."+a,{easeOut:new b,easeIn:new c,easeInOut:new d},!0);return k(f,a),f},m=function(a,b,c){this.t=a,this.v=b,c&&(this.next=c,c.prev=this,this.c=c.v-b,this.gap=c.t-a)},n=function(b,c){var d=i("easing."+b,function(a){this._p1=a||0===a?a:1.70158,this._p2=1.525*this._p1},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,e.config=function(a){return new d(a)},d},o=l("Back",n("BackOut",function(a){return(a-=1)*a*((this._p1+1)*a+this._p1)+1}),n("BackIn",function(a){return a*a*((this._p1+1)*a-this._p1)}),n("BackInOut",function(a){return(a*=2)<1?.5*a*a*((this._p2+1)*a-this._p2):.5*((a-=2)*a*((this._p2+1)*a+this._p2)+2)})),p=i("easing.SlowMo",function(a,b,c){b=b||0===b?b:.7,null==a?a=.7:a>1&&(a=1),this._p=1!==a?b:0,this._p1=(1-a)/2,this._p2=a,this._p3=this._p1+this._p2,this._calcEnd=c===!0},!0),q=p.prototype=new a;return q.constructor=p,q.getRatio=function(a){var b=a+(.5-a)*this._p;return a<this._p1?this._calcEnd?1-(a=1-a/this._p1)*a:b-(a=1-a/this._p1)*a*a*a*b:a>this._p3?this._calcEnd?1-(a=(a-this._p3)/this._p1)*a:b+(a-b)*(a=(a-this._p3)/this._p1)*a*a*a:this._calcEnd?1:b},p.ease=new p(.7,.7),q.config=p.config=function(a,b,c){return new p(a,b,c)},b=i("easing.SteppedEase",function(a){a=a||1,this._p1=1/a,this._p2=a+1},!0),q=b.prototype=new a,q.constructor=b,q.getRatio=function(a){return 0>a?a=0:a>=1&&(a=.999999999),(this._p2*a>>0)*this._p1},q.config=b.config=function(a){return new b(a)},c=i("easing.RoughEase",function(b){b=b||{};for(var c,d,e,f,g,h,i=b.taper||"none",j=[],k=0,l=0|(b.points||20),n=l,o=b.randomize!==!1,p=b.clamp===!0,q=b.template instanceof a?b.template:null,r="number"==typeof b.strength?.4*b.strength:.4;--n>-1;)c=o?Math.random():1/l*n,d=q?q.getRatio(c):c,"none"===i?e=r:"out"===i?(f=1-c,e=f*f*r):"in"===i?e=c*c*r:.5>c?(f=2*c,e=f*f*.5*r):(f=2*(1-c),e=f*f*.5*r),o?d+=Math.random()*e-.5*e:n%2?d+=.5*e:d-=.5*e,p&&(d>1?d=1:0>d&&(d=0)),j[k++]={x:c,y:d};for(j.sort(function(a,b){return a.x-b.x}),h=new m(1,1,null),n=l;--n>-1;)g=j[n],h=new m(g.x,g.y,h);this._prev=new m(0,0,0!==h.t?h:h.next)},!0),q=c.prototype=new a,q.constructor=c,q.getRatio=function(a){var b=this._prev;if(a>b.t){for(;b.next&&a>=b.t;)b=b.next;b=b.prev}else for(;b.prev&&a<=b.t;)b=b.prev;return this._prev=b,b.v+(a-b.t)/b.gap*b.c},q.config=function(a){return new c(a)},c.ease=new c,l("Bounce",j("BounceOut",function(a){return 1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375}),j("BounceIn",function(a){return(a=1-a)<1/2.75?1-7.5625*a*a:2/2.75>a?1-(7.5625*(a-=1.5/2.75)*a+.75):2.5/2.75>a?1-(7.5625*(a-=2.25/2.75)*a+.9375):1-(7.5625*(a-=2.625/2.75)*a+.984375)}),j("BounceInOut",function(a){var b=.5>a;return a=b?1-2*a:2*a-1,a=1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375,b?.5*(1-a):.5*a+.5})),l("Circ",j("CircOut",function(a){return Math.sqrt(1-(a-=1)*a)}),j("CircIn",function(a){return-(Math.sqrt(1-a*a)-1)}),j("CircInOut",function(a){return(a*=2)<1?-.5*(Math.sqrt(1-a*a)-1):.5*(Math.sqrt(1-(a-=2)*a)+1)})),d=function(b,c,d){var e=i("easing."+b,function(a,b){this._p1=a>=1?a:1,this._p2=(b||d)/(1>a?a:1),this._p3=this._p2/g*(Math.asin(1/this._p1)||0),this._p2=g/this._p2},!0),f=e.prototype=new a;return f.constructor=e,f.getRatio=c,f.config=function(a,b){return new e(a,b)},e},l("Elastic",d("ElasticOut",function(a){return this._p1*Math.pow(2,-10*a)*Math.sin((a-this._p3)*this._p2)+1},.3),d("ElasticIn",function(a){return-(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2))},.3),d("ElasticInOut",function(a){return(a*=2)<1?-.5*(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2)):this._p1*Math.pow(2,-10*(a-=1))*Math.sin((a-this._p3)*this._p2)*.5+1},.45)),l("Expo",j("ExpoOut",function(a){return 1-Math.pow(2,-10*a)}),j("ExpoIn",function(a){return Math.pow(2,10*(a-1))-.001}),j("ExpoInOut",function(a){return(a*=2)<1?.5*Math.pow(2,10*(a-1)):.5*(2-Math.pow(2,-10*(a-1)))})),l("Sine",j("SineOut",function(a){return Math.sin(a*h)}),j("SineIn",function(a){return-Math.cos(a*h)+1}),j("SineInOut",function(a){return-.5*(Math.cos(Math.PI*a)-1)})),i("easing.EaseLookup",{find:function(b){return a.map[b]}},!0),k(e.SlowMo,"SlowMo","ease,"),k(c,"RoughEase","ease,"),k(b,"SteppedEase","ease,"),o},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(a,b){"use strict";var c={},d=a.GreenSockGlobals=a.GreenSockGlobals||a;if(!d.TweenLite){var e,f,g,h,i,j=function(a){var b,c=a.split("."),e=d;for(b=0;b<c.length;b++)e[c[b]]=e=e[c[b]]||{};return e},k=j("com.greensock"),l=1e-10,m=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},n=function(){},o=function(){var a=Object.prototype.toString,b=a.call([]);return function(c){return null!=c&&(c instanceof Array||"object"==typeof c&&!!c.push&&a.call(c)===b)}}(),p={},q=function(e,f,g,h){this.sc=p[e]?p[e].sc:[],p[e]=this,this.gsClass=null,this.func=g;var i=[];this.check=function(k){for(var l,m,n,o,r,s=f.length,t=s;--s>-1;)(l=p[f[s]]||new q(f[s],[])).gsClass?(i[s]=l.gsClass,t--):k&&l.sc.push(this);if(0===t&&g){if(m=("com.greensock."+e).split("."),n=m.pop(),o=j(m.join("."))[n]=this.gsClass=g.apply(g,i),h)if(d[n]=c[n]=o,r="undefined"!=typeof module&&module.exports,!r&&"function"=="function"&&__webpack_require__(15))!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return o}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if(r)if(e===b){module.exports=c[b]=o;for(s in c)o[s]=c[s]}else c[b]&&(c[b][n]=o);for(s=0;s<this.sc.length;s++)this.sc[s].check()}},this.check(!0)},r=a._gsDefine=function(a,b,c,d){return new q(a,b,c,d)},s=k._class=function(a,b,c){return b=b||function(){},r(a,[],function(){return b},c),b};r.globals=d;var t=[0,0,1,1],u=s("easing.Ease",function(a,b,c,d){this._func=a,this._type=c||0,this._power=d||0,this._params=b?t.concat(b):t},!0),v=u.map={},w=u.register=function(a,b,c,d){for(var e,f,g,h,i=b.split(","),j=i.length,l=(c||"easeIn,easeOut,easeInOut").split(",");--j>-1;)for(f=i[j],e=d?s("easing."+f,null,!0):k.easing[f]||{},g=l.length;--g>-1;)h=l[g],v[f+"."+h]=v[h+f]=e[h]=a.getRatio?a:a[h]||new a};for(g=u.prototype,g._calcEnd=!1,g.getRatio=function(a){if(this._func)return this._params[0]=a,this._func.apply(null,this._params);var b=this._type,c=this._power,d=1===b?1-a:2===b?a:.5>a?2*a:2*(1-a);return 1===c?d*=d:2===c?d*=d*d:3===c?d*=d*d*d:4===c&&(d*=d*d*d*d),1===b?1-d:2===b?d:.5>a?d/2:1-d/2},e=["Linear","Quad","Cubic","Quart","Quint,Strong"],f=e.length;--f>-1;)g=e[f]+",Power"+f,w(new u(null,null,1,f),g,"easeOut",!0),w(new u(null,null,2,f),g,"easeIn"+(0===f?",easeNone":"")),w(new u(null,null,3,f),g,"easeInOut");v.linear=k.easing.Linear.easeIn,v.swing=k.easing.Quad.easeInOut;var x=s("events.EventDispatcher",function(a){this._listeners={},this._eventTarget=a||this});g=x.prototype,g.addEventListener=function(a,b,c,d,e){e=e||0;var f,g,j=this._listeners[a],k=0;for(this!==h||i||h.wake(),null==j&&(this._listeners[a]=j=[]),g=j.length;--g>-1;)f=j[g],f.c===b&&f.s===c?j.splice(g,1):0===k&&f.pr<e&&(k=g+1);j.splice(k,0,{c:b,s:c,up:d,pr:e})},g.removeEventListener=function(a,b){var c,d=this._listeners[a];if(d)for(c=d.length;--c>-1;)if(d[c].c===b)return void d.splice(c,1)},g.dispatchEvent=function(a){var b,c,d,e=this._listeners[a];if(e)for(b=e.length,b>1&&(e=e.slice(0)),c=this._eventTarget;--b>-1;)d=e[b],d&&(d.up?d.c.call(d.s||c,{type:a,target:c}):d.c.call(d.s||c))};var y=a.requestAnimationFrame,z=a.cancelAnimationFrame,A=Date.now||function(){return(new Date).getTime()},B=A();for(e=["ms","moz","webkit","o"],f=e.length;--f>-1&&!y;)y=a[e[f]+"RequestAnimationFrame"],z=a[e[f]+"CancelAnimationFrame"]||a[e[f]+"CancelRequestAnimationFrame"];s("Ticker",function(a,b){var c,d,e,f,g,j=this,k=A(),m=b!==!1&&y?"auto":!1,o=500,p=33,q="tick",r=function(a){var b,h,i=A()-B;i>o&&(k+=i-p),B+=i,j.time=(B-k)/1e3,b=j.time-g,(!c||b>0||a===!0)&&(j.frame++,g+=b+(b>=f?.004:f-b),h=!0),a!==!0&&(e=d(r)),h&&j.dispatchEvent(q)};x.call(j),j.time=j.frame=0,j.tick=function(){r(!0)},j.lagSmoothing=function(a,b){o=a||1/l,p=Math.min(b,o,0)},j.sleep=function(){null!=e&&(m&&z?z(e):clearTimeout(e),d=n,e=null,j===h&&(i=!1))},j.wake=function(a){null!==e?j.sleep():a?k+=-B+(B=A()):j.frame>10&&(B=A()-o+5),d=0===c?n:m&&y?y:function(a){return setTimeout(a,1e3*(g-j.time)+1|0)},j===h&&(i=!0),r(2)},j.fps=function(a){return arguments.length?(c=a,f=1/(c||60),g=this.time+f,void j.wake()):c},j.useRAF=function(a){return arguments.length?(j.sleep(),m=a,void j.fps(c)):m},j.fps(a),setTimeout(function(){"auto"===m&&j.frame<5&&"hidden"!==document.visibilityState&&j.useRAF(!1)},1500)}),g=k.Ticker.prototype=new k.events.EventDispatcher,g.constructor=k.Ticker;var C=s("core.Animation",function(a,b){if(this.vars=b=b||{},this._duration=this._totalDuration=a||0,this._delay=Number(b.delay)||0,this._timeScale=1,this._active=b.immediateRender===!0,this.data=b.data,this._reversed=b.reversed===!0,V){i||h.wake();var c=this.vars.useFrames?U:V;c.add(this,c._time),this.vars.paused&&this.paused(!0)}});h=C.ticker=new k.Ticker,g=C.prototype,g._dirty=g._gc=g._initted=g._paused=!1,g._totalTime=g._time=0,g._rawPrevTime=-1,g._next=g._last=g._onUpdate=g._timeline=g.timeline=null,g._paused=!1;var D=function(){i&&A()-B>2e3&&h.wake(),setTimeout(D,2e3)};D(),g.play=function(a,b){return null!=a&&this.seek(a,b),this.reversed(!1).paused(!1)},g.pause=function(a,b){return null!=a&&this.seek(a,b),this.paused(!0)},g.resume=function(a,b){return null!=a&&this.seek(a,b),this.paused(!1)},g.seek=function(a,b){return this.totalTime(Number(a),b!==!1)},g.restart=function(a,b){return this.reversed(!1).paused(!1).totalTime(a?-this._delay:0,b!==!1,!0)},g.reverse=function(a,b){return null!=a&&this.seek(a||this.totalDuration(),b),this.reversed(!0).paused(!1)},g.render=function(a,b,c){},g.invalidate=function(){return this._time=this._totalTime=0,this._initted=this._gc=!1,this._rawPrevTime=-1,(this._gc||!this.timeline)&&this._enabled(!0),this},g.isActive=function(){var a,b=this._timeline,c=this._startTime;return!b||!this._gc&&!this._paused&&b.isActive()&&(a=b.rawTime())>=c&&a<c+this.totalDuration()/this._timeScale},g._enabled=function(a,b){return i||h.wake(),this._gc=!a,this._active=this.isActive(),b!==!0&&(a&&!this.timeline?this._timeline.add(this,this._startTime-this._delay):!a&&this.timeline&&this._timeline._remove(this,!0)),!1},g._kill=function(a,b){return this._enabled(!1,!1)},g.kill=function(a,b){return this._kill(a,b),this},g._uncache=function(a){for(var b=a?this:this.timeline;b;)b._dirty=!0,b=b.timeline;return this},g._swapSelfInParams=function(a){for(var b=a.length,c=a.concat();--b>-1;)"{self}"===a[b]&&(c[b]=this);return c},g._callback=function(a){var b=this.vars,c=b[a],d=b[a+"Params"],e=b[a+"Scope"]||b.callbackScope||this,f=d?d.length:0;switch(f){case 0:c.call(e);break;case 1:c.call(e,d[0]);break;case 2:c.call(e,d[0],d[1]);break;default:c.apply(e,d)}},g.eventCallback=function(a,b,c,d){if("on"===(a||"").substr(0,2)){var e=this.vars;if(1===arguments.length)return e[a];null==b?delete e[a]:(e[a]=b,e[a+"Params"]=o(c)&&-1!==c.join("").indexOf("{self}")?this._swapSelfInParams(c):c,e[a+"Scope"]=d),"onUpdate"===a&&(this._onUpdate=b)}return this},g.delay=function(a){return arguments.length?(this._timeline.smoothChildTiming&&this.startTime(this._startTime+a-this._delay),this._delay=a,this):this._delay},g.duration=function(a){return arguments.length?(this._duration=this._totalDuration=a,this._uncache(!0),this._timeline.smoothChildTiming&&this._time>0&&this._time<this._duration&&0!==a&&this.totalTime(this._totalTime*(a/this._duration),!0),this):(this._dirty=!1,this._duration)},g.totalDuration=function(a){return this._dirty=!1,arguments.length?this.duration(a):this._totalDuration},g.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),this.totalTime(a>this._duration?this._duration:a,b)):this._time},g.totalTime=function(a,b,c){if(i||h.wake(),!arguments.length)return this._totalTime;if(this._timeline){if(0>a&&!c&&(a+=this.totalDuration()),this._timeline.smoothChildTiming){this._dirty&&this.totalDuration();var d=this._totalDuration,e=this._timeline;if(a>d&&!c&&(a=d),this._startTime=(this._paused?this._pauseTime:e._time)-(this._reversed?d-a:a)/this._timeScale,e._dirty||this._uncache(!1),e._timeline)for(;e._timeline;)e._timeline._time!==(e._startTime+e._totalTime)/e._timeScale&&e.totalTime(e._totalTime,!0),e=e._timeline}this._gc&&this._enabled(!0,!1),(this._totalTime!==a||0===this._duration)&&(I.length&&X(),this.render(a,b,!1),I.length&&X())}return this},g.progress=g.totalProgress=function(a,b){var c=this.duration();return arguments.length?this.totalTime(c*a,b):c?this._time/c:this.ratio},g.startTime=function(a){return arguments.length?(a!==this._startTime&&(this._startTime=a,this.timeline&&this.timeline._sortChildren&&this.timeline.add(this,a-this._delay)),this):this._startTime},g.endTime=function(a){return this._startTime+(0!=a?this.totalDuration():this.duration())/this._timeScale},g.timeScale=function(a){if(!arguments.length)return this._timeScale;if(a=a||l,this._timeline&&this._timeline.smoothChildTiming){var b=this._pauseTime,c=b||0===b?b:this._timeline.totalTime();this._startTime=c-(c-this._startTime)*this._timeScale/a}return this._timeScale=a,this._uncache(!1)},g.reversed=function(a){return arguments.length?(a!=this._reversed&&(this._reversed=a,this.totalTime(this._timeline&&!this._timeline.smoothChildTiming?this.totalDuration()-this._totalTime:this._totalTime,!0)),this):this._reversed},g.paused=function(a){if(!arguments.length)return this._paused;var b,c,d=this._timeline;return a!=this._paused&&d&&(i||a||h.wake(),b=d.rawTime(),c=b-this._pauseTime,!a&&d.smoothChildTiming&&(this._startTime+=c,this._uncache(!1)),this._pauseTime=a?b:null,this._paused=a,this._active=this.isActive(),!a&&0!==c&&this._initted&&this.duration()&&(b=d.smoothChildTiming?this._totalTime:(b-this._startTime)/this._timeScale,this.render(b,b===this._totalTime,!0))),this._gc&&!a&&this._enabled(!0,!1),this};var E=s("core.SimpleTimeline",function(a){C.call(this,0,a),this.autoRemoveChildren=this.smoothChildTiming=!0});g=E.prototype=new C,g.constructor=E,g.kill()._gc=!1,g._first=g._last=g._recent=null,g._sortChildren=!1,g.add=g.insert=function(a,b,c,d){var e,f;if(a._startTime=Number(b||0)+a._delay,a._paused&&this!==a._timeline&&(a._pauseTime=a._startTime+(this.rawTime()-a._startTime)/a._timeScale),a.timeline&&a.timeline._remove(a,!0),a.timeline=a._timeline=this,a._gc&&a._enabled(!0,!0),e=this._last,this._sortChildren)for(f=a._startTime;e&&e._startTime>f;)e=e._prev;return e?(a._next=e._next,e._next=a):(a._next=this._first,this._first=a),a._next?a._next._prev=a:this._last=a,a._prev=e,this._recent=a,this._timeline&&this._uncache(!0),this},g._remove=function(a,b){return a.timeline===this&&(b||a._enabled(!1,!0),a._prev?a._prev._next=a._next:this._first===a&&(this._first=a._next),a._next?a._next._prev=a._prev:this._last===a&&(this._last=a._prev),a._next=a._prev=a.timeline=null,a===this._recent&&(this._recent=this._last),this._timeline&&this._uncache(!0)),this},g.render=function(a,b,c){var d,e=this._first;for(this._totalTime=this._time=this._rawPrevTime=a;e;)d=e._next,(e._active||a>=e._startTime&&!e._paused)&&(e._reversed?e.render((e._dirty?e.totalDuration():e._totalDuration)-(a-e._startTime)*e._timeScale,b,c):e.render((a-e._startTime)*e._timeScale,b,c)),e=d},g.rawTime=function(){return i||h.wake(),this._totalTime};var F=s("TweenLite",function(b,c,d){if(C.call(this,c,d),this.render=F.prototype.render,null==b)throw"Cannot tween a null target.";this.target=b="string"!=typeof b?b:F.selector(b)||b;var e,f,g,h=b.jquery||b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType),i=this.vars.overwrite;if(this._overwrite=i=null==i?T[F.defaultOverwrite]:"number"==typeof i?i>>0:T[i],(h||b instanceof Array||b.push&&o(b))&&"number"!=typeof b[0])for(this._targets=g=m(b),this._propLookup=[],this._siblings=[],e=0;e<g.length;e++)f=g[e],f?"string"!=typeof f?f.length&&f!==a&&f[0]&&(f[0]===a||f[0].nodeType&&f[0].style&&!f.nodeType)?(g.splice(e--,1),this._targets=g=g.concat(m(f))):(this._siblings[e]=Y(f,this,!1),1===i&&this._siblings[e].length>1&&$(f,this,null,1,this._siblings[e])):(f=g[e--]=F.selector(f),"string"==typeof f&&g.splice(e+1,1)):g.splice(e--,1);else this._propLookup={},this._siblings=Y(b,this,!1),1===i&&this._siblings.length>1&&$(b,this,null,1,this._siblings);(this.vars.immediateRender||0===c&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-l,this.render(Math.min(0,-this._delay)))},!0),G=function(b){return b&&b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType);
	},H=function(a,b){var c,d={};for(c in a)S[c]||c in b&&"transform"!==c&&"x"!==c&&"y"!==c&&"width"!==c&&"height"!==c&&"className"!==c&&"border"!==c||!(!P[c]||P[c]&&P[c]._autoCSS)||(d[c]=a[c],delete a[c]);a.css=d};g=F.prototype=new C,g.constructor=F,g.kill()._gc=!1,g.ratio=0,g._firstPT=g._targets=g._overwrittenProps=g._startAt=null,g._notifyPluginsOfEnabled=g._lazy=!1,F.version="1.19.0",F.defaultEase=g._ease=new u(null,null,1,1),F.defaultOverwrite="auto",F.ticker=h,F.autoSleep=120,F.lagSmoothing=function(a,b){h.lagSmoothing(a,b)},F.selector=a.$||a.jQuery||function(b){var c=a.$||a.jQuery;return c?(F.selector=c,c(b)):"undefined"==typeof document?b:document.querySelectorAll?document.querySelectorAll(b):document.getElementById("#"===b.charAt(0)?b.substr(1):b)};var I=[],J={},K=/(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,L=function(a){for(var b,c=this._firstPT,d=1e-6;c;)b=c.blob?a?this.join(""):this.start:c.c*a+c.s,c.m?b=c.m(b,this._target||c.t):d>b&&b>-d&&(b=0),c.f?c.fp?c.t[c.p](c.fp,b):c.t[c.p](b):c.t[c.p]=b,c=c._next},M=function(a,b,c,d){var e,f,g,h,i,j,k,l=[a,b],m=0,n="",o=0;for(l.start=a,c&&(c(l),a=l[0],b=l[1]),l.length=0,e=a.match(K)||[],f=b.match(K)||[],d&&(d._next=null,d.blob=1,l._firstPT=l._applyPT=d),i=f.length,h=0;i>h;h++)k=f[h],j=b.substr(m,b.indexOf(k,m)-m),n+=j||!h?j:",",m+=j.length,o?o=(o+1)%5:"rgba("===j.substr(-5)&&(o=1),k===e[h]||e.length<=h?n+=k:(n&&(l.push(n),n=""),g=parseFloat(e[h]),l.push(g),l._firstPT={_next:l._firstPT,t:l,p:l.length-1,s:g,c:("="===k.charAt(1)?parseInt(k.charAt(0)+"1",10)*parseFloat(k.substr(2)):parseFloat(k)-g)||0,f:0,m:o&&4>o?Math.round:0}),m+=k.length;return n+=b.substr(m),n&&l.push(n),l.setRatio=L,l},N=function(a,b,c,d,e,f,g,h,i){"function"==typeof d&&(d=d(i||0,a));var j,k,l="get"===c?a[b]:c,m=typeof a[b],n="string"==typeof d&&"="===d.charAt(1),o={t:a,p:b,s:l,f:"function"===m,pg:0,n:e||b,m:f?"function"==typeof f?f:Math.round:0,pr:0,c:n?parseInt(d.charAt(0)+"1",10)*parseFloat(d.substr(2)):parseFloat(d)-l||0};return"number"!==m&&("function"===m&&"get"===c&&(k=b.indexOf("set")||"function"!=typeof a["get"+b.substr(3)]?b:"get"+b.substr(3),o.s=l=g?a[k](g):a[k]()),"string"==typeof l&&(g||isNaN(l))?(o.fp=g,j=M(l,d,h||F.defaultStringFilter,o),o={t:j,p:"setRatio",s:0,c:1,f:2,pg:0,n:e||b,pr:0,m:0}):n||(o.s=parseFloat(l),o.c=parseFloat(d)-o.s||0)),o.c?((o._next=this._firstPT)&&(o._next._prev=o),this._firstPT=o,o):void 0},O=F._internals={isArray:o,isSelector:G,lazyTweens:I,blobDif:M},P=F._plugins={},Q=O.tweenLookup={},R=0,S=O.reservedProps={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,immediateRender:1,repeat:1,repeatDelay:1,data:1,paused:1,reversed:1,autoCSS:1,lazy:1,onOverwrite:1,callbackScope:1,stringFilter:1,id:1},T={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},U=C._rootFramesTimeline=new E,V=C._rootTimeline=new E,W=30,X=O.lazyRender=function(){var a,b=I.length;for(J={};--b>-1;)a=I[b],a&&a._lazy!==!1&&(a.render(a._lazy[0],a._lazy[1],!0),a._lazy=!1);I.length=0};V._startTime=h.time,U._startTime=h.frame,V._active=U._active=!0,setTimeout(X,1),C._updateRoot=F.render=function(){var a,b,c;if(I.length&&X(),V.render((h.time-V._startTime)*V._timeScale,!1,!1),U.render((h.frame-U._startTime)*U._timeScale,!1,!1),I.length&&X(),h.frame>=W){W=h.frame+(parseInt(F.autoSleep,10)||120);for(c in Q){for(b=Q[c].tweens,a=b.length;--a>-1;)b[a]._gc&&b.splice(a,1);0===b.length&&delete Q[c]}if(c=V._first,(!c||c._paused)&&F.autoSleep&&!U._first&&1===h._listeners.tick.length){for(;c&&c._paused;)c=c._next;c||h.sleep()}}},h.addEventListener("tick",C._updateRoot);var Y=function(a,b,c){var d,e,f=a._gsTweenID;if(Q[f||(a._gsTweenID=f="t"+R++)]||(Q[f]={target:a,tweens:[]}),b&&(d=Q[f].tweens,d[e=d.length]=b,c))for(;--e>-1;)d[e]===b&&d.splice(e,1);return Q[f].tweens},Z=function(a,b,c,d){var e,f,g=a.vars.onOverwrite;return g&&(e=g(a,b,c,d)),g=F.onOverwrite,g&&(f=g(a,b,c,d)),e!==!1&&f!==!1},$=function(a,b,c,d,e){var f,g,h,i;if(1===d||d>=4){for(i=e.length,f=0;i>f;f++)if((h=e[f])!==b)h._gc||h._kill(null,a,b)&&(g=!0);else if(5===d)break;return g}var j,k=b._startTime+l,m=[],n=0,o=0===b._duration;for(f=e.length;--f>-1;)(h=e[f])===b||h._gc||h._paused||(h._timeline!==b._timeline?(j=j||_(b,0,o),0===_(h,j,o)&&(m[n++]=h)):h._startTime<=k&&h._startTime+h.totalDuration()/h._timeScale>k&&((o||!h._initted)&&k-h._startTime<=2e-10||(m[n++]=h)));for(f=n;--f>-1;)if(h=m[f],2===d&&h._kill(c,a,b)&&(g=!0),2!==d||!h._firstPT&&h._initted){if(2!==d&&!Z(h,b))continue;h._enabled(!1,!1)&&(g=!0)}return g},_=function(a,b,c){for(var d=a._timeline,e=d._timeScale,f=a._startTime;d._timeline;){if(f+=d._startTime,e*=d._timeScale,d._paused)return-100;d=d._timeline}return f/=e,f>b?f-b:c&&f===b||!a._initted&&2*l>f-b?l:(f+=a.totalDuration()/a._timeScale/e)>b+l?0:f-b-l};g._init=function(){var a,b,c,d,e,f,g=this.vars,h=this._overwrittenProps,i=this._duration,j=!!g.immediateRender,k=g.ease;if(g.startAt){this._startAt&&(this._startAt.render(-1,!0),this._startAt.kill()),e={};for(d in g.startAt)e[d]=g.startAt[d];if(e.overwrite=!1,e.immediateRender=!0,e.lazy=j&&g.lazy!==!1,e.startAt=e.delay=null,this._startAt=F.to(this.target,0,e),j)if(this._time>0)this._startAt=null;else if(0!==i)return}else if(g.runBackwards&&0!==i)if(this._startAt)this._startAt.render(-1,!0),this._startAt.kill(),this._startAt=null;else{0!==this._time&&(j=!1),c={};for(d in g)S[d]&&"autoCSS"!==d||(c[d]=g[d]);if(c.overwrite=0,c.data="isFromStart",c.lazy=j&&g.lazy!==!1,c.immediateRender=j,this._startAt=F.to(this.target,0,c),j){if(0===this._time)return}else this._startAt._init(),this._startAt._enabled(!1),this.vars.immediateRender&&(this._startAt=null)}if(this._ease=k=k?k instanceof u?k:"function"==typeof k?new u(k,g.easeParams):v[k]||F.defaultEase:F.defaultEase,g.easeParams instanceof Array&&k.config&&(this._ease=k.config.apply(k,g.easeParams)),this._easeType=this._ease._type,this._easePower=this._ease._power,this._firstPT=null,this._targets)for(f=this._targets.length,a=0;f>a;a++)this._initProps(this._targets[a],this._propLookup[a]={},this._siblings[a],h?h[a]:null,a)&&(b=!0);else b=this._initProps(this.target,this._propLookup,this._siblings,h,0);if(b&&F._onPluginEvent("_onInitAllProps",this),h&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1,!1)),g.runBackwards)for(c=this._firstPT;c;)c.s+=c.c,c.c=-c.c,c=c._next;this._onUpdate=g.onUpdate,this._initted=!0},g._initProps=function(b,c,d,e,f){var g,h,i,j,k,l;if(null==b)return!1;J[b._gsTweenID]&&X(),this.vars.css||b.style&&b!==a&&b.nodeType&&P.css&&this.vars.autoCSS!==!1&&H(this.vars,b);for(g in this.vars)if(l=this.vars[g],S[g])l&&(l instanceof Array||l.push&&o(l))&&-1!==l.join("").indexOf("{self}")&&(this.vars[g]=l=this._swapSelfInParams(l,this));else if(P[g]&&(j=new P[g])._onInitTween(b,this.vars[g],this,f)){for(this._firstPT=k={_next:this._firstPT,t:j,p:"setRatio",s:0,c:1,f:1,n:g,pg:1,pr:j._priority,m:0},h=j._overwriteProps.length;--h>-1;)c[j._overwriteProps[h]]=this._firstPT;(j._priority||j._onInitAllProps)&&(i=!0),(j._onDisable||j._onEnable)&&(this._notifyPluginsOfEnabled=!0),k._next&&(k._next._prev=k)}else c[g]=N.call(this,b,g,"get",l,g,0,null,this.vars.stringFilter,f);return e&&this._kill(e,b)?this._initProps(b,c,d,e,f):this._overwrite>1&&this._firstPT&&d.length>1&&$(b,this,c,this._overwrite,d)?(this._kill(c,b),this._initProps(b,c,d,e,f)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(J[b._gsTweenID]=!0),i)},g.render=function(a,b,c){var d,e,f,g,h=this._time,i=this._duration,j=this._rawPrevTime;if(a>=i-1e-7)this._totalTime=this._time=i,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(d=!0,e="onComplete",c=c||this._timeline.autoRemoveChildren),0===i&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0),(0>j||0>=a&&a>=-1e-7||j===l&&"isPause"!==this.data)&&j!==a&&(c=!0,j>l&&(e="onReverseComplete")),this._rawPrevTime=g=!b||a||j===a?a:l);else if(1e-7>a)this._totalTime=this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==h||0===i&&j>0)&&(e="onReverseComplete",d=this._reversed),0>a&&(this._active=!1,0===i&&(this._initted||!this.vars.lazy||c)&&(j>=0&&(j!==l||"isPause"!==this.data)&&(c=!0),this._rawPrevTime=g=!b||a||j===a?a:l)),this._initted||(c=!0);else if(this._totalTime=this._time=a,this._easeType){var k=a/i,m=this._easeType,n=this._easePower;(1===m||3===m&&k>=.5)&&(k=1-k),3===m&&(k*=2),1===n?k*=k:2===n?k*=k*k:3===n?k*=k*k*k:4===n&&(k*=k*k*k*k),1===m?this.ratio=1-k:2===m?this.ratio=k:.5>a/i?this.ratio=k/2:this.ratio=1-k/2}else this.ratio=this._ease.getRatio(a/i);if(this._time!==h||c){if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=this._totalTime=h,this._rawPrevTime=j,I.push(this),void(this._lazy=[a,b]);this._time&&!d?this.ratio=this._ease.getRatio(this._time/i):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==h&&a>=0&&(this._active=!0),0===h&&(this._startAt&&(a>=0?this._startAt.render(a,b,c):e||(e="_dummyGS")),this.vars.onStart&&(0!==this._time||0===i)&&(b||this._callback("onStart"))),f=this._firstPT;f;)f.f?f.t[f.p](f.c*this.ratio+f.s):f.t[f.p]=f.c*this.ratio+f.s,f=f._next;this._onUpdate&&(0>a&&this._startAt&&a!==-1e-4&&this._startAt.render(a,b,c),b||(this._time!==h||d||c)&&this._callback("onUpdate")),e&&(!this._gc||c)&&(0>a&&this._startAt&&!this._onUpdate&&a!==-1e-4&&this._startAt.render(a,b,c),d&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[e]&&this._callback(e),0===i&&this._rawPrevTime===l&&g!==l&&(this._rawPrevTime=0))}},g._kill=function(a,b,c){if("all"===a&&(a=null),null==a&&(null==b||b===this.target))return this._lazy=!1,this._enabled(!1,!1);b="string"!=typeof b?b||this._targets||this.target:F.selector(b)||b;var d,e,f,g,h,i,j,k,l,m=c&&this._time&&c._startTime===this._startTime&&this._timeline===c._timeline;if((o(b)||G(b))&&"number"!=typeof b[0])for(d=b.length;--d>-1;)this._kill(a,b[d],c)&&(i=!0);else{if(this._targets){for(d=this._targets.length;--d>-1;)if(b===this._targets[d]){h=this._propLookup[d]||{},this._overwrittenProps=this._overwrittenProps||[],e=this._overwrittenProps[d]=a?this._overwrittenProps[d]||{}:"all";break}}else{if(b!==this.target)return!1;h=this._propLookup,e=this._overwrittenProps=a?this._overwrittenProps||{}:"all"}if(h){if(j=a||h,k=a!==e&&"all"!==e&&a!==h&&("object"!=typeof a||!a._tempKill),c&&(F.onOverwrite||this.vars.onOverwrite)){for(f in j)h[f]&&(l||(l=[]),l.push(f));if((l||!a)&&!Z(this,c,b,l))return!1}for(f in j)(g=h[f])&&(m&&(g.f?g.t[g.p](g.s):g.t[g.p]=g.s,i=!0),g.pg&&g.t._kill(j)&&(i=!0),g.pg&&0!==g.t._overwriteProps.length||(g._prev?g._prev._next=g._next:g===this._firstPT&&(this._firstPT=g._next),g._next&&(g._next._prev=g._prev),g._next=g._prev=null),delete h[f]),k&&(e[f]=1);!this._firstPT&&this._initted&&this._enabled(!1,!1)}}return i},g.invalidate=function(){return this._notifyPluginsOfEnabled&&F._onPluginEvent("_onDisable",this),this._firstPT=this._overwrittenProps=this._startAt=this._onUpdate=null,this._notifyPluginsOfEnabled=this._active=this._lazy=!1,this._propLookup=this._targets?{}:[],C.prototype.invalidate.call(this),this.vars.immediateRender&&(this._time=-l,this.render(Math.min(0,-this._delay))),this},g._enabled=function(a,b){if(i||h.wake(),a&&this._gc){var c,d=this._targets;if(d)for(c=d.length;--c>-1;)this._siblings[c]=Y(d[c],this,!0);else this._siblings=Y(this.target,this,!0)}return C.prototype._enabled.call(this,a,b),this._notifyPluginsOfEnabled&&this._firstPT?F._onPluginEvent(a?"_onEnable":"_onDisable",this):!1},F.to=function(a,b,c){return new F(a,b,c)},F.from=function(a,b,c){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,new F(a,b,c)},F.fromTo=function(a,b,c,d){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,new F(a,b,d)},F.delayedCall=function(a,b,c,d,e){return new F(b,0,{delay:a,onComplete:b,onCompleteParams:c,callbackScope:d,onReverseComplete:b,onReverseCompleteParams:c,immediateRender:!1,lazy:!1,useFrames:e,overwrite:0})},F.set=function(a,b){return new F(a,0,b)},F.getTweensOf=function(a,b){if(null==a)return[];a="string"!=typeof a?a:F.selector(a)||a;var c,d,e,f;if((o(a)||G(a))&&"number"!=typeof a[0]){for(c=a.length,d=[];--c>-1;)d=d.concat(F.getTweensOf(a[c],b));for(c=d.length;--c>-1;)for(f=d[c],e=c;--e>-1;)f===d[e]&&d.splice(c,1)}else for(d=Y(a).concat(),c=d.length;--c>-1;)(d[c]._gc||b&&!d[c].isActive())&&d.splice(c,1);return d},F.killTweensOf=F.killDelayedCallsTo=function(a,b,c){"object"==typeof b&&(c=b,b=!1);for(var d=F.getTweensOf(a,b),e=d.length;--e>-1;)d[e]._kill(c,a)};var aa=s("plugins.TweenPlugin",function(a,b){this._overwriteProps=(a||"").split(","),this._propName=this._overwriteProps[0],this._priority=b||0,this._super=aa.prototype},!0);if(g=aa.prototype,aa.version="1.19.0",aa.API=2,g._firstPT=null,g._addTween=N,g.setRatio=L,g._kill=function(a){var b,c=this._overwriteProps,d=this._firstPT;if(null!=a[this._propName])this._overwriteProps=[];else for(b=c.length;--b>-1;)null!=a[c[b]]&&c.splice(b,1);for(;d;)null!=a[d.n]&&(d._next&&(d._next._prev=d._prev),d._prev?(d._prev._next=d._next,d._prev=null):this._firstPT===d&&(this._firstPT=d._next)),d=d._next;return!1},g._mod=g._roundProps=function(a){for(var b,c=this._firstPT;c;)b=a[this._propName]||null!=c.n&&a[c.n.split(this._propName+"_").join("")],b&&"function"==typeof b&&(2===c.f?c.t._applyPT.m=b:c.m=b),c=c._next},F._onPluginEvent=function(a,b){var c,d,e,f,g,h=b._firstPT;if("_onInitAllProps"===a){for(;h;){for(g=h._next,d=e;d&&d.pr>h.pr;)d=d._next;(h._prev=d?d._prev:f)?h._prev._next=h:e=h,(h._next=d)?d._prev=h:f=h,h=g}h=b._firstPT=e}for(;h;)h.pg&&"function"==typeof h.t[a]&&h.t[a]()&&(c=!0),h=h._next;return c},aa.activate=function(a){for(var b=a.length;--b>-1;)a[b].API===aa.API&&(P[(new a[b])._propName]=a[b]);return!0},r.plugin=function(a){if(!(a&&a.propName&&a.init&&a.API))throw"illegal plugin definition.";var b,c=a.propName,d=a.priority||0,e=a.overwriteProps,f={init:"_onInitTween",set:"setRatio",kill:"_kill",round:"_mod",mod:"_mod",initAll:"_onInitAllProps"},g=s("plugins."+c.charAt(0).toUpperCase()+c.substr(1)+"Plugin",function(){aa.call(this,c,d),this._overwriteProps=e||[]},a.global===!0),h=g.prototype=new aa(c);h.constructor=g,g.API=a.API;for(b in f)"function"==typeof a[b]&&(h[f[b]]=a[b]);return g.version=a.version,aa.activate([g]),g},e=a._gsQueue){for(f=0;f<e.length;f++)e[f]();for(g in p)p[g].func||a.console.log("GSAP encountered missing dependency: "+g)}i=!1}}("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window,"TweenMax");
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _helpers = __webpack_require__(3);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function AudioHandler(filenames) {
		var AudioContext = window.AudioContext || window.webkitAudioContext;

		filenames = _helpers2.default.uniques(filenames);

		this.filenames = [];
		this.sounds = [];
		this.context = new AudioContext();
		this.loadSounds(filenames);
	}

	AudioHandler.prototype = {

		constructor: AudioHandler,

		loadSounds: function loadSounds(files) {
			var _this = this;

			files.map(function (file) {
				_this.loadSound(file);
				_this.filenames.push(file);
			});
		},

		loadSound: function loadSound(filename) {
			var _this2 = this;

			if (this.filenames.indexOf(filename) !== -1) return;

			var request = new XMLHttpRequest(),
			    fullfile = '/sequencer/sounds/' + filename;

			request.open('GET', fullfile);
			request.responseType = 'arraybuffer';

			request.onload = function () {
				_this2.context.decodeAudioData(request.response, function (buffer) {
					_this2.sounds.push(buffer);
				});
			};

			request.send();
		},

		playSound: function playSound(id) {
			var source = this.context.createBufferSource(),
			    index = this.filenames.indexOf(id);

			source.buffer = this.sounds[index];
			source.connect(this.context.destination);
			source.start(0);
		}
	};

	exports.default = AudioHandler;

/***/ }
/******/ ]);