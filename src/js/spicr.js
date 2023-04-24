import queryElement from 'shorter-js/src/misc/queryElement';
import isMobile from 'shorter-js/src/boolean/isMobile';
import supportTouch from 'shorter-js/src/boolean/supportTouch';
import mouseHoverEvents from 'shorter-js/src/strings/mouseHoverEvents';
import passiveHandler from 'shorter-js/src/misc/passiveHandler';
import normalizeOptions from 'shorter-js/src/misc/normalizeOptions';

import spicrConnect from './util/spicrConnect';
import animateSliderLayers from './process/animateSliderLayers';

// options
import defaultSpicrOptions from './options/defaultOptions';

// SPICR DEFINITION
// ================
/**
 * Returns a new Spicr instance
 * @param {Element | string} el target element
 * @param {Spicr.spicrOptions} ops instance options
 */
export default function Spicr(el, ops) {
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
        }
      } else {
        spicrConnect.reset(element);
      }

      isAnimating = false;
      tws = [];
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
        const { delay, duration, easing } = defaultSpicrOptions;

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
