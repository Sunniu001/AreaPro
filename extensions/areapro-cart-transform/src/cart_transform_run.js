// @ts-check

/**
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 * @typedef {import("../generated/api").Operation} Operation
 */

/**
 * @param {CartTransformRunInput} input
 * @returns {CartTransformRunResult}
 */
export function cartTransformRun(input) {
  /** @type {Operation[]} */
  const operations = [];

  for (const line of input.cart.lines) {
    const isEnabled = line.enabled && line.enabled.value === "true";
    if (!isEnabled) {
      continue;
    }

    const areaVal = line.area ? parseFloat(line.area.value) : 0;
    const rateVal = line.rate ? parseFloat(line.rate.value) : 0;

    if (isNaN(areaVal) || areaVal <= 0 || isNaN(rateVal) || rateVal <= 0) {
      continue;
    }

    const targetPrice = areaVal * rateVal;

    operations.push({
      lineUpdate: {
        cartLineId: line.id,
        price: {
          adjustment: {
            fixedPricePerUnit: {
              amount: targetPrice.toFixed(2),
            },
          },
        },
      },
    });
  }

  return {
    operations,
  };
}