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