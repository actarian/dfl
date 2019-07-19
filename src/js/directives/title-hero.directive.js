/* jshint esversion: 6 */

import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import Rect from '../shared/rect';

export default class TitleHeroDirective {

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
				opacity: 1,
				x: 0,
				y: 0,
			});
		});
		// console.log('hero');
		const subscription = this.domService.smoothTop$('.page').subscribe(top => {
			const sy = (-top) / node.offsetHeight;
			splitting.chars.forEach((char, i) => {
				// const pow = Math.max(0, ((centerY * 4) - (splitting.chars.length - i) * 0.5));
				const pow = Math.max(0, (sy - i * 0.2));
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
		/*
		const subscription = this.parallax$(node).subscribe(intersection => {
			console.log(intersection);
			const centerY = Math.max(0, (intersection.center.y * -1) - 0.2);
			splitting.chars.forEach((char, i) => {
				// const pow = Math.max(0, ((centerY * 4) - (splitting.chars.length - i) * 0.5));
				const pow = Math.max(0, ((centerY * 2) - i * 0.1));
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
		*/
		element.on('$destroy', () => {
			subscription.unsubscribe();
		});
	}

	parallax$__(node) {
		let py, ty;
		return this.domService.rafAndRect$().pipe(
			map(datas => {
				const windowRect = datas[1];
				const rect = Rect.fromNode(node);
				const intersection = rect.intersection(windowRect);
				return intersection;
			}),
			filter(intersection => Math.abs(intersection.center.y < 2)),
			distinctUntilChanged((prev, curr) => {
				ty = py;
				py = curr.center.y;
				return ty === curr.center.y;
			}) //, tap(intersection => console.log(intersection.center.y))
		);
	}

	static factory(DomService) {
		return new TitleHeroDirective(DomService);
	}

}

TitleHeroDirective.factory.$inject = ['DomService'];
