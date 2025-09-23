/**
 * Calculate the discount that retailers see (with margin-based commission applied)
 * @param originalDiscount - The original discount percentage offered by distributor
 * @param productClass - The product class (A, B, C, D, E) to determine margin
 * @param marginValue - The margin percentage for the product class
 * @returns The retailer discount percentage after margin commission is deducted
 */
export const calculateRetailerDiscount = (
  originalDiscount: number, 
  productClass: string = 'D', 
  marginValue: number = 6
): number => {
  // Apply margin-based commission: retailer sees discount minus margin rate
  // So if distributor offers 20% and margin is 5%, retailer sees 19% (20% - 1%)
  const marginAmount = originalDiscount * (marginValue / 100);
  const retailerDiscount = originalDiscount - marginAmount;
  
  // Ensure the discount doesn't go below 0
  return Math.max(0, retailerDiscount);
};

/**
 * Calculate the final price for retailer based on margin-based discount
 * @param mrp - Maximum Retail Price
 * @param originalDiscount - The original discount percentage offered by distributor
 * @param productClass - The product class (A, B, C, D, E) to determine margin
 * @param marginValue - The margin percentage for the product class
 * @returns The final price the retailer pays
 */
export const calculateRetailerPrice = (
  mrp: number, 
  originalDiscount: number, 
  productClass: string = 'D', 
  marginValue: number = 6
): number => {
  const retailerDiscount = calculateRetailerDiscount(originalDiscount, productClass, marginValue);
  return mrp * (1 - retailerDiscount / 100);
};
