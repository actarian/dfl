/* jshint esversion: 6 */

import { combineLatest, fromEvent, range } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import { auditTime, distinctUntilChanged, filter, first, map, shareReplay, startWith, tap } from 'rxjs/operators';
import Rect from '../shared/rect';

export function tween(from, to, friction) {
	if (from === to || Math.abs(to - from) < 0.02) {
		return to;
	}
	return from + (to - from) / friction;
}

export default class DomService {

	constructor() {
		const hasPassiveEvents = () => {
			let has = false;
			try {
				const options = Object.defineProperty({}, 'passive', {
					get: function() {
						has = true;
					}
				});
				const noop = function() {};
				window.addEventListener('testPassiveEventSupport', noop, options);
				window.removeEventListener('testPassiveEventSupport', noop, options);
			} catch (e) {}
			return has;
		};
		this.hasPassiveEvents = hasPassiveEvents();
	}

	get ready() {
		return this.ready_;
	}

	set ready(ready) {
		this.ready_ = ready;
	}

	get scrollTop() {
		return DomService.getScrollTop(window);
	}

	get scrollLeft() {
		return DomService.getScrollLeft(window);
	}

	hasWebglSupport() {
		if (this.isIE()) {
			return false;
		}
		if (!this.hasWebgl()) {
			return false;
		}
		return true;
	}

	isIE() {
		const ua = window.navigator.userAgent;
		const msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}
		const trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			const rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}
		const edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// Edge (IE 12+) => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}
		// other browser
		return false;
	}

	hasWebgl() {
		let gl, debugInfo, vendor, renderer, has = false;
		try {
			const canvas = document.createElement('canvas');
			if (!!window.WebGLRenderingContext) {
				gl = canvas.getContext('webgl', {
						failIfMajorPerformanceCaveat: true
					}) ||
					canvas.getContext('experimental-webgl', {
						failIfMajorPerformanceCaveat: true
					});
			}
		} catch (e) {
			console.log('no webgl');
		}
		if (gl) {
			debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
			vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
			renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
			has = true;
		}
		console.log(`WebGLCapabilities debugInfo: ${debugInfo} vendor: ${vendor} renderer: ${renderer} `);
		return has;
	}

	getOuterHeight(node) {
		let height = node.clientHeight;
		const computedStyle = window.getComputedStyle(node);
		height += parseInt(computedStyle.marginTop, 10);
		height += parseInt(computedStyle.marginBottom, 10);
		height += parseInt(computedStyle.borderTopWidth, 10);
		height += parseInt(computedStyle.borderBottomWidth, 10);
		return height;
	}

	getOuterWidth(node) {
		let width = node.clientWidth;
		const computedStyle = window.getComputedStyle(node);
		width += parseInt(computedStyle.marginLeft, 10);
		width += parseInt(computedStyle.marginRight, 10);
		width += parseInt(computedStyle.borderLeftWidth, 10);
		width += parseInt(computedStyle.borderRightWidth, 10);
		return width;
	}

	raf$() {
		return DomService.raf$;
	}

	windowRect$() {
		return DomService.windowRect$;
	}

	rafAndRect$() {
		return DomService.rafAndRect$;
	}

	scroll$() {
		return DomService.scroll$;
	}

	scrollAndRect$() {
		return DomService.scrollAndRect$;
	}

	rafAndScroll$() {
		return this.raf$().pipe(
			map(x => this.scrollTop),
			distinctUntilChanged()
		);
	}

	smoothTop$(selector, friction = 40) {
		const body = document.querySelector('body');
		const node = document.querySelector(selector);
		let down = false;
		let first = true;
		return this.raf$().pipe(
			map(() => {
				const outerHeight = this.getOuterHeight(node);
				if (body.offsetHeight !== outerHeight) {
					body.style = `height: ${outerHeight}px`;
				}
				const y = -this.scrollTop;
				const nodeTop = node.top || y;
				const top = down ? y : tween(nodeTop, y, (first ? 1 : friction));
				if (node.top !== top) {
					node.top = top;
					first = false;
					return top;
				} else {
					return null;
				}
			}),
			filter(x => x !== null),
			shareReplay()
		);
	}

	smoothScroll$(selector, friction = 40) {
		const node = document.querySelector(selector);
		return this.smoothTop$(selector, friction).pipe(
			tap(top => {
				node.style.transform = `translateX(-50%) translateY(${top}px)`;
				node.classList.add('smooth-scroll');
			}),
			shareReplay()
		);
	}

	rafIntersection$(node) {
		return this.rafAndRect$().pipe(
			map(datas => {
				// const scrollTop = datas[0];
				const windowRect = datas[1];
				const rect = Rect.fromNode(node);
				const intersection = rect.intersection(windowRect);
				const response = DomService.rafIntersection_;
				response.scroll = datas[0];
				response.windowRect = datas[1];
				response.rect = rect;
				response.intersection = intersection;
				return response;
			})
		);
	}

	scrollIntersection$(node) {
		return this.scrollAndRect$().pipe(
			map(datas => {
				// const scrollTop = datas[0];
				const windowRect = datas[1];
				const rect = Rect.fromNode(node);
				const intersection = rect.intersection(windowRect);
				const response = DomService.scrollIntersection_;
				response.scroll = datas[0];
				response.windowRect = datas[1];
				response.rect = rect;
				response.intersection = intersection;
				return response;
			})
		);
	}

	appearOnLoad$(node, value = 0.0) { // -0.5
		const isCover = node.hasAttribute('cover');
		return this.rafIntersection$(node).pipe(
			filter(x => (this.ready || isCover) && x.intersection.y > value && x.intersection.x > 0),
			first()
		);
	}

	appear$(node, value = 0.0) { // -0.5
		return this.rafIntersection$(node).pipe(
			filter(x => x.intersection.y > value),
			first()
		);
	}

	visibility$(node, value = 0.5) {
		return this.rafIntersection$(node).pipe(
			map(x => x.intersection.y > value),
			distinctUntilChanged()
		);
	}

	firstVisibility$(node, value = 0.5) {
		return this.visibility$(node, value).pipe(
			filter(visible => visible),
			first()
		);
	}

	addCustomRules() {
		const sheet = this.addCustomSheet();
		const body = document.querySelector('body');
		const node = document.createElement('div');
		node.style.width = '100px';
		node.style.height = '100px';
		node.style.overflow = 'auto';
		node.style.visibility = 'hidden';
		node.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
		const inner = document.createElement('div');
		inner.style.width = 'auto';
		inner.style.height = '200px';
		node.appendChild(inner);
		body.appendChild(node);
		const scrollBarWidth = (node.offsetWidth - inner.offsetWidth);
		// console.log(node.offsetWidth, inner.offsetWidth);
		body.removeChild(node);
		/*
		let rule = `body.droppin-in { padding-right: ${scrollBarWidth}px; }`;
		sheet.insertRule(rule, 0);
		rule = `body.droppin-in header { width: calc(100% - ${scrollBarWidth}px); }`;
		sheet.insertRule(rule, 1);
		rule = `body.droppin-in .page { width: calc(100% - ${scrollBarWidth}px); }`;
		sheet.insertRule(rule, 2);
		*/
	}

	addCustomSheet() {
		const style = document.createElement('style');
		style.appendChild(document.createTextNode(''));
		document.head.appendChild(style);
		return style.sheet;
	}

	static factory() {
		return new DomService();
	}

	static getScrollTop(node) {
		return node.pageYOffset || node.scrollY || node.scrollTop || 0;
	}

	static getScrollLeft(node) {
		return node.pageXOffset || node.scrollX || node.scrollLeft || 0;
	}

}

