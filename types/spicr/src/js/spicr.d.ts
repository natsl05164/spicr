/**
 * Returns a new Spicr instance
 * @param {Element | string} el target element
 * @param {Spicr.spicrOptions} ops instance options
 */
export default function Spicr(el: Element | string, ops: Spicr.spicrOptions): void;
export default class Spicr {
    /**
     * Returns a new Spicr instance
     * @param {Element | string} el target element
     * @param {Spicr.spicrOptions} ops instance options
     */
    constructor(el: Element | string, ops: Spicr.spicrOptions);
    tweens: any[];
    /**
     * Returns the index of the curent active item.
     */
    getActiveIndex: () => number;
    /**
     * Cycles through items automatically in a pre-configured time interval.
     */
    cycle: () => void;
    /**
     * Slides to a certain Spicr item.
     * @param {number} nextIdx the index of the next slide.
     */
    slideTo: (nextIdx: number) => void;
    /**
     * Removes Spicr from target element
     */
    dispose: () => void;
}
