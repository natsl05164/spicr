import spicrConnect from '../util/spicrConnect';
import getLayers from './getLayers';

import defaultSpicrOptions from '../options/defaultOptions';
import getSlideData from './getSlideData';
import processLayerData from './processLayerData';

/**
 * TweenCarousel to work with KUTE transformFunctions component which returns
 * an `Array` of Tween objects for layers of the current and next active item.
 * @param {Element} elem
 * @param {Element[]} items
 * @param {number} active
 * @param {number} next
 * @param {string} direction animation direction
 * @returns {KUTE.TweenBase[]} the `Array` of tween objects
 */
export default function slidesTF(elem, items, active, next, direction, axis, gap) {
  const carouselTweens = [];
  const data = getSlideData(elem, items[active]);

  const activeItem = items[active];
  const { translate } = data;
  const { rotate } = data;
  const { scale } = data;
  const origin = elem.getAttribute('data-transform-origin');
  const { opacity } = data; // opacity is optional | boolean
  const { easing } = data;

  const duration = data.duration || defaultSpicrOptions.duration;
  const delay = data.delay || +duration / 2;
  const from = {};
  const to = {};

  const activeTransform = getComputedStyle(activeItem).getPropertyValue('transform');
  const matrix = new DOMMatrixReadOnly(activeTransform);
  const activeTranslate = {
    X: matrix.m41,
    Y: matrix.m42,
    Z: matrix.m43,
  };
  console.log('activeTranslate', activeTranslate);
  if (translate) {
    console.log('elem translate', translate);
    from.transform = {};
    to.transform = {};

    from.transform.translate3d = [activeTranslate.X, activeTranslate.Y, activeTranslate.Z];
    let translateX = 0;
    let translateY = 0;
    let translateZ = 0;

    if ('x' in translate) {
      if (axis === 'x') {
        translate.x += gap;
      }

      translateX = direction ? -translate.x : translate.x;
    }
    if ('y' in translate) {
      if (axis === 'y') {
        translate.y += gap;
      }

      translateY = direction ? -translate.y : translate.y;
    }
    if ('z' in translate) {
      if (axis === 'z') {
        translate.z += gap;
      }

      translateZ = direction ? -translate.z : translate.z;
    }

    console.log('elem translate after direction', translate);
    const tX = translateX + activeTranslate.X;
    const tY = translateY + activeTranslate.Y;
    const tZ = translateZ + activeTranslate.Z;
    to.transform.translate3d = [tX, tY, tZ];
    console.log('fromTo', from.transform, to.transform);
    Array.from(items).forEach((x, i) => {
      carouselTweens.push(spicrConnect.fromTo(x, from, to, { easing, duration }));
    });
  }

  return carouselTweens;
}
