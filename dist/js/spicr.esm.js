/*!
* Spicr v1.0.10 (http://thednp.github.io/spicr)
* Copyright 2017-2023 © thednp
* Licensed under MIT (https://github.com/thednp/spicr/blob/master/LICENSE)
*/
/**
 * Checks if an element is an `HTMLElement`.
 *
 * @param {any} element the target object
 * @returns {boolean} the query result
 */
const isHTMLElement = (element) => typeof element === 'object' && element instanceof HTMLElement;

/**
 * Utility to check if target is typeof `HTMLElement`
 * or find one that matches a selector.
 *
 * @param {HTMLElement | string} selector the input selector or target element
 * @param {(ParentNode | HTMLElement)=} parent optional `HTMLElement` to look into
 * @return {HTMLElement?} the `HTMLElement` or `querySelector` result
 */
function querySelector(selector, parent) {
  const lookUp = parent && isHTMLElement(parent) ? parent : document;
  return typeof selector === 'object' ? selector : lookUp.querySelector(selector);
}

/**
 * Utility to check if target is typeof `HTMLElement`
 * or find one that matches a selector.
 *
 * @deprecated
 *
 * @param {HTMLElement | string} selector the input selector or target element
 * @param {(ParentNode | HTMLElement)=} parent optional `HTMLElement` to look into
 * @return {HTMLElement?} the Element or `querySelector` result
 */
function queryElement(selector, parent) {
  return querySelector(selector, parent);
}

/**
 * A global namespace for `userAgentData` event.
 * @type {string}
 */
const userAgentData = 'userAgentData';

const mobileBrands = /iPhone|iPad|iPod|Android/i;
let isMobileCheck = false;

// @ts-ignore
if (navigator[userAgentData]) {
  // @ts-ignore
  isMobileCheck = navigator[userAgentData].brands.some((x) => mobileBrands.test(x.brand));
} else {
  isMobileCheck = mobileBrands.test(navigator.userAgent);
}

/**
 * A global namespace for mobile detection.
 * @type {boolean}
 */
const isMobile = isMobileCheck;

/**
 * A global namespace for touch events support.
 * @type {boolean}
 */
const supportTouch = 'ontouchstart' in window || 'msMaxTouchPoints' in navigator;

/**
 * A global namespace for mouse hover events.
 * @type {[string, string]}
 */
const mouseHoverEvents = ('onmouseleave' in document) ? ['mouseenter', 'mouseleave'] : ['mouseover', 'mouseout'];

/**
 * A global namespace for `DOMContentLoaded` event.
 * @type {string}
 */
const DOMContentLoadedEvent = 'DOMContentLoaded';

/**
 * Add eventListener to an `HTMLElement` | `Document` target.
 *
 * @param {HTMLElement | Document} element event.target
 * @param {string} eventName event.type
 * @param {EventListener} handler callback
 * @param {EventListenerOptions | boolean | undefined} options other event options
 */
function on(element, eventName, handler, options) {
  const ops = options || false;
  element.addEventListener(eventName, handler, ops);
}

/**
 * Remove eventListener from an `HTMLElement` | `Document` target.
 *
 * @param {HTMLElement | Document} element event.target
 * @param {string} eventName event.type
 * @param {EventListener} handler callback
 * @param {EventListenerOptions | boolean | undefined} options other event options
 */
function off(element, eventName, handler, options) {
  const ops = options || false;
  element.removeEventListener(eventName, handler, ops);
}

/**
 * Add an `eventListener` to an `HTMLElement` | `Document` target
 * and remove it once callback is called.
 *
 * @param {HTMLElement | Document} element event.target
 * @param {string} eventName event.type
 * @param {EventListener} handler callback
 * @param {EventListenerOptions | boolean | undefined} options other event options
 */
function one(element, eventName, handler, options) {
/**
 * Wrap the handler for easy on -> off
 * @param {Event} e the Event object
 */
  function handlerWrapper(e) {
    if (e.target === element) {
      handler.apply(element, [e]);
      off(element, eventName, handlerWrapper, options);
    }
  }
  on(element, eventName, handlerWrapper, options);
}

/**
 * A global namespace for passive events support.
 * @type {boolean}
 */
const supportPassive = (() => {
  let result = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        result = true;
        return result;
      },
    });
    one(document, DOMContentLoadedEvent, () => {}, opts);
  } catch (e) {
    throw Error('Passive events are not supported');
  }

  return result;
})();

// general event options

/**
 * A global namespace for most scroll event listeners.
 */
const passiveHandler = supportPassive ? { passive: true } : false;

