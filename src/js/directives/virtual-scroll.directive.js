/* jshint esversion: 6 */

export default class VirtualScrollDirective {

	constructor(
		DomService
	) {
		this.domService = DomService;
		this.restrict = 'A';
	}

	link(scope, element, attributes, controller) {
		const node = element[0];
		const target = node.querySelector(attributes.virtualScroll);
		TweenMax.to(target, 0.6, {
			opacity: 1,
			ease: Power2.easeInOut,
			delay: 1,
		});
		const subscription = this.domService.smoothScroll$(attributes.virtualScroll).subscribe(top => {

		});
		element.on('$destroy', () => {
			subscription.unsubscribe();
		});
	}

	static factory(DomService) {
		return new VirtualScrollDirective(DomService);
	}

}

VirtualScrollDirective.factory.$inject = ['DomService'];
