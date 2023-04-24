/**
 * Returns proper values from string attribute values.
 * @param {Element} elem target layer
 * @param {string} attributeString attribute value
 * @param {number | boolean} isOrigin attribute is transform-origin
 * @returns {Spicr.layerData} layer data ready to tween
 */
export default function processLayerData(elem: Element, attributeString: string, isOrigin: number | boolean): Spicr.layerData;
