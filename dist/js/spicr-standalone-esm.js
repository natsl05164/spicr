/*!
* Spicr v1.0.10 (http://thednp.github.io/spicr)
* Copyright 2017-2021 © thednp
* Licensed under MIT (https://github.com/thednp/spicr/blob/master/LICENSE)
*/
/**
 * The KUTE.js Execution Context
 */
const KEC = {};

const Tweens = [];

let gl0bal;

if (typeof global !== 'undefined') gl0bal = global;
else if (typeof window !== 'undefined') gl0bal = window.self;
else gl0bal = {};

const globalObject = gl0bal;

// KUTE.js INTERPOLATE FUNCTIONS
// =============================
const interpolate = {};

// schedule property specific function on animation start
// link property update function to KUTE.js execution context
const onStart = {};

// Include a performance.now polyfill.
// source https://github.com/tweenjs/tween.js/blob/master/src/Now.ts
let performanceNow;

// In node.js, use process.hrtime.
// eslint-disable-next-line
// @ts-ignore
if (typeof self === 'undefined' && typeof process !== 'undefined' && process.hrtime) {
  performanceNow = () => {
    // eslint-disable-next-line
		// @ts-ignore
    const time = process.hrtime();

    // Convert [seconds, nanoseconds] to milliseconds.
    return time[0] * 1000 + time[1] / 1000000;
  };
} else if (typeof self !== 'undefined' && self.performance !== undefined && self.performance.now !== undefined) {
  // In a browser, use self.performance.now if it is available.
  // This must be bound, because directly assigning this function
  // leads to an invocation exception in Chrome.
  performanceNow = self.performance.now.bind(self.performance);
} else if (typeof Date !== 'undefined' && Date.now) {
  // Use Date.now if it is available.
  performanceNow = Date.now;
} else {
  // Otherwise, use 'new Date().getTime()'.
  performanceNow = () => new Date().getTime();
}

const now = performanceNow;

const Time = {};
Time.now = now;

// eslint-disable-next-line import/no-mutable-exports -- impossible to satisfy
let Tick = 0;

/**
 *
 * @param {number | Date} time
 */
const Ticker = (time) => {
  let i = 0;
  while (i < Tweens.length) {
    if (Tweens[i].update(time)) {
      i += 1;
    } else {
      Tweens.splice(i, 1);
    }
  }
  Tick = requestAnimationFrame(Ticker);
};

// stop requesting animation frame
function stop() {
  setTimeout(() => { // re-added for #81
    if (!Tweens.length && Tick) {
      cancelAnimationFrame(Tick);
      Tick = null;
      Object.keys(onStart).forEach((obj) => {
        if (typeof (onStart[obj]) === 'function') {
          if (KEC[obj]) delete KEC[obj];
        } else {
          Object.keys(onStart[obj]).forEach((prop) => {
            if (KEC[prop]) delete KEC[prop];
          });
        }
      });

      Object.keys(interpolate).forEach((i) => {
        if (KEC[i]) delete KEC[i];
      });
    }
  }, 64);
}

// render update functions
// =======================
const Render = {
  Tick, Ticker, Tweens, Time,
};
Object.keys(Render).forEach((blob) => {
  if (!KEC[blob]) {
    KEC[blob] = blob === 'Time' ? Time.now : Render[blob];
  }
});

globalObject._KUTE = KEC;

const defaultOptions = {
  duration: 700,
  delay: 0,
  easing: 'linear',
  repeat: 0,
  repeatDelay: 0,
  yoyo: false,
  resetStart: false,
  offset: 0,
};

// link properties to interpolate functions
const linkProperty = {};

// schedule property specific function on animation complete
const onComplete = {};

const Objects = {
  defaultOptions,
  linkProperty,
  onStart,
  onComplete,
};

// util - a general object for utils like rgbToHex, processEasing
const Util = {};

const connect = {};
/** @type {KUTE.TweenBase | KUTE.Tween | KUTE.TweenExtra} */
connect.tween = null;
connect.processEasing = null;

