# Analytics Dashboard Setup Guide

## Installation

Before using the analytics dashboard, you need to install the required charting library:

```bash
npm install recharts
```

## Overview

The Analytics Dashboard provides interactive charts for:
- **Sales Trends**: Revenue, orders, and average order value over time
- **Marketing Trends**: Visits, page views, conversions, and conversion rates

## Features

- ✅ Daily, Weekly, and Monthly time period filters
- ✅ Toggle between Sales and Marketing views
- ✅ Interactive tooltips
- ✅ Responsive design
- ✅ Loading states
- ✅ Empty state handling

## API Integration

The dashboard expects data from:
```
GET /api/v1/analytics/business/:business_id/trends?period=daily|weekly|monthly
```

See [ANALYTICS_API_SPEC.md](./ANALYTICS_API_SPEC.md) for complete API documentation and sample data.

## Component Usage

```tsx
import { TrendsChart } from "@/components/dashboard/TrendsChart";

<TrendsChart
  salesData={salesData}
  marketingData={marketingData}
  loading={false}
/>
```

## Data Format

### Sales Data
```typescript
interface SalesDataPoint {
  date: string;              // ISO date: "2024-01-01"
  revenue: number;           // USD with 2 decimals
  orders: number;            // Integer
  averageOrderValue: number; // USD with 2 decimals
}
```

### Marketing Data
```typescript
interface MarketingDataPoint {
  date: string;              // ISO date: "2024-01-01"
  visits: number;            // Integer
  pageViews: number;         // Integer
  conversions: number;       // Integer
  conversionRate: number;     // Percentage with 2 decimals
}
```

## Backend Implementation Checklist

- [ ] Create `/api/v1/analytics/business/:business_id/trends` endpoint
- [ ] Implement daily aggregation (last 30 days)
- [ ] Implement weekly aggregation (last 12 weeks)
- [ ] Implement monthly aggregation (last 12 months)
- [ ] Calculate average order value
- [ ] Calculate conversion rates
- [ ] Return summary statistics
- [ ] Add proper error handling
- [ ] Add authentication/authorization
- [ ] Add caching for performance

## Testing

Use the sample data provided in `ANALYTICS_API_SPEC.md` to test the frontend before implementing the backend.
