/* jshint esversion: 6 */

import Rect from '../shared/rect';

export default class TitleFooterDirective {

	constructor(
		DomService
	) {
		this.domService = DomService;
		this.restrict = 'A';
	}

	link(scope, element, attributes, controller) {
		const node = element[0];
		const splitting = Splitting({
			target: node,
		})[0];
		splitting.chars.forEach((char, i) => {
			TweenMax.set(char, {
				opacity: 0,
				x: 100 * Math.cos(i * Math.PI),
				y: 100 * Math.sin((i + 1) * Math.PI),
			});
		});
		const subscription = this.domService.smoothTop$('.page').subscribe(top => {
			const rect = Rect.fromNode(node);
			const diff = document.body.offsetHeight - window.innerHeight;
			const sy = (diff + top) / rect.height;
			splitting.chars.forEach((char, i) => {
				const pow = Math.min(1, Math.max(0, (sy - i * 0.2)));
				const opacity = 1 - pow;
				const x = 100 * Math.cos(i * Math.PI) * pow;
				const y = 100 * Math.sin((i + 1) * Math.PI) * pow;
				TweenMax.set(char, {
					opacity: opacity,
					x: x,
					y: y,
				});
			});
		});
		element.on('$destroy', () => {
			subscription.unsubscribe();
		});
	}

	link__(scope, element, attributes, controller) {
		const node = element[0];
		const splitting = Splitting({
			target: node,
		})[0];
		splitting.chars.forEach((char, i) => {
			TweenMax.set(char, {
				opacity: 0,
				x: 100 * Math.cos(i * Math.PI),
				y: 100 * Math.sin((i + 1) * Math.PI),
			});
		});
		// const section = this.getSection(node);
		// const index = [].slice.call(section.querySelectorAll('[title-hero]')).indexOf(node);
		const subscription = this.domService.appear$(node, -0.5).subscribe(event => {
			// const timeout = index * 100;
			const timeout = 0;
			setTimeout(() => {
				this.animate(node, splitting);
			}, timeout);
		});
		element.on('$destroy', () => {
			subscription.unsubscribe();
		});
	}

	animate(node, splitting) {
		const tweens = splitting.chars.map((char, i) => {
			// const line = getComputedStyle(char).getPropertyValue('--line-index');
			return TweenMax.to(char, 0.9, {
				opacity: 1,
				x: 0,
				y: 0,
				delay: 3.0 + 0.1 * i,
				ease: Power2.easeInOut,
			});
		});
	}

	getSection(node) {
		let section = node.parentNode;
		let p = node;
		while (p) {
			p = p.parentNode;
			// if (p && p.classList && p.classList.contains('section')) {
			if (p && p.classList && p.nodeName.toLowerCase() === 'section') {
				section = p;
				p = null;
			}
		}
		return section;
	}

	static factory(DomService) {
		return new TitleFooterDirective(DomService);
	}

}

TitleFooterDirective.factory.$inject = ['DomService'];