DomService.factory.$inject = [];
DomService.rafIntersection_ = {};
DomService.scrollIntersection_ = {};
DomService.raf$ = range(0, Number.POSITIVE_INFINITY, animationFrame);
DomService.windowRect$ = function() {
	const windowRect = new Rect({
		width: window.innerWidth,
		height: window.innerHeight
	});
	return fromEvent(window, 'resize').pipe(
		map(originalEvent => {
			windowRect.width = window.innerWidth;
			windowRect.height = window.innerHeight;
			return windowRect;
		}),
		startWith(windowRect)
	);
}();
DomService.rafAndRect$ = combineLatest(DomService.raf$, DomService.windowRect$);
DomService.scroll$ = function() {
	const target = window;
	let previousTop = DomService.getScrollTop(target);
	const event = {
		/*
		top: target.offsetTop || 0,
		left: target.offsetLeft || 0,
		width: target.offsetWidth || target.innerWidth,
		height: target.offsetHeight || target.innerHeight,
		*/
		scrollTop: previousTop,
		scrollLeft: DomService.getScrollLeft(target),
		direction: 0,
		originalEvent: null,
	};
	return fromEvent(target, 'scroll').pipe(
		auditTime(33), // 30 fps
		map((originalEvent) => {
			/*
			event.top = target.offsetTop || 0;
			event.left = target.offsetLeft || 0;
			event.width = target.offsetWidth || target.innerWidth;
			event.height = target.offsetHeight || target.innerHeight;
			*/
			event.scrollTop = DomService.getScrollTop(target);
			event.scrollLeft = DomService.getScrollLeft(target);
			const diff = event.scrollTop - previousTop;
			event.direction = diff / Math.abs(diff);
			previousTop = event.scrollTop;
			event.originalEvent = originalEvent;
			return event;
		}),
		startWith(event)
	);
}();
DomService.scrollAndRect$ = combineLatest(DomService.scroll$, DomService.windowRect$);
