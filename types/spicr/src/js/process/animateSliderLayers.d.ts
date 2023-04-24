/**
 * Returns an `Array` or Tween objects for all layers
 * of the current active slider item and / or the next active item.
 *
 * @param {Element[]} slides spicr items
 * @param {number} idx current active index
 * @param {number} next next active index
 * @returns {KUTE.TweenBase[]} an `Array` of tween objects
 */
export default function animateSliderLayers(slides: Element[], idx: number, next: number): KUTE.TweenBase[];
