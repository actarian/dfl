/* jshint esversion: 6 */

import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import Rect from '../shared/rect';

export default class LoveDirective {

	constructor(
		DomService
	) {
		this.domService = DomService;
		this.restrict = 'A';
	}

	link(scope, element, attributes, controller) {
		const node = element[0];
		const paths = [...node.querySelectorAll('path')];
		paths.forEach(path => {
			const length = path.getTotalLength();
			TweenMax.set(path, { strokeDasharray: length, strokeDashoffset: length });
		});
		const subscription = this.domService.smoothTop$('.page').subscribe(top => {
			const rect = Rect.fromNode(node);
			const innerHeight = window.innerHeight;
			const diff = document.body.offsetHeight - innerHeight;
			// TweenMax.set(node, { yPercent: -100 * Math.min(1, sy) });
			paths.forEach((path, i) => {
				const dy = rect.height / paths.length;
				const sy = (1 / paths.length) + (diff + top - rect.height + dy * i) / dy;
				const pow = Math.min(1, Math.max(0, sy));
				const length = path.getTotalLength();
				TweenMax.set(path, { strokeDashoffset: length * pow });
			});
		});
		/*
		const subscription = this.parallax$(node).subscribe(intersection => {
			const y = intersection.center.y;
			TweenMax.set(node, { yPercent: -100 * Math.max(0, y) });
			paths.forEach((path, i) => {
				const pow = Math.min(1, Math.max(0, (y * 4) - i * 0.5));
				const length = path.getTotalLength();
				TweenMax.set(path, { strokeDashoffset: length * pow });
			});
		});
		*/
		element.on('$destroy', () => {
			subscription.unsubscribe();
		});
	}

	parallax$(node) {
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
		return new LoveDirective(DomService);
	}

}

LoveDirective.factory.$inject = ['DomService'];