// Robert Penner's Easing Functions
// updated for ESLint
const Easing = {
  /** @type {KUTE.easingFunction} */
  linear: (t) => t,
  /** @type {KUTE.easingFunction} */
  easingSinusoidalIn: (t) => -Math.cos((t * Math.PI) / 2) + 1,
  /** @type {KUTE.easingFunction} */
  easingSinusoidalOut: (t) => Math.sin((t * Math.PI) / 2),
  /** @type {KUTE.easingFunction} */
  easingSinusoidalInOut: (t) => -0.5 * (Math.cos(Math.PI * t) - 1),
  /** @type {KUTE.easingFunction} */
  easingQuadraticIn: (t) => t * t,
  /** @type {KUTE.easingFunction} */
  easingQuadraticOut: (t) => t * (2 - t),
  /** @type {KUTE.easingFunction} */
  easingQuadraticInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  /** @type {KUTE.easingFunction} */
  easingCubicIn: (t) => t * t * t,
  /** @type {KUTE.easingFunction} */
  easingCubicOut: (t0) => { const t = t0 - 1; return t * t * t + 1; },
  /** @type {KUTE.easingFunction} */
  easingCubicInOut: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  /** @type {KUTE.easingFunction} */
  easingQuarticIn: (t) => t * t * t * t,
  /** @type {KUTE.easingFunction} */
  easingQuarticOut: (t0) => { const t = t0 - 1; return 1 - t * t * t * t; },
  /** @type {KUTE.easingFunction} */
  easingQuarticInOut: (t0) => {
    let t = t0;
    if (t < 0.5) return 8 * t * t * t * t;
    t -= 1; return 1 - 8 * t * t * t * t;
  },
  /** @type {KUTE.easingFunction} */
  easingQuinticIn: (t) => t * t * t * t * t,
  /** @type {KUTE.easingFunction} */
  easingQuinticOut: (t0) => { const t = t0 - 1; return 1 + t * t * t * t * t; },
  /** @type {KUTE.easingFunction} */
  easingQuinticInOut: (t0) => {
    let t = t0;
    if (t < 0.5) return 16 * t * t * t * t * t;
    t -= 1; return 1 + 16 * t * t * t * t * t;
  },
  /** @type {KUTE.easingFunction} */
  easingCircularIn: (t) => -(Math.sqrt(1 - (t * t)) - 1),
  /** @type {KUTE.easingFunction} */
  easingCircularOut: (t0) => { const t = t0 - 1; return Math.sqrt(1 - t * t); },
  /** @type {KUTE.easingFunction} */
  easingCircularInOut: (t0) => {
    let t = t0 * 2;
    if (t < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
    t -= 2; return 0.5 * (Math.sqrt(1 - t * t) + 1);
  },
  /** @type {KUTE.easingFunction} */
  easingExponentialIn: (t) => 2 ** (10 * (t - 1)) - 0.001,
  /** @type {KUTE.easingFunction} */
  easingExponentialOut: (t) => 1 - 2 ** (-10 * t),
  /** @type {KUTE.easingFunction} */
  easingExponentialInOut: (t0) => {
    const t = t0 * 2;
    if (t < 1) return 0.5 * (2 ** (10 * (t - 1)));
    return 0.5 * (2 - 2 ** (-10 * (t - 1)));
  },
  /** @type {KUTE.easingFunction} */
  easingBackIn: (t) => { const s = 1.70158; return t * t * ((s + 1) * t - s); },
  /** @type {KUTE.easingFunction} */
  easingBackOut: (t0) => {
    const s = 1.70158;
    const t = t0 - 1;
    return t * t * ((s + 1) * t + s) + 1;
  },
  /** @type {KUTE.easingFunction} */
  easingBackInOut: (t0) => {
    const s = 1.70158 * 1.525;
    let t = t0 * 2;
    if (t < 1) return 0.5 * (t * t * ((s + 1) * t - s));
    t -= 2; return 0.5 * (t * t * ((s + 1) * t + s) + 2);
  },
  /** @type {KUTE.easingFunction} */
  easingElasticIn: (t0) => {
    let s;
    let k1 = 0.1;
    const k2 = 0.4;
    let t = t0;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (!k1 || k1 < 1) {
      k1 = 1; s = k2 / 4;
    } else {
      s = ((k2 * Math.asin(1 / k1)) / Math.PI) * 2;
    }
    t -= 1;
    return -(k1 * (2 ** (10 * t)) * Math.sin(((t - s) * Math.PI * 2) / k2));
  },
  /** @type {KUTE.easingFunction} */
  easingElasticOut: (t) => {
    let s;
    let k1 = 0.1;
    const k2 = 0.4;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (!k1 || k1 < 1) {
      k1 = 1;
      s = k2 / 4;
    } else {
      s = ((k2 * Math.asin(1 / k1)) / Math.PI) * 2;
    }
    return k1 * (2 ** (-10 * t)) * Math.sin(((t - s) * Math.PI * 2) / k2) + 1;
  },
  /** @type {KUTE.easingFunction} */
  easingElasticInOut: (t0) => {
    let t = t0;
    let s;
    let k1 = 0.1;
    const k2 = 0.4;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (!k1 || k1 < 1) {
      k1 = 1; s = k2 / 4;
    } else {
      s = k2 * (Math.asin(1 / k1) / Math.PI) * 2;
    }
    t *= 2;
    if (t < 1) {
      return -0.5 * (k1 * (2 ** (10 * (t - 1)))
      * Math.sin(((t - 1 - s) * Math.PI * 2) / k2));
    }
    t -= 1;
    return k1 * (2 ** (-10 * t)) * Math.sin(((t - s) * Math.PI * 2) / k2) * 0.5 + 1;
  },
  /** @type {KUTE.easingFunction} */
  easingBounceIn: (t) => 1 - Easing.easingBounceOut(1 - t),
  /** @type {KUTE.easingFunction} */
  easingBounceOut: (t0) => {
    let t = t0;
    if (t < (1 / 2.75)) { return 7.5625 * t * t; }
    if (t < (2 / 2.75)) { t -= (1.5 / 2.75); return 7.5625 * t * t + 0.75; }
    if (t < (2.5 / 2.75)) { t -= (2.25 / 2.75); return 7.5625 * t * t + 0.9375; }
    t -= (2.625 / 2.75);
    return 7.5625 * t * t + 0.984375;
  },
  /** @type {KUTE.easingFunction} */
  easingBounceInOut: (t) => {
    if (t < 0.5) return Easing.easingBounceIn(t * 2) * 0.5;
    return Easing.easingBounceOut(t * 2 - 1) * 0.5 + 0.5;
  },
};

/**
 * Returns a valid `easingFunction`.
 *
 * @param {KUTE.easingFunction | string} fn function name or constructor
 * @returns {KUTE.easingFunction} a valid easing function
 */
function processEasing(fn) {
  if (typeof fn === 'function') {
    return fn;
  } if (typeof Easing[fn] === 'function') {
    return Easing[fn]; // regular Robert Penner Easing Functions
  }
  return Easing.linear;
}

// Tween constructor needs to know who will process easing functions
connect.processEasing = processEasing;

/**
 * KUTE.add(Tween)
 *
 * @param {KUTE.Tween} tw a new tween to add
 */
const add = (tw) => Tweens.push(tw);

/**
 * KUTE.remove(Tween)
 *
 * @param {KUTE.Tween} tw a new tween to add
 */
const remove = (tw) => {
  const i = Tweens.indexOf(tw);
  if (i !== -1) Tweens.splice(i, 1);
};

/**
 * KUTE.add(Tween)
 *
 * @return {KUTE.Tween[]} tw a new tween to add
 */
const getAll = () => Tweens;

/**
 * KUTE.removeAll()
 */
const removeAll = () => { Tweens.length = 0; };

// all supported properties
const supportedProperties = {};

/**
 * linkInterpolation
 * @this {KUTE.Tween}
 */
function linkInterpolation() { // DON'T change
  Object.keys(linkProperty).forEach((component) => {
    const componentLink = linkProperty[component];
    const componentProps = supportedProperties[component];

    Object.keys(componentLink).forEach((fnObj) => {
      if (typeof (componentLink[fnObj]) === 'function' // ATTR, colors, scroll, boxModel, borderRadius
          && Object.keys(this.valuesEnd).some((i) => (componentProps && componentProps.includes(i))
          || (i === 'attr' && Object.keys(this.valuesEnd[i]).some((j) => componentProps && componentProps.includes(j))))) {
        if (!KEC[fnObj]) KEC[fnObj] = componentLink[fnObj];
      } else {
        Object.keys(this.valuesEnd).forEach((prop) => {
          const propObject = this.valuesEnd[prop];
          if (propObject instanceof Object) {
            Object.keys(propObject).forEach((i) => {
              if (typeof (componentLink[i]) === 'function') { // transformCSS3
                if (!KEC[i]) KEC[i] = componentLink[i];
              } else {
                Object.keys(componentLink[fnObj]).forEach((j) => {
                  if (componentLink[i] && typeof (componentLink[i][j]) === 'function') { // transformMatrix
                    if (!KEC[j]) KEC[j] = componentLink[i][j];
                  }
                });
              }
            });
          }
        });
      }
    });
  });
}

const internals = {
  add,
  remove,
  getAll,
  removeAll,
  stop,
  linkInterpolation,
};

/**
 * selector
 *
 * A selector utility for KUTE.js.
 *
 * @param {KUTE.selectorType} el target(s) or string selector
 * @param {boolean | number} multi when true returns an array/collection of elements
 * @returns {Element | Element[] | null}
 */
function selector(el, multi) {
  try {
    let requestedElem;
    let itemsArray;
    if (multi) {
      itemsArray = el instanceof Array && el.every((x) => x instanceof Element);
      requestedElem = el instanceof HTMLCollection || el instanceof NodeList || itemsArray
        ? el : document.querySelectorAll(el);
    } else {
      requestedElem = el instanceof Element || el === window // scroll
        ? el : document.querySelector(el);
    }
    return requestedElem;
  } catch (e) {
    throw TypeError(`KUTE.js - Element(s) not found: ${el}.`);
  }
}

/**
 * Animation Base Class
 *
 * Registers components by populating KUTE.js objects and makes sure
 * no duplicate component / property is allowed.
 *
 * This class only registers the minimal amount of component information
 * required to enable components animation, which means value processing
 * as well as `to()` and `allTo()` methods are not supported.
 */
class AnimationBase {
  /**
   * @class
   * @param {KUTE.baseComponent} Component
   */
  constructor(Component) {
    const ComponentName = Component.component;
    // const Objects = { defaultValues, defaultOptions, Interpolate, linkProperty }
    const Functions = { onStart, onComplete };
    const Category = Component.category;
    const Property = Component.property;
    // ESLint
    this._ = 0;

    // set supported category/property
    supportedProperties[ComponentName] = Component.properties
      || Component.subProperties || Component.property;

    // set additional options
    if (Component.defaultOptions) {
      // Object.keys(Component.defaultOptions).forEach((op) => {
      //   defaultOptions[op] = Component.defaultOptions[op];
      // });
      Object.assign(defaultOptions, Component.defaultOptions);
    }

    // set functions
    if (Component.functions) {
      Object.keys(Functions).forEach((fn) => {
        if (fn in Component.functions) {
          if (typeof (Component.functions[fn]) === 'function') {
            // if (!Functions[fn][ Category||Property ]) {
            //   Functions[fn][ Category||Property ] = Component.functions[fn];
            // }
            if (!Functions[fn][ComponentName]) Functions[fn][ComponentName] = {};
            if (!Functions[fn][ComponentName][Category || Property]) {
              Functions[fn][ComponentName][Category || Property] = Component.functions[fn];
            }
          } else {
            Object.keys(Component.functions[fn]).forEach((ofn) => {
              // if (!Functions[fn][ofn]) Functions[fn][ofn] = Component.functions[fn][ofn];
              if (!Functions[fn][ComponentName]) Functions[fn][ComponentName] = {};
              if (!Functions[fn][ComponentName][ofn]) {
                Functions[fn][ComponentName][ofn] = Component.functions[fn][ofn];
              }
            });
          }
        }
      });
    }

    // set interpolate
    if (Component.Interpolate) {
      Object.keys(Component.Interpolate).forEach((fni) => {
        const compIntObj = Component.Interpolate[fni];
        if (typeof (compIntObj) === 'function' && !interpolate[fni]) {
          interpolate[fni] = compIntObj;
        } else {
          Object.keys(compIntObj).forEach((sfn) => {
            if (typeof (compIntObj[sfn]) === 'function' && !interpolate[fni]) {
              interpolate[fni] = compIntObj[sfn];
            }
          });
        }
      });

      linkProperty[ComponentName] = Component.Interpolate;
    }

    // set component util
    if (Component.Util) {
      Object.keys(Component.Util).forEach((fnu) => {
        if (!Util[fnu]) Util[fnu] = Component.Util[fnu];
      });
    }

    return { name: ComponentName };
  }
}

function queueStart() {
  // fire onStart actions
  Object.keys(onStart).forEach((obj) => {
    if (typeof (onStart[obj]) === 'function') {
      onStart[obj].call(this, obj); // easing functions
    } else {
      Object.keys(onStart[obj]).forEach((prop) => {
        onStart[obj][prop].call(this, prop);
      });
    }
  });

  // add interpolations
  linkInterpolation.call(this);
}

/**
 * The `TweenBase` constructor creates a new `Tween` object
 * for a single `HTMLElement` and returns it.
 *
 * `TweenBase` is meant to be used with pre-processed values.
 */
class TweenBase {
  /**
   * @param {Element} targetElement the target element
   * @param {KUTE.tweenProps} startObject the start values
   * @param {KUTE.tweenProps} endObject the end values
   * @param {KUTE.tweenOptions} opsObject the end values
   * @returns {TweenBase} the resulting Tween object
   */
  constructor(targetElement, startObject, endObject, opsObject) {
    // element animation is applied to
    this.element = targetElement;

    /** @type {boolean} */
    this.playing = false;
    /** @type {number?} */
    this._startTime = null;
    /** @type {boolean} */
    this._startFired = false;

    // type is set via KUTE.tweenProps
    this.valuesEnd = endObject;
    this.valuesStart = startObject;

    // OPTIONS
    const options = opsObject || {};
    // internal option to process inline/computed style at start instead of init
    // used by to() method and expects object : {} / false
    this._resetStart = options.resetStart || 0;
    // you can only set a core easing function as default
    /** @type {KUTE.easingOption} */
    this._easing = typeof (options.easing) === 'function' ? options.easing : connect.processEasing(options.easing);
    /** @type {number} */
    this._duration = options.duration || defaultOptions.duration; // duration option | default
    /** @type {number} */
    this._delay = options.delay || defaultOptions.delay; // delay option | default

    // set other options
    Object.keys(options).forEach((op) => {
      const internalOption = `_${op}`;
      if (!(internalOption in this)) this[internalOption] = options[op];
    });

    // callbacks should not be set as undefined
    // this._onStart = options.onStart
    // this._onUpdate = options.onUpdate
    // this._onStop = options.onStop
    // this._onComplete = options.onComplete

    // queue the easing
    const easingFnName = this._easing.name;
    if (!onStart[easingFnName]) {
      onStart[easingFnName] = function easingFn(prop) {
        if (!KEC[prop] && prop === this._easing.name) KEC[prop] = this._easing;
      };
    }

    return this;
  }

  /**
   * Starts tweening
   * @param {number?} time the tween start time
   * @returns {TweenBase} this instance
   */
  start(time) {
    // now it's a good time to start
    add(this);
    this.playing = true;

    this._startTime = typeof time !== 'undefined' ? time : KEC.Time();
    this._startTime += this._delay;

    if (!this._startFired) {
      if (this._onStart) {
        this._onStart.call(this);
      }

      queueStart.call(this);

      this._startFired = true;
    }

    if (!Tick) Ticker();
    return this;
  }

  /**
   * Stops tweening
   * @returns {TweenBase} this instance
   */
  stop() {
    if (this.playing) {
      remove(this);
      this.playing = false;

      if (this._onStop) {
        this._onStop.call(this);
      }
      this.close();
    }
    return this;
  }

  /**
   * Trigger internal completion callbacks.
   */
  close() {
    // scroll|transformMatrix need this
    Object.keys(onComplete).forEach((component) => {
      Object.keys(onComplete[component]).forEach((toClose) => {
        onComplete[component][toClose].call(this, toClose);
      });
    });
    // when all animations are finished, stop ticking after ~3 frames
    this._startFired = false;
    stop.call(this);
  }

  /**
   * Schedule another tween instance to start once this one completes.
   * @param {KUTE.chainOption} args the tween animation start time
   * @returns {TweenBase} this instance
   */
  chain(args) {
    this._chain = [];
    this._chain = args.length ? args : this._chain.concat(args);
    return this;
  }

  /**
   * Stop tweening the chained tween instances.
   */
  stopChainedTweens() {
    if (this._chain && this._chain.length) this._chain.forEach((tw) => tw.stop());
  }

  /**
   * Update the tween on each tick.
   * @param {number} time the tick time
   * @returns {boolean} this instance
   */
  update(time) {
    const T = time !== undefined ? time : KEC.Time();

    let elapsed;

    if (T < this._startTime && this.playing) { return true; }

    elapsed = (T - this._startTime) / this._duration;
    elapsed = (this._duration === 0 || elapsed > 1) ? 1 : elapsed;

    // calculate progress
    const progress = this._easing(elapsed);

    // render the update
    Object.keys(this.valuesEnd).forEach((tweenProp) => {
      KEC[tweenProp](this.element,
        this.valuesStart[tweenProp],
        this.valuesEnd[tweenProp],
        progress);
    });

    // fire the updateCallback
    if (this._onUpdate) {
      this._onUpdate.call(this);
    }

    if (elapsed === 1) {
      // fire the complete callback
      if (this._onComplete) {
        this._onComplete.call(this);
      }

      // now we're sure no animation is running
      this.playing = false;

      // stop ticking when finished
      this.close();

      // start animating chained tweens
      if (this._chain !== undefined && this._chain.length) {
        this._chain.map((tw) => tw.start());
      }

      return false;
    }

    return true;
  }
}

// Update Tween Interface
connect.tween = TweenBase;

const { tween: TweenConstructor } = connect;

/**
 * The `KUTE.fromTo()` static method returns a new Tween object
 * for a single `HTMLElement` at a given state.
 *
 * @param {Element} element target element
 * @param {KUTE.tweenProps} startObject
 * @param {KUTE.tweenProps} endObject
 * @param {KUTE.tweenOptions} optionsObj tween options
 * @returns {KUTE.Tween} the resulting Tween object
 */
function fromTo(element, startObject, endObject, optionsObj) {
  const options = optionsObj || {};
  return new TweenConstructor(selector(element), startObject, endObject, options);
}

/**
 * Perspective Interpolation Function.
 *
 * @param {number} a start value
 * @param {number} b end value
 * @param {string} u unit
 * @param {number} v progress
 * @returns {string} the perspective function in string format
 */
function perspective(a, b, u, v) {
  // eslint-disable-next-line no-bitwise
  return `perspective(${((a + (b - a) * v) * 1000 >> 0) / 1000}${u})`;
}

/**
 * Translate 3D Interpolation Function.
 *
 * @param {number[]} a start [x,y,z] position
 * @param {number[]} b end [x,y,z] position
 * @param {string} u unit, usually `px` degrees
 * @param {number} v progress
 * @returns {string} the interpolated 3D translation string
 */
function translate3d(a, b, u, v) {
  const translateArray = [];
  for (let ax = 0; ax < 3; ax += 1) {
    translateArray[ax] = (a[ax] || b[ax]
      // eslint-disable-next-line no-bitwise
      ? ((a[ax] + (b[ax] - a[ax]) * v) * 1000 >> 0) / 1000 : 0) + u;
  }
  return `translate3d(${translateArray.join(',')})`;
}

/**
 * 3D Rotation Interpolation Function.
 *
 * @param {number} a start [x,y,z] angles
 * @param {number} b end [x,y,z] angles
 * @param {string} u unit, usually `deg` degrees
 * @param {number} v progress
 * @returns {string} the interpolated 3D rotation string
 */
function rotate3d(a, b, u, v) {
  let rotateStr = '';
  // eslint-disable-next-line no-bitwise
  rotateStr += a[0] || b[0] ? `rotateX(${((a[0] + (b[0] - a[0]) * v) * 1000 >> 0) / 1000}${u})` : '';
  // eslint-disable-next-line no-bitwise
  rotateStr += a[1] || b[1] ? `rotateY(${((a[1] + (b[1] - a[1]) * v) * 1000 >> 0) / 1000}${u})` : '';
  // eslint-disable-next-line no-bitwise
  rotateStr += a[2] || b[2] ? `rotateZ(${((a[2] + (b[2] - a[2]) * v) * 1000 >> 0) / 1000}${u})` : '';
  return rotateStr;
}

/**
 * Translate 2D Interpolation Function.
 *
 * @param {number[]} a start [x,y] position
 * @param {number[]} b end [x,y] position
 * @param {string} u unit, usually `px` degrees
 * @param {number} v progress
 * @returns {string} the interpolated 2D translation string
 */
function translate(a, b, u, v) {
  const translateArray = [];
  // eslint-disable-next-line no-bitwise
  translateArray[0] = (a[0] === b[0] ? b[0] : ((a[0] + (b[0] - a[0]) * v) * 1000 >> 0) / 1000) + u;
  // eslint-disable-next-line no-bitwise
  translateArray[1] = a[1] || b[1] ? ((a[1] === b[1] ? b[1] : ((a[1] + (b[1] - a[1]) * v) * 1000 >> 0) / 1000) + u) : '0';
  return `translate(${translateArray.join(',')})`;
}

/**
 * 2D Rotation Interpolation Function.
 *
 * @param {number} a start angle
 * @param {number} b end angle
 * @param {string} u unit, usually `deg` degrees
 * @param {number} v progress
 * @returns {string} the interpolated rotation
 */
function rotate(a, b, u, v) {
  // eslint-disable-next-line no-bitwise
  return `rotate(${((a + (b - a) * v) * 1000 >> 0) / 1000}${u})`;
}

/**
 * Scale Interpolation Function.
 *
 * @param {number} a start scale
 * @param {number} b end scale
 * @param {number} v progress
 * @returns {string} the interpolated scale
 */
function scale(a, b, v) {
  // eslint-disable-next-line no-bitwise
  return `scale(${((a + (b - a) * v) * 1000 >> 0) / 1000})`;
}

/**
 * Skew Interpolation Function.
 *
 * @param {number} a start {x,y} angles
 * @param {number} b end {x,y} angles
 * @param {string} u unit, usually `deg` degrees
 * @param {number} v progress
 * @returns {string} the interpolated string value of skew(s)
 */
function skew(a, b, u, v) {
  const skewArray = [];
  // eslint-disable-next-line no-bitwise
  skewArray[0] = (a[0] === b[0] ? b[0] : ((a[0] + (b[0] - a[0]) * v) * 1000 >> 0) / 1000) + u;
  // eslint-disable-next-line no-bitwise
  skewArray[1] = a[1] || b[1] ? ((a[1] === b[1] ? b[1] : ((a[1] + (b[1] - a[1]) * v) * 1000 >> 0) / 1000) + u) : '0';
  return `skew(${skewArray.join(',')})`;
}

// Component Functions
/**
 * Sets the property update function.
 * * same to svgTransform, htmlAttributes
 * @param {string} tweenProp the property name
 */
function onStartTransform(tweenProp) {
  if (!KEC[tweenProp] && this.valuesEnd[tweenProp]) {
    KEC[tweenProp] = (elem, a, b, v) => {
      // eslint-disable-next-line no-param-reassign
      elem.style[tweenProp] = (a.perspective || b.perspective ? perspective(a.perspective, b.perspective, 'px', v) : '') // one side might be 0
        + (a.translate3d ? translate3d(a.translate3d, b.translate3d, 'px', v) : '') // array [x,y,z]
        + (a.rotate3d ? rotate3d(a.rotate3d, b.rotate3d, 'deg', v) : '') // array [x,y,z]
        + (a.skew ? skew(a.skew, b.skew, 'deg', v) : '') // array [x,y]
        + (a.scale || b.scale ? scale(a.scale, b.scale, v) : ''); // one side might be 0
    };
  }
}

// Base Component
const TransformFunctionsBase = {
  component: 'baseTransform',
  property: 'transform',
  functions: { onStart: onStartTransform },
  Interpolate: {
    perspective,
    translate3d,
    rotate3d,
    translate,
    rotate,
    scale,
    skew,
  },
};

/**
 * Numbers Interpolation Function.
 *
 * @param {number} a start value
 * @param {number} b end value
 * @param {number} v progress
 * @returns {number} the interpolated number
 */
function numbers(a, b, v) {
  const A = +a;
  const B = b - a;
  // a = +a; b -= a;
  return A + B * v;
}

/* opacityProperty = {
  property: 'opacity',
  defaultValue: 1,
  interpolators: {numbers},
  functions = { prepareStart, prepareProperty, onStart }
} */

// Component Functions
/**
 * Sets the property update function.
 * @param {string} tweenProp the property name
 */
function onStartOpacity(tweenProp/* , value */) {
  // opacity could be 0 sometimes, we need to check regardless
  if (tweenProp in this.valuesEnd && !KEC[tweenProp]) {
    KEC[tweenProp] = (elem, a, b, v) => {
      /* eslint-disable */
      elem.style[tweenProp] = ((numbers(a, b, v) * 1000) >> 0) / 1000;
      /* eslint-enable */
    };
  }
}

// Base Component
const OpacityPropertyBase = {
  component: 'baseOpacity',
  property: 'opacity',
  // defaultValue: 1,
  Interpolate: { numbers },
  functions: { onStart: onStartOpacity },
};

// Component Functions
/**
 * Sets the update function for the property.
 * @param {string} tweenProp the property name
 */
function boxModelOnStart(tweenProp) {
  if (tweenProp in this.valuesEnd && !KEC[tweenProp]) {
    KEC[tweenProp] = (elem, a, b, v) => {
      /* eslint-disable no-param-reassign -- impossible to satisfy */
      /* eslint-disable no-bitwise -- impossible to satisfy */
      elem.style[tweenProp] = `${v > 0.99 || v < 0.01
        ? ((numbers(a, b, v) * 10) >> 0) / 10
        : (numbers(a, b, v)) >> 0}px`;
      /* eslint-enable no-bitwise */
      /* eslint-enable no-param-reassign */
    };
  }
}

// Component Base Props
const baseBoxProps = ['top', 'left', 'width', 'height'];
const baseBoxOnStart = {};
baseBoxProps.forEach((x) => { baseBoxOnStart[x] = boxModelOnStart; });

// Component Base
const BoxModelBase = {
  component: 'baseBoxModel',
  category: 'boxModel',
  properties: baseBoxProps,
  Interpolate: { numbers },
  functions: { onStart: baseBoxOnStart },
};

/**
 * Utility to check if target is typeof Element
 * or find one that matches a selector.
 *
 * @param {Element | string} selector the input selector or target element
 * @param {Element | null} parent optional Element to look into
 * @return {Element | null} the Element or result of the querySelector
 */
function queryElement(selector, parent) {
  const lookUp = parent && parent instanceof Element ? parent : document;
  return selector instanceof Element ? selector : lookUp.querySelector(selector);
}

const mobileBrands = /iPhone|iPad|iPod|Android/i;
const userAgentStr = 'userAgentData';

let isMobileCheck = false;

if (navigator[userAgentStr]) {
  isMobileCheck = navigator[userAgentStr].brands.some((x) => mobileBrands.test(x.brand));
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
 * A global namespace for 'addEventListener' string.
 * @type {string}
 */
const addEventListener = 'addEventListener';

/**
 * A global namespace for 'removeEventListener' string.
 * @type {string}
 */
const removeEventListener = 'removeEventListener';

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
    document[addEventListener]('DOMContentLoaded', function wrap() {
      document[removeEventListener]('DOMContentLoaded', wrap, opts);
    }, opts);
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
 * @typedef {string | Element | Function | number | boolean | null} niceValue
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

  // string / function / Element / object
  return value;
}

/**
 * Utility to normalize component options
 *
 * @param {Element} element target
 * @param {object} defaultOps component default options
 * @param {object} inputOps component instance options
 * @param {string} ns component namespace
 * @return {object} normalized component options object
 */
function normalizeOptions(element, defaultOps, inputOps, ns) {
  // @ts-ignore
  const data = { ...element.dataset };
  const normalOps = {};
  const dataOps = {};

  Object.keys(data)
    .forEach((k) => {
      const key = k.includes(ns)
        ? k.replace(ns, '').replace(/[A-Z]/, (match) => match.toLowerCase())
        : k;

      dataOps[key] = normalizeValue(data[k]);
    });

  Object.keys(inputOps)
    .forEach((k) => {
      inputOps[k] = normalizeValue(inputOps[k]);
    });

  Object.keys(defaultOps)
    .forEach((k) => {
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
  const isSlider = element.classList.contains('spicr-slider');
  const isCarousel = element.classList.contains('spicr-carousel');

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
      spicrConnect.reset(element);
      isAnimating = false;
      tws = [];
      if (intervalOption && !element.classList.contains('paused')) {
        self.cycle();
      }
    }, 0);
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
    let nextActive = nextIdx;
    const activeIndex = this.getActiveIndex();

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

// KUTE custom build for Spicr, MODERN BROWSERS

spicrConnect.fromTo = fromTo;

const K = {
  Animation: AnimationBase,
  Components: {
    Transform: new AnimationBase(TransformFunctionsBase),
    Opacity: new AnimationBase(OpacityPropertyBase),
    BoxModel: new AnimationBase(BoxModelBase),
  },
  Tween: TweenBase,
  fromTo,
  Objects,
  Easing,
  Util,
  Render,
  Interpolate: interpolate,
  Internals: internals,
  Selector: selector,
};

Object.assign(Spicr, K);

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

// import kute-base custom build

Spicr.Version = Version;

export default Spicr;