/**
 * The raw value or a given component option.
 *
 * @typedef {string | HTMLElement | Function | number | boolean | null} niceValue
 */

/**
 * Utility to normalize component options
 *
 * @param {any} value the input value
 * @return {niceValue} the normalized value
 */
function normalizeValue(value) {
  if (value === 'true') { // boolean
    return true;
  }

  if (value === 'false') { // boolean
    return false;
  }

  if (!Number.isNaN(+value)) { // number
    return +value;
  }

  if (value === '' || value === 'null') { // null
    return null;
  }

  // string / function / HTMLElement / object
  return value;
}

/**
 * Shortcut for `Object.keys()` static method.
 * @param  {Record<string, any>} obj a target object
 * @returns {string[]}
 */
const ObjectKeys = (obj) => Object.keys(obj);

/**
 * Utility to normalize component options
 *
 * @param {HTMLElement} element target
 * @param {Record<string, any>} defaultOps component default options
 * @param {Record<string, any>} inputOps component instance options
 * @param {string=} ns component namespace
 * @return {Record<string, any>} normalized component options object
 */
function normalizeOptions(element, defaultOps, inputOps, ns) {
  const data = { ...element.dataset };
  /** @type {Record<string, any>} */
  const normalOps = {};
  /** @type {Record<string, any>} */
  const dataOps = {};

  ObjectKeys(data).forEach((k) => {
    const key = ns && k.includes(ns)
      ? k.replace(ns, '').replace(/[A-Z]/, (match) => match.toLowerCase())
      : k;

    dataOps[key] = normalizeValue(data[k]);
  });

  ObjectKeys(inputOps).forEach((k) => {
    inputOps[k] = normalizeValue(inputOps[k]);
  });

  ObjectKeys(defaultOps).forEach((k) => {
    if (k in inputOps) {
      normalOps[k] = inputOps[k];
    } else if (k in dataOps) {
      normalOps[k] = dataOps[k];
    } else {
      normalOps[k] = defaultOps[k];
    }
  });

  return normalOps;
}

/**
 * @type {object} spicrConnect
 * @property {function} carousel
 * @property {function} layer
 * @property {function} reset
 * @property {function} fromTo
 */
const spicrConnect = {};

/**
 * Returns proper values from string attribute values.
 * @param {Element} elem target layer
 * @param {string} attributeString attribute value
 * @param {number | boolean} isOrigin attribute is transform-origin
 * @returns {Spicr.layerData} layer data ready to tween
 */
function processLayerData(elem, attributeString, isOrigin) {
  const attributesArray = attributeString.trim().split(/[,|;]/);
  const obj = {};

  attributesArray.forEach((x) => {
    const prop = x.split(/[:|=]/);
    const pName = prop[0];
    const pValue = prop[1];
    const offsetType = /y/i.test(pName) || /v/i.test(pValue) ? 'offsetHeight' : 'offsetWidth';

    if (/x/i.test(pName)) {
      console.log('processLayerData', pName, elem.offsetWidth, offsetType, (parseFloat(pValue) * elem[offsetType]) / 100, pValue);
    }

    if (isOrigin && /%/.test(pValue) && !/z/i.test(pName)) {
      obj[pName] = pValue;
    } else {
      obj[pName] = /%/.test(pValue)
        ? (parseFloat(pValue) * elem[offsetType]) / 100
        : parseFloat(pValue);
    }
  });

  return obj;
}

const defaultSpicrOptions = {
  delay: 250,
  duration: 500,
  easing: 'easingCubicOut',
  interval: 5000,
  touch: true,
  pause: 'hover',
  slides: {
    itemsPerPage: 3,
    totalRealItems: 5,
    activeAlign: 'center',
    gap: 8,
    axis: 'x',
  },
};

/**
 * Returns an object with attribute values specific to Spicr layer.
 * @param {Element} elem target
 * @returns {Object.<string, (number | string)>}
 */
function getAttributes(elem) {
  const obj = {};
  const attr = ['translate', 'rotate', 'scale',
    'transform-origin', 'opacity', 'duration', 'delay', 'easing'];

  attr.forEach((a) => {
    const prop = a === 'transform-origin' ? 'origin' : a;
    obj[prop] = elem.getAttribute(`data-${a}`);
  });
  return obj;
}

/**
 * Returns layer animation settings for DATA API attributes.
 * @param {Element} layer target
 * @returns {Spicr.layerData} values to create a tween object
 */
