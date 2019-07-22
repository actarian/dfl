/* jshint esversion: 6 */

import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import Rect from '../shared/rect';

export default class LetterDirective {

	constructor(
		DomService
	) {
		this.domService = DomService;
		this.restrict = 'A';
	}

	link(scope, element, attributes, controller) {
		const node = element[0];
		const path = node.querySelector('path');
		const length = path.getTotalLength();
		TweenMax.set(path, { strokeDasharray: length, strokeDashoffset: length });
		const subscription = this.parallax$(node).subscribe(y => {
			TweenMax.set(path, { strokeDashoffset: length * Math.abs(y) });
		});
		element.on('$destroy', () => {
			subscription.unsubscribe();
		});
	}

	parallax$(node) {
		return this.domService.rafAndRect$().pipe(
			map(datas => {
				const windowRect = datas[1];
				const rect = Rect.fromNode(node);
				const intersection = rect.intersection(windowRect);
				if (intersection.y > 0) {
					return Math.min(1, Math.max(-1, intersection.center.y)); // intersection.center.y;
				} else {
					return null;
				}
			}),
			filter(y => y !== null),
			distinctUntilChanged()
		);
	}

	static factory(DomService) {
		return new LetterDirective(DomService);
	}

}

LetterDirective.factory.$inject = ['DomService'];
