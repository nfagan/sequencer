const Helpers = ( () => {

	return {

		setStyle: (el, properties) => {
			let keys = Object.keys(properties)
			keys.map( (key) => { el.style[key] = properties[key] })
		},

		toPixels: (number) => { return number.toString() + 'px' },

		randInt: (min, max) => { return Math.round(Math.random() * (max - min) + min) },

		toRGB: (r,g,b) => { 
			return 'rgb(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ')' 
		},

		getElementCenterInViewport: (width,height) => {
			let w = window.innerWidth,
				h = window.innerHeight
			return { top: (h-height)/2, left: (w-width)/2 }
		},

		getMatrixRepresentation: (rows,cols) => {
			let matrix = []
			for (let i=0;i<rows;i++) {
				for (let k=0;k<cols;k++) {
					matrix.push({row: i, col: k})
				}
			}
			return matrix
		},

		getElementPosition: (el) => {
			return {
				// top: window.getComputedStyle
			}
		},

		min: (arr) => {
			if (arr.length === 0) return;
			if (arr.length === 1) return arr[0];

			let min = arr[0]

			for (let i=1;i<arr.length;i++) {
				min = Math.min(min,arr[i])
			}
			return min
		},

		max: (arr) => {
			if (arr.length === 0) return;
			if (arr.length === 1) return arr[0];

			let max = arr[0]

			for (let i=1;i<arr.length;i++) {
				max = Math.max(max,arr[i])
			}
			return max
		},

		uniques: (arr) => { return arr.filter( (val,i,self) => self.indexOf(val) === i ) }
	}

})();

export default Helpers