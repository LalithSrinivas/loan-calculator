import { formatCurrency } from '../utils/currencyFormatter';

// Replace all instances of formatIndianCurrency with formatCurrency
// Update YAxis and Tooltip formatters in charts to use formatCurrency

// In the LineChart component:
<YAxis 
  tickFormatter={(value) => formatCurrency(value)}
  width={100}
/>
<Tooltip 
  formatter={(value: number) => formatCurrency(value)}
  labelFormatter={(label) => `Month ${label}`}
/> 