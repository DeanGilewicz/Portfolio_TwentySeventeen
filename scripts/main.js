document.addEventListener("DOMContentLoaded", function() {
	"use strict";

	var duration = 400;
	var pageUrl = location.hash ? stripHash(location.href) : location.href;

	function stripHash(url) {
		return url.slice(0, url.lastIndexOf('#'));
	}

	function isInPageLink(n) {
		return n.tagName.toLowerCase() === 'a' && n.hash.length > 0 && stripHash(n.href) === pageUrl;
	}

	function goTo(target, options) {
		var start = window.pageYOffset,
			opt = {
				duration: options.duration,
				offset: options.offset || 0,
				callback: options.callback,
				easing: options.easing || easeInOutQuad
			},
			distance = typeof target === 'string' ? opt.offset + document.querySelector(target).getBoundingClientRect().top : target,
			duration = typeof opt.duration === 'function' ? opt.duration(distance) : opt.duration,
			timeStart,
			timeElapsed;

		function end() {
			window.scrollTo(0, start + distance);

			if( typeof opt.callback === 'function' ) {
				opt.callback();
			}
		}


		function loop(time) {
			timeElapsed = time - timeStart;

			window.scrollTo(0, opt.easing(timeElapsed, start, distance, duration));

			if( timeElapsed < duration ) {
				requestAnimationFrame(loop);
			} else {
				end();
			}

		}

		requestAnimationFrame(function(time) {
			timeStart = time;
			loop(time);
		});

		// Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
		function easeInOutQuad(t, b, c, d) {
			t /= d / 2;
			if( t < 1 ) return c / 2 * t * t + b;
			t--;
			return -c / 2 * (t * (t - 2) - 1) + b;
		}

	}

	function directLinkHijacking() {

		function onClick(e) {
			e.stopPropagation();
			e.preventDefault();

			goTo(e.target.hash, {
				duration: duration,
			});
		}

		[].slice.call(document.querySelectorAll('a'))
			.filter(isInPageLink)
			.forEach(function(a) {
				a.addEventListener('click', onClick, false);
			});

	}

	// function setFocus(hash) {
	// 	var element = document.getElementById(hash.substring(1));

	// 	if( element ) {
	// 		if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
	// 			element.tabIndex = -1;
	// 		}

	// 		element.focus();
	// 	}
	// }

	// function delegatedLinkHijacking() {
	// 	document.body.addEventListener('click', onClick, false);

	// 	function onClick(e) {
	// 		if( !isInPageLink(e.target) ) return;

	// 		e.stopPropagation();
	// 		e.preventDefault();

	// 		goTo(e.target.hash, {
	// 			duration: duration,
	// 			callback: function() {
	// 				setFocus(e.target.hash);
	// 			}
	// 		});
	// 	}

	// }

	function isCssSmoothSCrollSupported() {
		return 'scrollBehavior' in document.documentElement.style;
	}

	function initSmoothScrolling() {

		if( isCssSmoothSCrollSupported() ) {
			// console.log('supported');
			// document.getElementById('js-smooth-scroll').className = 'smoothScrollSupported';
			return;
		}

		// delegatedLinkHijacking();
		directLinkHijacking();

	}


	initSmoothScrolling();

});


