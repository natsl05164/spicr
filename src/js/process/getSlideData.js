import processLayerData from './processLayerData';
import defaultSpicrOptions from '../options/defaultOptions';

/**
 * Returns an object with attribute values specific to Spicr layer.
 * @param {Element} elem target
 * @returns {Object.<string, (number | string)>}
 */
function getAttributes(elem) {
  const obj = {};
  const attr = ['translate', 'rotate', 'scale',
    'transform-origin', 'opacity', 'duration', 'delay', 'easing', 'axis'];

  attr.forEach((a) => {
    const prop = a === 'transform-origin' ? 'origin' : a;
    obj[prop] = elem.getAttribute(`data-${a}`);
  });
  return obj;
}

/**
 * Returns layer animation settings for DATA API attributes.
 * @param {Element} layer target
 * @param {Element} slide target
 * @returns {Spicr.layerData} values to create a tween object
 */
export default function getSlideData(layer, slide) {
  const attr = getAttributes(layer);
  const {
    translate, rotate, origin, opacity, easing, axis,
  } = attr;
  let { scale, duration, delay } = attr;

  scale = parseFloat(scale);
  duration = +duration;
  delay = +delay;

  return {
    axis,
    translate: translate ? processLayerData(slide, translate) : '',
    rotate: rotate ? processLayerData(layer, rotate) : '',
    origin: origin ? processLayerData(layer, origin, 1) : '',
    scale: !Number.isNaN(scale) ? scale : '',
    opacity: opacity !== 'false' ? 1 : 0,
    duration: !Number.isNaN(duration) ? duration : defaultSpicrOptions.duration,
    delay: !Number.isNaN(delay) ? delay : 0,
    easing: easing || defaultSpicrOptions.easing,
  };
}