function getLayerData(layer) {
  const attr = getAttributes(layer);
  const {
    translate, rotate, origin, opacity, easing,
  } = attr;
  let { scale, duration, delay } = attr;

  scale = parseFloat(scale);
  duration = +duration;
  delay = +delay;

  return {
    translate: translate ? processLayerData(layer, translate) : '',
    rotate: rotate ? processLayerData(layer, rotate) : '',
    origin: origin ? processLayerData(layer, origin, 1) : '',
    scale: !Number.isNaN(scale) ? scale : '',
    opacity: opacity !== 'false' ? 1 : 0,
    duration: !Number.isNaN(duration) ? duration : defaultSpicrOptions.duration,
    delay: !Number.isNaN(delay) ? delay : 0,
    easing: easing || defaultSpicrOptions.easing,
  };
}

/**
 * Returns an `Array` with all layers from a slide / Spicr element.
 * @param {Element} elem target
 * @returns {Element[]} an `Array` of Spicr layers
 */
function getLayers(elem) {
  return Array.from(elem.getElementsByClassName('spicr-layer'));
}

/**
 * Returns an `Array` or Tween objects for all layers
 * of the current active slider item and / or the next active item.
 *
 * @param {Element[]} slides spicr items
 * @param {number} idx current active index
 * @param {number} next next active index
 * @returns {KUTE.TweenBase[]} an `Array` of tween objects
 */
function animateSliderLayers(slides, idx, next) {
  const activeItem = slides[idx] || slides[0];
  const allLayers = getLayers(activeItem);
  const isIn = activeItem.classList.contains('active');
  const nextItem = slides[next];
  const nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0];
  const nextData = nextBg ? getLayerData(nextBg) : 0;

  if (nextData) {
    Object.keys(nextData).forEach((x) => {
      if (/translate|rotate/.test(x) && nextData[x] instanceof Object) {
        Object.keys(nextData[x]).forEach((y) => {
          nextData[x][y] = -nextData[x][y];
        });
      }
    });
    return allLayers.map((x) => spicrConnect.layer(x, 0, nextData));
  }
  return allLayers.map((x) => spicrConnect.layer(x, isIn ? 0 : 1));
}

// SPICR DEFINITION
// ================
/**
 * Returns a new Spicr instance
 * @param {Element | string} el target element
 * @param {Spicr.spicrOptions} ops instance options
 */
