/**
 * Calculates the Actual Silver Weight (ASW) for a given item.
 * Handles purity for Junk Silver (90%) or other fractional items.
 * @param {Object} item - The stack item.
 * @returns {number} Total ounces of pure silver for this item entry.
 */
export const calculateItemASW = (item) => {
  const weight = Number(item.weight) || 0;
  const quantity = Number(item.quantity) || 0;
  // Default to 1 (100%) if purity is missing, otherwise use stored purity (e.g., 0.9 for junk)
  const purity = item.purity !== undefined ? Number(item.purity) : 1;

  return weight * quantity * purity;
};

/**
 * Calculates aggregate performance metrics for the entire stack.
 * @param {Array} items - Array of stack items.
 * @param {number} currentSpotPrice - Current market price per ounce.
 * @returns {Object} Performance metrics (Cost Basis, DCA, P&L, etc).
 */
export const calculatePortfolioMetrics = (items, currentSpotPrice) => {
  let totalCostBasis = 0;
  let totalOunces = 0;

  items.forEach((item) => {
    // Sum up the total money spent (Purchase Price)
    totalCostBasis += Number(item.purchasePrice) || 0;

    // Sum up the total pure silver weight
    totalOunces += calculateItemASW(item);
  });

  const currentValue = totalOunces * currentSpotPrice;
  const unrealizedGainLoss = currentValue - totalCostBasis;

  // Portfolio DCA = Total Spent / Total Ounces
  const portfolioDCA = totalOunces > 0 ? totalCostBasis / totalOunces : 0;

  // Percentage Return = (Gain / Cost) * 100
  const percentageReturn = totalCostBasis > 0
    ? (unrealizedGainLoss / totalCostBasis) * 100
    : 0;

  return {
    totalCostBasis,
    totalOunces,
    currentValue,
    unrealizedGainLoss,
    portfolioDCA,
    percentageReturn
  };
};