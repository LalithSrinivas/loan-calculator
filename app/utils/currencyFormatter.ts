/**
 * Formats a number as Indian currency (INR)
 * 
 * This function formats numbers according to Indian currency conventions:
 * - Uses the Indian Rupee symbol (₹)
 * - Formats large numbers in lakhs (L) and crores (Cr)
 * - Uses Indian number formatting (e.g., 1,00,000 instead of 100,000)
 * 
 * @param amount - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  // Convert to absolute value for formatting
  const absoluteValue = Math.abs(amount);
  
  // Convert to crores if value is >= 1 crore
  if (absoluteValue >= 10000000) {
    const crores = (absoluteValue / 10000000).toFixed(2);
    return `₹${crores}Cr`;
  }
  
  // Convert to lakhs if value is >= 1 lakh
  if (absoluteValue >= 100000) {
    const lakhs = (absoluteValue / 100000).toFixed(2);
    return `₹${lakhs}L`;
  }
  
  // For values less than 1 lakh, use Indian number formatting
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
}; 