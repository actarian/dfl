/* jshint esversion: 6 */

export default class Rect {

	constructor(rect) {
		this.top = 0;
		this.right = 0;
		this.bottom = 0;
		this.left = 0;
		this.width = 0;
		this.height = 0;
		this.set(rect);
	}

	static contains(rect, left, top) {
		return rect.top <= top && top <= rect.bottom && rect.left <= left && left <= rect.right;
	}

	static intersectRect(r1, r2) {
		return !(r2.left > r1.right ||
			r2.right < r1.left ||
			r2.top > r1.bottom ||
			r2.bottom < r1.top);
	}

	static fromNode(node) {
		if (!node) {
			return;
		}
		const rect = node.rect_ || (node.rect_ = new Rect());
		const rects = node.getClientRects();
		if (!rects.length) {
			// console.log(rects, node);
			return rect;
		}
		const boundingRect = node.getBoundingClientRect();
		// rect.top: boundingRect.top + defaultView.pageYOffset,
		// rect.left: boundingRect.left + defaultView.pageXOffset,
		rect.top = boundingRect.top;
		rect.left = boundingRect.left;
		rect.width = boundingRect.width;
		rect.height = boundingRect.height;
		rect.setCenter();
		return rect;
	}

	set(rect) {
		if (rect) {
			Object.assign(this, rect);
			this.right = this.left + this.width;
			this.bottom = this.top + this.height;
		}
		this.setCenter();
	}

	setCenter() {
		const center = this.center || (this.center = {});
		center.top = this.top + this.height / 2;
		center.left = this.left + this.width / 2;
		center.x = center.left;
		center.y = center.top;
	}

	contains(left, top) {
		return Rect.contains(this, left, top);
	}

	intersect(rect) {
		return Rect.intersectRect(this, rect);
	}

	intersection(rect) {
		const intersection = this.intersection_ || (this.intersection_ = { center: {} });
		intersection.center.x = (this.center.x - rect.center.x) / (rect.width / 2);
		intersection.center.y = (this.center.y - rect.center.y) / (rect.height / 2);
		const dx = this.left > rect.left ? 0 : Math.abs(rect.left - this.left);
		const dy = this.top > rect.top ? 0 : Math.abs(rect.top - this.top);
		const x = dx ? (1 - dx / this.width) : ((rect.left + rect.width) - this.left) / this.width;
		const y = dy ? (1 - dy / this.height) : ((rect.top + rect.height) - this.top) / this.height;
		intersection.x = x;
		intersection.y = y;
		return intersection;
	}

	intersection___(rect) {
		const center = {
			x: (this.center.x - rect.center.x) / (rect.width / 2),
			y: (this.center.y - rect.center.y) / (rect.height / 2),
		};
		if (this.intersect(rect)) {
			const dx = this.left > rect.left ? 0 : Math.abs(rect.left - this.left);
			const dy = this.top > rect.top ? 0 : Math.abs(rect.top - this.top);
			let x = dx ? (1 - dx / this.width) : ((rect.left + rect.width) - this.left) / this.width;
			let y = dy ? (1 - dy / this.height) : ((rect.top + rect.height) - this.top) / this.height;
			x = Math.min(1, x);
			y = Math.min(1, y);
			return {
				x: x,
				y: y,
				center: center
			};
		} else {
			return { x: 0, y: 0, center: center };
		}
	}

}