function Spicr(el, ops) {
  const element = queryElement(el);

  // set options
  const options = normalizeOptions(element, defaultSpicrOptions, (ops || {}));

  // internal bind
  const self = this;
  self.tweens = [];
  let tws = self.tweens;
  let vars = {};

  // SPICR UTILITIES
  let pauseEvents = mouseHoverEvents;
  if (supportTouch && isMobile) {
    pauseEvents = ['touchstart', 'touchend'];
  }

  // options
  const pauseOption = options.pause; // false / hover
  const touchOption = options.touch; // boolean
  const { gap, axis } = options.slides;

  const intervalOption = options.interval; // integer / false

  // child elements
  const slides = element.getElementsByClassName('item');

  // controls
  const controls = element.querySelectorAll('[data-slide]');
  const leftArrow = controls.length && controls[0];
  const rightArrow = controls.length && controls[1];

  // pages
  const pageNav = element.getElementsByClassName('spicr-pages')[0];
  const pages = pageNav && pageNav.querySelectorAll('[data-slide-to]');

  // internal variables and / or constants
  let timer = null;
  let slideDirection = null;
  let index = 0;

  let isAnimating = 0;

  // spicr type
  const isSlides = element.classList.contains('spicr-slides');
  const isSlider = !isSlides && element.classList.contains('spicr-slider');
  const isCarousel = element.classList.contains('spicr-carousel');

  if (isSlides) {
    index = (options.slides.itemsPerPage + getTtlItemsFrActive()) + 1 - 1;
    // itemsPerPage = 3, if center getTtlItemsFrActive = 1 , so 4 items from active. it shud be the 5th item that is Active hence + 1. but index start from 0 so - 1
    console.log('init index', index);
  }
  // event handlers
  function pauseHandler() {
    if (!element.classList.contains('paused')) {
      element.classList.add('paused');
      if (!isAnimating) { clearInterval(timer); timer = null; }
    }
  }
  function resumeHandler() {
    if (element.classList.contains('paused')) {
      element.classList.remove('paused');
      if (!isAnimating) {
        clearInterval(timer);
        timer = null;
        self.cycle();
      }
    }
  }
  function pageHandler(e) { // pages
    e.preventDefault();
    if (isAnimating) { return; }
    const eventTarget = e.target;
    const nextIndex = eventTarget && eventTarget.getAttribute('data-slide-to');

    if (eventTarget && !eventTarget.classList.contains('active') && nextIndex) {
      index = parseInt(nextIndex, 10);
      self.slideTo(index);
    }
  }
  function controlsHandler(e) { // left | right
    e.preventDefault();
    if (isAnimating) { return; }
    const eventTarget = this;

    if (eventTarget === rightArrow || rightArrow.contains(eventTarget)) {
      index += 1;
    } else if (eventTarget === leftArrow || leftArrow.contains(eventTarget)) {
      index -= 1;
    }
    self.slideTo(index);
  }
  // touch events
  function touchDownHandler(e) {
    if (vars.isTouch) { return; }

    vars.startX = e.changedTouches[0].pageX;

    if (element.contains(e.target)) {
      vars.isTouch = true;
      toggleTouchEvents(1);
    }
  }
  function touchMoveHandler(e) {
    if (!vars.isTouch) { return; }

    vars.currentX = e.changedTouches[0].pageX;

    // cancel touch if more than one changedTouches detected
    if (e.type === 'touchmove' && e.changedTouches.length > 1) {
      e.preventDefault();
    }
  }
  function touchEndHandler(e) {
    if (!vars.isTouch || isAnimating) { return; }

    vars.endX = vars.currentX || e.changedTouches[0].pageX;

    if (vars.isTouch) {
      if ((!element.contains(e.target) || !element.contains(e.relatedTarget))
          && Math.abs(vars.startX - vars.endX) < 75) {
        return;
      }
      if (vars.currentX < vars.startX) {
        index += 1;
      } else if (vars.currentX > vars.startX) {
        index -= 1;
      }
      vars.isTouch = false;
      self.slideTo(index);

      toggleTouchEvents(); // remove
    }
  }
  function toggleTouchEvents(add) {
    const action = add ? 'addEventListener' : 'removeEventListener';
    element[action]('touchmove', touchMoveHandler, passiveHandler);
    element[action]('touchend', touchEndHandler, passiveHandler);
  }
  // private methods
  function toggleEvents(add) {
    const action = add ? 'addEventListener' : 'removeEventListener';
    if (pauseOption === 'hover' && intervalOption) {
      element[action](pauseEvents[0], pauseHandler);
      element[action](pauseEvents[1], resumeHandler);
    }
    if (rightArrow) { rightArrow[action]('click', controlsHandler); }
    if (leftArrow) { leftArrow[action]('click', controlsHandler); }

    if (touchOption && slides.length > 1) element[action]('touchstart', touchDownHandler, passiveHandler);

    // pages
    if (pageNav) { pageNav[action]('click', pageHandler); }
  }
  function setActivePage(pageIndex) {
    Array.from(pages).map((x) => x.classList.remove('active'));
    if (pageIndex) pageIndex.classList.add('active');
  }
  function beforeTween(current, next) {
    index = next;
    slides[next].classList.add('next');
    isAnimating = true;

    if (isCarousel && current > -1 && slides[current].offsetHeight !== slides[next].offsetHeight) {
      element.style.height = getComputedStyle(slides[current]).height;
    }
  }
  function afterTween(activeIndex, nextItem) {
    slides[nextItem].classList.add('active');
    slides[nextItem].classList.remove('next');

    if (slides[activeIndex]) {
      slides[activeIndex].classList.remove('active');
    }

    setTimeout(() => {
      if (isCarousel) {
        element.style.height = '';
      }
      if (isSlides) {
        console.log('options.slides', options.slides);
        const ttlItemsFrActive = getTtlItemsFrActive();
        // if (options.slides.activeAlign === 'center') {
        //   ttlItemsFrActive = (options.slides.itemsPerPage - 1) / 2; // 3 -1 /2 = 1
        // } else if (options.slides.activeAlign === 'right') {
        //   ttlItemsFrActive = options.slides.itemsPerPage;
        // }

        console.log('nextItem (active 1)', nextItem);
        console.log('ttlItemsFrActive', ttlItemsFrActive);
        const indexOfFirstItemOnPg = nextItem - ttlItemsFrActive;
        // if nextItem is  3, 3- 1 , means index 2 is first Item on the page
        console.log('indexOfFirstItemOnPg', indexOfFirstItemOnPg);
        const maxIdxLClones = options.slides.itemsPerPage - 1;
        // start from 0 ,  3 - 1 =2 , the 3rd item , index is alwys - 1
        console.log('maxIdxLClones', maxIdxLClones);
        const minIdxRClones = (options.slides.itemsPerPage + options.slides.totalRealItems + 1) - 1;
        // start from 0 ,  (3 + 5 + 1 ) the 9th item ,  index is alwys - 1
        console.log('minIdxRClones', minIdxRClones);
        if (maxIdxLClones >= indexOfFirstItemOnPg || indexOfFirstItemOnPg >= minIdxRClones) {
          // so the First Item on the Pg is a cloned item, move it to a real Item
          console.log('chkIsInCloneRange', indexOfFirstItemOnPg, maxIdxLClones >= indexOfFirstItemOnPg >= minIdxRClones);
          const isOnRight = indexOfFirstItemOnPg >= minIdxRClones;
          console.log('isOnRight', isOnRight);
          let moveByTtlItems = options.slides.totalRealItems;
          moveByTtlItems = isOnRight ? -moveByTtlItems : moveByTtlItems;

          console.log('moveByTtlItems', moveByTtlItems);
          const realNextItem = nextItem + moveByTtlItems;
          index = realNextItem;
          console.log('realNextItem', realNextItem);
          const realFirstItemPg = indexOfFirstItemOnPg + moveByTtlItems;
          console.log('realFirstItemPg', realFirstItemPg);
          let itemLength = 0;
          if (axis === 'x') { // slides shud have the same height / width
            itemLength = slides[0].offsetWidth;
          } else {
            itemLength = slides[0].offsetHeight;
          }

          console.log('itemLength', itemLength);

          const pos = ((realFirstItemPg * itemLength) + (gap * realFirstItemPg)) * -1;

          console.log('pos', gap, pos);
          Array.from(slides).forEach((slide, index) => {
            slide.style.transform = `translate${axis.toUpperCase()}(${pos}px)`;
          });
          slides[nextItem].classList.remove('active');
          slides[realNextItem].classList.add('active');

          nextItem = realNextItem;
        }
      } else {
        spicrConnect.reset(element);
      }

      isAnimating = false;
      tws = [];

      /// create & dispatch custom event for afterTween
      const afterTweenEvt = new CustomEvent('afterTween', {
        detail: {
          newActive: nextItem,
        },
      });
      element.dispatchEvent(afterTweenEvt);

      if (intervalOption && !element.classList.contains('paused')) {
        self.cycle();
      }
    }, 0);
  }

  function getTtlItemsFrActive() {
    let ttlItemsFrActive = 0;
    if (options.slides.activeAlign === 'center') {
      ttlItemsFrActive = (options.slides.itemsPerPage - 1) / 2; // 3 -1 /2 = 1
    } else if (options.slides.activeAlign === 'right') {
      ttlItemsFrActive = options.slides.itemsPerPage;
    }
    return ttlItemsFrActive;
  }

  // public methods
  /**
   * Returns the index of the curent active item.
   */
  this.getActiveIndex = () => {
    const activeIndex = element.getElementsByClassName('item active')[0];
    return Array.from(slides).indexOf(activeIndex);
  };

  /**
   * Cycles through items automatically in a pre-configured time interval.
   */
  this.cycle = () => {
    clearInterval(timer);
    timer = setTimeout(() => {
      index += 1;
      self.slideTo(index);
    }, intervalOption);
  };
  /**
   * Slides to a certain Spicr item.
   * @param {number} nextIdx the index of the next slide.
   */
  this.slideTo = (nextIdx) => {
    console.log('slideTonextIdx', nextIdx);
    let nextActive = nextIdx;
    const activeIndex = this.getActiveIndex();
    console.log(activeIndex, nextActive, isAnimating);
    if (activeIndex === nextActive || isAnimating) return;

    clearInterval(timer);
    timer = setTimeout(() => {
      // determine slideDirection first
      if ((activeIndex < nextActive) || (activeIndex === 0 && nextActive === slides.length - 1)) {
        slideDirection = 1; // left next
      } else if ((activeIndex > nextActive)
        || (activeIndex === slides.length - 1 && nextActive === 0)) {
        slideDirection = 0; // right prev
      }

      // find the right next index
      if (nextActive < 0) {
        nextActive = slides.length - 1;
      } else if (nextActive >= slides.length) {
        nextActive = 0;
      }

      // do slider work
      if (isSlider) {
        beforeTween(activeIndex, nextActive); // always before creating tween objects

        const animateActiveLayers = activeIndex !== -1
          ? animateSliderLayers(slides, activeIndex, nextActive)
          : animateSliderLayers(slides, activeIndex);

        const animateNextLayers = activeIndex !== -1 && animateSliderLayers(slides, nextActive);

        if (activeIndex === -1) {
          if (animateActiveLayers.length) tws = tws.concat(animateActiveLayers);
        } else {
          if (animateActiveLayers.length) tws = tws.concat(animateActiveLayers);
          if (animateNextLayers.length) tws = tws.concat(animateNextLayers);
        }

        if (tws.length) {
          tws.reduce((x, y) => (x._duration + x._delay > y._duration + y._delay ? x : y))
            ._onComplete = () => afterTween(activeIndex, nextActive);

          tws.forEach((x) => x.start());
        } else {
          afterTween(activeIndex, nextActive);
        }

        if (pages) setActivePage(pages[nextActive]);

      // do carousel work
      } else if (isSlides) {
        beforeTween(activeIndex, nextActive); // always before creating tween objects

        tws = spicrConnect.slides(element, slides, activeIndex, nextActive, slideDirection, axis, gap);

        // temp
        // const animateActiveLayers = activeIndex !== -1
        //   ? animateSliderLayers(slides, activeIndex, nextActive)
        //   : animateSliderLayers(slides, activeIndex);

        // const animateNextLayers = activeIndex !== -1 && animateSliderLayers(slides, nextActive);

        // if (activeIndex === -1) {
        //   if (animateActiveLayers.length) tws = tws.concat(animateActiveLayers);
        // } else {
        //   if (animateActiveLayers.length) tws = tws.concat(animateActiveLayers);
        //   if (animateNextLayers.length) tws = tws.concat(animateNextLayers);
        // }

        if (tws.length) {
          tws.reduce((x, y) => (x._duration + x._delay > y._duration + y._delay ? x : y))
            ._onComplete = () => afterTween(activeIndex, nextActive);

          tws.forEach((x) => x.start());
        } else {
          afterTween(activeIndex, nextActive);
        }
      } else if (isCarousel) {
        beforeTween(activeIndex, nextActive); // always before creating tween objects

        const { delay, duration, easing } = defaultSpicrOptions;
        const currentSlide = slides[activeIndex];
        const nextSlide = slides[nextActive];

        tws = spicrConnect.carousel(element, slides, activeIndex, nextActive, slideDirection);

        if (tws.length) {
          if (currentSlide && currentSlide.offsetHeight !== nextSlide.offsetHeight) {
            tws.push(spicrConnect.fromTo(element,
              { height: parseFloat(getComputedStyle(currentSlide).height) },
              { height: parseFloat(getComputedStyle(nextSlide).height) },
              {
                easing,
                duration,
                // delay: Math.max.apply(Math, tws.map((x) => x._delay + x._duration)) || delay,
                delay: Math.max(...tws.map((x) => x._delay + x._duration)) || delay,
              }));
          }
          tws[tws.length - 1]._onComplete = () => afterTween(activeIndex, nextActive);

          tws.forEach((x) => x.start());
        } else {
          afterTween(activeIndex, nextActive);
        }
        if (pages) setActivePage(pages[nextActive]);
      }
    }, 1);
  };
  /**
   * Removes Spicr from target element
   */
  this.dispose = () => {
    if (isAnimating) tws.forEach((x) => x.stop());
    spicrConnect.reset(element);
    vars = {};
    toggleEvents();
    clearInterval(timer);
    delete element.Spicr;
  };

  // remove previous init
  if (element.Spicr) element.Spicr.dispose();

  // INIT
  // next/prev
  toggleEvents(1);
  element.Spicr = self;

  if (!element.getElementsByClassName('item active').length) {
    self.slideTo(0);
  } else if (intervalOption) {
    self.cycle();
  }
}

