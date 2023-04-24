/**
 * TweenCarousel to work with KUTE transformMatrix component which returns
 * an `Array` of Tween objects for layers of the current and next active item.
 * @param {Element} elem
 * @param {Element[]} items
 * @param {number} active
 * @param {number} next
 * @param {string} direction animation direction
 * @returns {KUTE.TweenBase[]} the `Array` of tween objects
 */
export default function carouselTM(elem: Element, items: Element[], active: number, next: number, direction: string): KUTE.TweenBase[];
