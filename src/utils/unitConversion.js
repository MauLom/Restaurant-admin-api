/**
 * Convert `quantity` from `fromUnit` to `toUnit`.
 * Returns null when the two units are incompatible (e.g. grams vs ml).
 *
 * Supported families:
 *   mass  : g ↔ kg
 *   volume: ml ↔ l
 *   count : unit ↔ unidad  (inventory uses 'unit', recipes use 'unidad')
 */
function convertQuantity(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity;

  const massUnits = new Set(['g', 'kg']);
  const volumeUnits = new Set(['ml', 'l']);
  const countUnits = new Set(['unit', 'unidad']);

  if (massUnits.has(fromUnit) && massUnits.has(toUnit)) {
    const grams = fromUnit === 'kg' ? quantity * 1000 : quantity;
    return toUnit === 'kg' ? grams / 1000 : grams;
  }

  if (volumeUnits.has(fromUnit) && volumeUnits.has(toUnit)) {
    const ml = fromUnit === 'l' ? quantity * 1000 : quantity;
    return toUnit === 'l' ? ml / 1000 : ml;
  }

  if (countUnits.has(fromUnit) && countUnits.has(toUnit)) {
    return quantity;
  }

  return null;
}

module.exports = { convertQuantity };
