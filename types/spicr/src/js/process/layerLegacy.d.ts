/**
 * Returns a tween object for a single layer for TransformLegacy component.
 * @param {Element} elem target layer
 * @param {number | boolean} isInAnimation parent slide is next
 * @param {Spicr.layerData} nextData some layer data used when parent is NOT next
 * @returns {KUTE.TweenBase} a new tween object
 */
export default function layerLegacy(elem: Element, isInAnimation: number | boolean, nextData: Spicr.layerData): KUTE.TweenBase;