if (typeof window.KUTE !== 'undefined') {
  spicrConnect.fromTo = window.KUTE.fromTo;
// } else if (typeof K !== 'undefined') {
//   spicrConnect.fromTo = K.fromTo
// } else if (typeof fromTo !== 'undefined') {
//   spicrConnect.fromTo = fromTo
} else {
  throw Error('Spicr requires KUTE.js ^2.0.10');
}

/**
 * Returns an object with attribute values specific to Spicr layer.
 * @param {Element} elem target
 * @returns {Object.<string, (number | string)>}
 */
function getAttributes$1(elem) {
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
function getSlideData(layer, slide) {
  const attr = getAttributes$1(layer);
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
function slidesTF(elem, items, active, next, direction, axis, gap) {
  const carouselTweens = [];
  const data = getSlideData(elem, items[active]);

  const activeItem = items[active];
  const { translate } = data;
  const origin = elem.getAttribute('data-transform-origin');
  const { easing } = data;

  const duration = data.duration || defaultSpicrOptions.duration;
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
function carouselTF(elem, items, active, next, direction) {
  const carouselTweens = [];
  const data = getLayerData(elem);
  const fromActive = {};
  const toActive = {};
  const fromNext = {};
  const toNext = {};
  const activeItem = items[active];
  const activeLayers = activeItem && getLayers(activeItem);
  const nextLayers = getLayers(items[next]);
  const { translate } = data;
  const { rotate } = data;
  const { scale } = data;
  const origin = elem.getAttribute('data-transform-origin');
  const { opacity } = data; // opacity is optional | boolean
  const { easing } = data;

  let duration = data.duration || defaultSpicrOptions.duration;
  let delay = data.delay || +duration / 2;

  if (opacity) {
    fromActive.opacity = 1;
    toActive.opacity = 0;
    fromNext.opacity = 0;
    toNext.opacity = 1;
  }

  if (scale || translate || rotate) {
    fromActive.transform = {};
    toActive.transform = {};
    fromNext.transform = {};
    toNext.transform = {};
  }

  if (scale) {
    fromActive.transform.scale = 1;
    toActive.transform.scale = scale;
    fromNext.transform.scale = scale;
    toNext.transform.scale = 1;
  }

  if (translate) {
    fromActive.transform.translate3d = [0, 0, 0];
    let translateX = 0;
    let translateY = 0;
    let translateZ = 0;
    if ('x' in translate) translateX = direction ? -translate.x : translate.x;
    if ('y' in translate) translateY = direction ? -translate.y : translate.y;
    if ('Z' in translate) translateZ = direction ? -translate.z : translate.z;
    toActive.transform.translate3d = [translateX, translateY, translateZ];
    let fromTX = 0;
    let fromTY = 0;
    let fromTZ = 0;
    if ('x' in translate) fromTX = direction ? translate.x : -translate.x;
    if ('y' in translate) fromTY = direction ? translate.y : -translate.y;
    if ('Z' in translate) fromTZ = direction ? translate.z : -translate.z;
    fromNext.transform.translate3d = [fromTX, fromTY, fromTZ];
    toNext.transform.translate3d = [0, 0, 0];
  }
  if (rotate) {
    fromActive.transform.rotate3d = [0, 0, 0];
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    if ('x' in rotate) rotX = direction ? -rotate.x : rotate.x;
    if ('y' in rotate) rotY = direction ? -rotate.y : rotate.y;
    if ('Z' in rotate) rotZ = direction ? -rotate.z : rotate.z;
    toActive.transform.rotate3d = [rotX, rotY, rotZ];
    let fromRX = 0;
    let fromRY = 0;
    let fromRZ = 0;
    if ('x' in rotate) fromRX = direction ? rotate.x : -rotate.x;
    if ('y' in rotate) fromRY = direction ? rotate.y : -rotate.y;
    if ('Z' in rotate) fromRZ = direction ? rotate.z : -rotate.z;
    fromNext.transform.rotate3d = [fromRX, fromRY, fromRZ];
    toNext.transform.rotate3d = [0, 0, 0];
  }

  if (!direction) {
    if (activeLayers) activeLayers.reverse();
    nextLayers.reverse();
  }

  if (!opacity && !rotate && !translate && !scale) {
    duration = 50;
    delay = 0;
  }

  const optionsActive = { easing, duration };
  const optionsNext = optionsActive;

  if (activeLayers) {
    activeLayers.forEach((x, i) => {
      optionsActive.delay = defaultSpicrOptions.delay * i;
      carouselTweens.push(spicrConnect.fromTo(x, fromActive, toActive, optionsActive));
      if (origin) {
        const o = processLayerData(x, origin);
        let originX = '50%';
        let originY = '50%';
        const originZ = 'z' in o ? ` ${o.z}px` : '';

        if ('x' in o) {
          originX = /%/.test(o.x) ? o.x : `${o.x}px`;
        }
        if ('y' in o) {
          originY = /%/.test(o.y) ? o.y : `${o.y}px`;
        }
        x.style.transformOrigin = `${originX} ${originY}${originZ}`;
      }
    });
  }

  nextLayers.forEach((x, i) => {
    optionsNext.delay = (delay + 50) * i;
    carouselTweens.push(spicrConnect.fromTo(x, fromNext, toNext, optionsNext));
    if (origin) {
      const o = processLayerData(x, origin);
      let originX = '50%';
      let originY = '50%';
      const originZ = 'z' in o ? ` ${o.z}px` : '';

      if ('x' in o) {
        originX = /%/.test(o.x) ? o.x : `${o.x}px`;
      }
      if ('y' in o) {
        originY = /%/.test(o.y) ? o.y : `${o.y}px`;
      }
      x.style.transformOrigin = `${originX} ${originY}${originZ}`;
    }
  });

  return carouselTweens;
}

/**
 * Returns a tween object for a single layer for TransformFunctions component.
 * @param {Element} elem target layer
 * @param {number | boolean} isInAnimation parent slide is next
 * @param {Spicr.layerData} nextData some layer data used when parent is NOT next
 * @returns {KUTE.TweenBase} a new tween object
 */
function layerTF(elem, isInAnimation, nextData) {
  const data = nextData || getLayerData(elem);
  const isBg = elem.classList.contains('item-bg');
  const from = {};
  const to = {};
  const { translate } = data;
  const { rotate } = data;
  const { scale } = data;
  const { origin } = data;
  let { opacity } = data;
  let { duration } = data;
  let { easing } = data;
  let delay = data.delay || (!isBg ? defaultSpicrOptions.delay : 0);

  if (!/InOut/.test(easing) && !nextData) {
    easing = isInAnimation ? easing.replace('In', 'Out') : easing.replace('Out', 'In');
  }
  if (!isInAnimation) {
    duration = !isBg ? duration * 1.5 : duration;
  }

  delay = isInAnimation ? delay : 0;
  opacity = !isInAnimation && isBg && nextData ? 0 : opacity;

  if (opacity) {
    from.opacity = isInAnimation ? 0 : 1;
    to.opacity = isInAnimation ? 1 : 0;
  }

  if (scale || translate || rotate) {
    from.transform = {};
    to.transform = {};
    if (origin) { // origin axis can be 0
      let originX = '50%';
      let originY = '50%';
      const originZ = 'z' in origin ? ` ${origin.z}px` : '';

      if ('x' in origin) {
        originX = /%/.test(origin.x) ? origin.x : `${origin.x}px`;
      }
      if ('y' in origin) {
        originY = /%/.test(origin.y) ? origin.y : `${origin.y}px`;
      }

      elem.style.transformOrigin = `${originX} ${originY}${originZ}`;
    }
  }

  if (scale) {
    from.transform.scale = isInAnimation ? scale : 1;
    to.transform.scale = isInAnimation ? 1 : scale;
  }
  if (translate) {
    const fromTranslateX = isInAnimation && translate.x ? translate.x : 0;
    const toTranslateX = translate.x && !isInAnimation ? translate.x : 0;
    const fromTranslateY = isInAnimation && translate.y ? translate.y : 0;
    const toTranslateY = translate.y && !isInAnimation ? translate.y : 0;
    const fromTranslateZ = isInAnimation && translate.z ? translate.z : 0;
    const toTranslateZ = translate.z && !isInAnimation ? translate.z : 0; // not supported on IE9-

    from.transform.translate3d = [fromTranslateX, fromTranslateY, fromTranslateZ];
    to.transform.translate3d = [toTranslateX, toTranslateY, toTranslateZ];
  }
  if (rotate) {
    const fromRotateX = isInAnimation && rotate.x ? rotate.x : 0;
    const toRotateX = !isInAnimation && rotate.x ? rotate.x : 0;
    const fromRotateY = isInAnimation && rotate.y ? rotate.y : 0;
    const toRotateY = !isInAnimation && rotate.y ? rotate.y : 0;
    const fromRotateZ = isInAnimation && rotate.z ? rotate.z : 0;
    const toRotateZ = !isInAnimation && rotate.z ? rotate.z : 0;

    from.transform.rotate3d = [fromRotateX, fromRotateY, fromRotateZ];
    to.transform.rotate3d = [toRotateX, toRotateY, toRotateZ];
  }
  if (!opacity && !rotate && !translate && !scale) {
    duration = 50;
    delay = 0;
  }

  return spicrConnect.fromTo(elem, from, to, { easing, duration, delay });
}

/**
 * Reset all layers for a Spicr element or a single slide.
 * @param {Element} element target Spicr element or slide
 */
function resetAllLayers(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).forEach((x) => {
    x.style.opacity = '';
    x.style.transform = '';
    x.style.transformOrigin = '';
  });
}

spicrConnect.carousel = carouselTF;
spicrConnect.layer = layerTF;
spicrConnect.reset = resetAllLayers;
spicrConnect.slides = slidesTF;

/**
 * DATA API initialization callback
 *
 * @param {Element=} input target parent, usually the document
 */
function initComponent(input) {
  const lookup = input instanceof Element ? input : document;
  const Spicrs = Array.from(lookup.querySelectorAll('[data-function="spicr"]'));
  Spicrs.forEach((x) => new Spicr(x));
}

// export to "global"
Spicr.initComponent = initComponent;

// initialize when loaded
if (document.body) {
  initComponent();
} else {
  document.addEventListener('DOMContentLoaded', initComponent, { once: true });
}

var version = "1.0.10";

// @ts-ignore

/** @type {string} */
const Version = version;

Object.assign(Spicr, { Version });

export default Spicr;
