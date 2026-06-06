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

  // Log the raw input payload to help debug
  console.error("CartTransform input: ", JSON.stringify(input));

  for (const line of input.cart.lines) {
    const areaVal = line.area ? parseFloat(line.area.value) : 0;
    const rateVal = line.rate ? parseFloat(line.rate.value) : 0;

    console.error(`Checking line ${line.id} - Area: ${areaVal}, Rate: ${rateVal}`);

    if (isNaN(areaVal) || areaVal <= 0 || isNaN(rateVal) || rateVal <= 0) {
      continue;
    }

    const targetPrice = areaVal * rateVal;
    console.error(`Adjusting price for line ${line.id} to: ${targetPrice.toFixed(2)}`);

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