/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	var support = { animations : Modernizr.cssanimations, filters : Modernizr.cssfilters },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		imgSlider,
		colorsCtrl = document.querySelector('.button-color'),
		paletteBoxes = [].slice.call(document.querySelectorAll('ul.palette > li.palette__item'));

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function Slider(el, options) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		
		this.items = [].slice.call(this.el.querySelectorAll('.slider__item'));
		
		this.navRCtrl = this.el.querySelector('nav > .slider__nav--next');
		this.navLCtrl = this.el.querySelector('nav > .slider__nav--prev');
		
		this.itemsTotal = this.items.length;
		this.current = 0;

		this.isAnimating = false;

		this._init();
	}

	Slider.prototype.options = {
		onNavigate : function() { return false; }
	}

	Slider.prototype._init = function() {
		this.navRCtrl.addEventListener('click', this._next.bind(this));
		this.navLCtrl.addEventListener('click', this._prev.bind(this));
	};

	Slider.prototype._next = function() {
		this._navigate('right');
	};

	Slider.prototype._prev = function() {
		this._navigate('left');
	};

	Slider.prototype._navigate = function(dir) {
		if( this.isAnimating ) {
			return false;
		}

		this.options.onNavigate();

		this.isAnimating = true;

		var self = this,
			currentItem = this.items[this.current], nextItem;

		if( dir === 'right' ) {
			nextItem = this.current < this.itemsTotal - 1 ? this.items[this.current + 1] : this.items[0];
		}
		else {
			nextItem = this.current > 0 ? this.items[this.current - 1] : this.items[this.itemsTotal - 1];	
		}

		classie.add(this.el, dir === 'right' ? 'slider--show-next' : 'slider--show-prev');
		classie.add(currentItem, dir === 'right' ? 'slider__item--animOutNext' : 'slider__item--animOutPrev');
		classie.add(nextItem, dir === 'right' ? 'slider__item--animInNext' : 'slider__item--animInPrev');

		if( dir === 'right' ) {
			this.current = this.current < this.itemsTotal - 1 ? this.current + 1 : 0;
		}
		else {
			this.current = this.current > 0 ? this.current - 1 : this.itemsTotal - 1;
		}

		onEndAnimation(nextItem, function() {
			classie.remove(self.el, dir === 'right' ? 'slider--show-next' : 'slider--show-prev');
			classie.remove(currentItem, dir === 'right' ? 'slider__item--animOutNext' : 'slider__item--animOutPrev');
			classie.remove(currentItem, dir === 'right' ? 'slider__item--current' : 'slider__item--current');
			classie.remove(nextItem, dir === 'right' ? 'slider__item--animInNext' : 'slider__item--animInPrev');
			classie.add(nextItem, 'slider__item--current');
			self.isAnimating = false;
		});
	};

	Slider.prototype.getImage = function() {
		return this.items[this.current].querySelector('img');
	};

	function init() {
		var slider = document.getElementById('slider');
		
		// image slider
		imgSlider = new Slider(slider, {
			onNavigate : function() { // reset colors
				var ison = colorsCtrl.getAttribute('on');
				if( ison === 'on' ) {
					insertColors();
					colorsCtrl.setAttribute('on', 'off');
				}
			}
		});

		// css filters fallback
		if( !support.filters ) {
			[].slice.call(slider.querySelectorAll('img')).forEach(function(img) {
				// create SVG element
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttributeNS(null, 'version', '1.1');
				svg.setAttributeNS(null, 'preserveAspectRatio', 'xMaxYMin meet');
				svg.setAttributeNS(null, 'viewBox', '0 0 640 426');
				svg.setAttributeNS(null, 'width', '640px');
				svg.setAttributeNS(null, 'height', '426px');
				svg.setAttributeNS(null, 'class', 'slider__img-fallback');
				
				var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
				svgimg.setAttributeNS(null,'height','100%');
				svgimg.setAttributeNS(null,'width','100%');
				svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', img.src);
				svgimg.setAttributeNS(null, 'filter', 'url(#grayscale)');

				svg.appendChild(svgimg);
				img.parentNode.appendChild(svg);
			});
		}
		
		initEvents();
	}

	function initEvents() {
		// extract colors
		colorsCtrl.addEventListener('click', function() {
			if( imgSlider.isAnimating ) {
				return false;
			}
			var ison = colorsCtrl.getAttribute('on');
			if( ison === 'on' ) {
				insertColors();
			}
			else {
				extractColors();
			}
			colorsCtrl.setAttribute('on', ison === 'on' ? 'off' : 'on');
		});
	}

	function extractColors() {
		// get current slider image
		var imgEl = imgSlider.getImage(),
			addToPalette = function(palette,pos) {
				setTimeout(function() { 
					if( colorsCtrl.getAttribute('on') === 'on' ) { // make sure it's still on..
						classie.add(palette, 'palette__item--animate'); 
					}
				}, pos*150); // delays
			};

		var vibrant = new Vibrant(imgEl, 48, 5), swatches = vibrant.swatches(), i = 0;
		for (var swatch in swatches) {
			var palette = paletteBoxes[i];
			if (swatches.hasOwnProperty(swatch) && swatches[swatch] && palette) {
				palette.style.color = swatches[swatch].getHex();
				palette.querySelector('.palette__value--real').innerHTML = swatches[swatch].getHex();
				
				addToPalette(palette, i);
			}
			++i;
		}

		// css filters animation:
		classie.add(imgEl, 'slider__img--animate');
	}

	function insertColors() {
		// get current slider image
		var imgEl = imgSlider.getImage(),
			removeFromPalette = function(palette,pos) {
				setTimeout(function() { classie.remove(palette, 'palette__item--animate'); }, (paletteBoxes.length - 1)*100 - pos*100);	
			};

		paletteBoxes.forEach(function(palette, i) {
			removeFromPalette(palette, i);
		});

		// css filters animation:
		classie.remove(imgEl, 'slider__img--animate');
	}

	init();

})( window );