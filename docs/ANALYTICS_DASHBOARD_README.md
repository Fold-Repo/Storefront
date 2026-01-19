# Analytics Dashboard - Implementation Guide

## Overview

The Analytics Dashboard provides interactive trend charts for sales and marketing data with daily, weekly, and monthly time period filters. This document provides sample data structures for backend API implementation.

## Installation

First, install the required charting library:

```bash
npm install recharts
```

## Features

- ✅ **Sales Trends Chart**: Revenue, orders, and average order value
- ✅ **Marketing Trends Chart**: Visits, page views, conversions, and conversion rates
- ✅ **Time Period Filters**: Daily, Weekly, Monthly
- ✅ **Interactive Tooltips**: Hover to see detailed values
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Loading States**: Skeleton loaders during data fetch
- ✅ **Empty States**: Graceful handling when no data available

## API Endpoint

```
GET /api/v1/analytics/business/:business_id/trends?period=daily|weekly|monthly
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `business_id` | integer/string | Yes | Business ID (path parameter) |
| `period` | string | Yes | Time period: `daily`, `weekly`, or `monthly` |
| `start_date` | string (ISO 8601) | No | Start date (YYYY-MM-DD). Defaults based on period |
| `end_date` | string (ISO 8601) | No | End date (YYYY-MM-DD). Defaults to today |

## Response Structure

```json
{
  "sales": [
    {
      "date": "2024-01-01",
      "revenue": 1250.50,
      "orders": 15,
      "averageOrderValue": 83.37
    }
  ],
  "marketing": [
    {
      "date": "2024-01-01",
      "visits": 450,
      "pageViews": 1200,
      "conversions": 12,
      "conversionRate": 2.67
    }
  ],
  "summary": {
    "totalRevenue": 45678.90,
    "totalOrders": 567,
    "totalVisits": 12345,
    "totalPageViews": 34567,
    "averageOrderValue": 80.56,
    "conversionRate": 4.59
  }
}
```

## Sample Data for Backend Implementation

### Daily Period Sample (30 days)

```json
{
  "sales": [
    {"date": "2024-01-01", "revenue": 1250.50, "orders": 15, "averageOrderValue": 83.37},
    {"date": "2024-01-02", "revenue": 1890.75, "orders": 22, "averageOrderValue": 85.94},
    {"date": "2024-01-03", "revenue": 2100.00, "orders": 25, "averageOrderValue": 84.00},
    {"date": "2024-01-04", "revenue": 1650.25, "orders": 19, "averageOrderValue": 86.86},
    {"date": "2024-01-05", "revenue": 2300.50, "orders": 28, "averageOrderValue": 82.16},
    {"date": "2024-01-06", "revenue": 1950.00, "orders": 23, "averageOrderValue": 84.78},
    {"date": "2024-01-07", "revenue": 1780.75, "orders": 21, "averageOrderValue": 84.80},
    {"date": "2024-01-08", "revenue": 2200.00, "orders": 26, "averageOrderValue": 84.62},
    {"date": "2024-01-09", "revenue": 2450.25, "orders": 29, "averageOrderValue": 84.49},
    {"date": "2024-01-10", "revenue": 1980.50, "orders": 24, "averageOrderValue": 82.52},
    {"date": "2024-01-11", "revenue": 1675.00, "orders": 20, "averageOrderValue": 83.75},
    {"date": "2024-01-12", "revenue": 2125.75, "orders": 25, "averageOrderValue": 85.03},
    {"date": "2024-01-13", "revenue": 1890.00, "orders": 22, "averageOrderValue": 85.91},
    {"date": "2024-01-14", "revenue": 2250.50, "orders": 27, "averageOrderValue": 83.35},
    {"date": "2024-01-15", "revenue": 1980.25, "orders": 24, "averageOrderValue": 82.51},
    {"date": "2024-01-16", "revenue": 1750.00, "orders": 21, "averageOrderValue": 83.33},
    {"date": "2024-01-17", "revenue": 2100.75, "orders": 25, "averageOrderValue": 84.03},
    {"date": "2024-01-18", "revenue": 1925.50, "orders": 23, "averageOrderValue": 83.72},
    {"date": "2024-01-19", "revenue": 2350.00, "orders": 28, "averageOrderValue": 83.93},
    {"date": "2024-01-20", "revenue": 2050.25, "orders": 25, "averageOrderValue": 82.01},
    {"date": "2024-01-21", "revenue": 1800.00, "orders": 22, "averageOrderValue": 81.82},
    {"date": "2024-01-22", "revenue": 2200.75, "orders": 26, "averageOrderValue": 84.64},
    {"date": "2024-01-23", "revenue": 1950.50, "orders": 24, "averageOrderValue": 81.27},
    {"date": "2024-01-24", "revenue": 2400.00, "orders": 29, "averageOrderValue": 82.76},
    {"date": "2024-01-25", "revenue": 1875.25, "orders": 23, "averageOrderValue": 81.53},
    {"date": "2024-01-26", "revenue": 2150.00, "orders": 26, "averageOrderValue": 82.69},
    {"date": "2024-01-27", "revenue": 1980.75, "orders": 24, "averageOrderValue": 82.53},
    {"date": "2024-01-28", "revenue": 2250.50, "orders": 27, "averageOrderValue": 83.35},
    {"date": "2024-01-29", "revenue": 1900.00, "orders": 23, "averageOrderValue": 82.61},
    {"date": "2024-01-30", "revenue": 2100.25, "orders": 25, "averageOrderValue": 84.01}
  ],
  "marketing": [
    {"date": "2024-01-01", "visits": 450, "pageViews": 1200, "conversions": 12, "conversionRate": 2.67},
    {"date": "2024-01-02", "visits": 520, "pageViews": 1350, "conversions": 18, "conversionRate": 3.46},
    {"date": "2024-01-03", "visits": 480, "pageViews": 1280, "conversions": 15, "conversionRate": 3.13},
    {"date": "2024-01-04", "visits": 510, "pageViews": 1320, "conversions": 14, "conversionRate": 2.75},
    {"date": "2024-01-05", "visits": 550, "pageViews": 1450, "conversions": 20, "conversionRate": 3.64},
    {"date": "2024-01-06", "visits": 490, "pageViews": 1300, "conversions": 16, "conversionRate": 3.27},
    {"date": "2024-01-07", "visits": 470, "pageViews": 1250, "conversions": 13, "conversionRate": 2.77},
    {"date": "2024-01-08", "visits": 530, "pageViews": 1400, "conversions": 19, "conversionRate": 3.58},
    {"date": "2024-01-09", "visits": 560, "pageViews": 1500, "conversions": 22, "conversionRate": 3.93},
    {"date": "2024-01-10", "visits": 500, "pageViews": 1350, "conversions": 17, "conversionRate": 3.40},
    {"date": "2024-01-11", "visits": 460, "pageViews": 1220, "conversions": 12, "conversionRate": 2.61},
    {"date": "2024-01-12", "visits": 540, "pageViews": 1420, "conversions": 20, "conversionRate": 3.70},
    {"date": "2024-01-13", "visits": 490, "pageViews": 1300, "conversions": 15, "conversionRate": 3.06},
    {"date": "2024-01-14", "visits": 570, "pageViews": 1520, "conversions": 23, "conversionRate": 4.04},
    {"date": "2024-01-15", "visits": 510, "pageViews": 1380, "conversions": 18, "conversionRate": 3.53},
    {"date": "2024-01-16", "visits": 480, "pageViews": 1280, "conversions": 14, "conversionRate": 2.92},
    {"date": "2024-01-17", "visits": 550, "pageViews": 1450, "conversions": 21, "conversionRate": 3.82},
    {"date": "2024-01-18", "visits": 500, "pageViews": 1350, "conversions": 16, "conversionRate": 3.20},
    {"date": "2024-01-19", "visits": 580, "pageViews": 1550, "conversions": 24, "conversionRate": 4.14},
    {"date": "2024-01-20", "visits": 520, "pageViews": 1400, "conversions": 19, "conversionRate": 3.65},
    {"date": "2024-01-21", "visits": 470, "pageViews": 1250, "conversions": 13, "conversionRate": 2.77},
    {"date": "2024-01-22", "visits": 560, "pageViews": 1500, "conversions": 22, "conversionRate": 3.93},
    {"date": "2024-01-23", "visits": 510, "pageViews": 1380, "conversions": 18, "conversionRate": 3.53},
    {"date": "2024-01-24", "visits": 590, "pageViews": 1580, "conversions": 25, "conversionRate": 4.24},
    {"date": "2024-01-25", "visits": 490, "pageViews": 1320, "conversions": 15, "conversionRate": 3.06},
    {"date": "2024-01-26", "visits": 550, "pageViews": 1450, "conversions": 21, "conversionRate": 3.82},
    {"date": "2024-01-27", "visits": 500, "pageViews": 1350, "conversions": 17, "conversionRate": 3.40},
    {"date": "2024-01-28", "visits": 570, "pageViews": 1520, "conversions": 23, "conversionRate": 4.04},
    {"date": "2024-01-29", "visits": 480, "pageViews": 1280, "conversions": 14, "conversionRate": 2.92},
    {"date": "2024-01-30", "visits": 540, "pageViews": 1420, "conversions": 20, "conversionRate": 3.70}
  ],
  "summary": {
    "totalRevenue": 61234.50,
    "totalOrders": 730,
    "totalVisits": 15300,
    "totalPageViews": 40800,
    "averageOrderValue": 83.88,
    "conversionRate": 3.40
  }
}
```

### Weekly Period Sample (12 weeks)

```json
{
  "sales": [
    {"date": "2024-01-01", "revenue": 14250.75, "orders": 170, "averageOrderValue": 83.83},
    {"date": "2024-01-08", "revenue": 15680.50, "orders": 185, "averageOrderValue": 84.76},
    {"date": "2024-01-15", "revenue": 16890.25, "orders": 200, "averageOrderValue": 84.45},
    {"date": "2024-01-22", "revenue": 17560.00, "orders": 208, "averageOrderValue": 84.42},
    {"date": "2024-01-29", "revenue": 18240.75, "orders": 215, "averageOrderValue": 84.84},
    {"date": "2024-02-05", "revenue": 19500.50, "orders": 230, "averageOrderValue": 84.78},
    {"date": "2024-02-12", "revenue": 20120.25, "orders": 238, "averageOrderValue": 84.54},
    {"date": "2024-02-19", "revenue": 18980.00, "orders": 224, "averageOrderValue": 84.73},
    {"date": "2024-02-26", "revenue": 21340.75, "orders": 252, "averageOrderValue": 84.69},
    {"date": "2024-03-05", "revenue": 22560.50, "orders": 266, "averageOrderValue": 84.81},
    {"date": "2024-03-12", "revenue": 21890.25, "orders": 258, "averageOrderValue": 84.85},
    {"date": "2024-03-19", "revenue": 23120.00, "orders": 273, "averageOrderValue": 84.69}
  ],
  "marketing": [
    {"date": "2024-01-01", "visits": 3150, "pageViews": 8400, "conversions": 105, "conversionRate": 3.33},
    {"date": "2024-01-08", "visits": 3420, "pageViews": 9100, "conversions": 119, "conversionRate": 3.48},
    {"date": "2024-01-15", "visits": 3680, "pageViews": 9800, "conversions": 128, "conversionRate": 3.48},
    {"date": "2024-01-22", "visits": 3850, "pageViews": 10250, "conversions": 135, "conversionRate": 3.51},
    {"date": "2024-01-29", "visits": 4020, "pageViews": 10700, "conversions": 142, "conversionRate": 3.53},
    {"date": "2024-02-05", "visits": 4200, "pageViews": 11200, "conversions": 150, "conversionRate": 3.57},
    {"date": "2024-02-12", "visits": 4350, "pageViews": 11600, "conversions": 156, "conversionRate": 3.59},
    {"date": "2024-02-19", "visits": 4100, "pageViews": 10950, "conversions": 147, "conversionRate": 3.59},
    {"date": "2024-02-26", "visits": 4550, "pageViews": 12150, "conversions": 163, "conversionRate": 3.58},
    {"date": "2024-03-05", "visits": 4780, "pageViews": 12750, "conversions": 172, "conversionRate": 3.60},
    {"date": "2024-03-12", "visits": 4650, "pageViews": 12400, "conversions": 167, "conversionRate": 3.59},
    {"date": "2024-03-19", "visits": 4920, "pageViews": 13150, "conversions": 177, "conversionRate": 3.60}
  ],
  "summary": {
    "totalRevenue": 225043.50,
    "totalOrders": 2654,
    "totalVisits": 48670,
    "totalPageViews": 129850,
    "averageOrderValue": 84.75,
    "conversionRate": 3.55
  }
}
```

### Monthly Period Sample (12 months)

```json
{
  "sales": [
    {"date": "2024-01-01", "revenue": 61234.50, "orders": 730, "averageOrderValue": 83.88},
    {"date": "2024-02-01", "revenue": 78920.25, "orders": 940, "averageOrderValue": 84.00},
    {"date": "2024-03-01", "revenue": 87560.75, "orders": 1035, "averageOrderValue": 84.55},
    {"date": "2024-04-01", "revenue": 92340.00, "orders": 1095, "averageOrderValue": 84.33},
    {"date": "2024-05-01", "revenue": 101250.50, "orders": 1200, "averageOrderValue": 84.38},
    {"date": "2024-06-01", "revenue": 112340.25, "orders": 1330, "averageOrderValue": 84.47},
    {"date": "2024-07-01", "revenue": 125680.75, "orders": 1485, "averageOrderValue": 84.63},
    {"date": "2024-08-01", "revenue": 118920.50, "orders": 1405, "averageOrderValue": 84.64},
    {"date": "2024-09-01", "revenue": 134560.00, "orders": 1590, "averageOrderValue": 84.63},
    {"date": "2024-10-01", "revenue": 145230.75, "orders": 1715, "averageOrderValue": 84.68},
    {"date": "2024-11-01", "revenue": 156890.50, "orders": 1855, "averageOrderValue": 84.58},
    {"date": "2024-12-01", "revenue": 178450.25, "orders": 2110, "averageOrderValue": 84.57}
  ],
  "marketing": [
    {"date": "2024-01-01", "visits": 15300, "pageViews": 40800, "conversions": 520, "conversionRate": 3.40},
    {"date": "2024-02-01", "visits": 19720, "pageViews": 52600, "conversions": 671, "conversionRate": 3.40},
    {"date": "2024-03-01", "visits": 21850, "pageViews": 58300, "conversions": 744, "conversionRate": 3.40},
    {"date": "2024-04-01", "visits": 23040, "pageViews": 61450, "conversions": 784, "conversionRate": 3.40},
    {"date": "2024-05-01", "visits": 25230, "pageViews": 67300, "conversions": 858, "conversionRate": 3.40},
    {"date": "2024-06-01", "visits": 27980, "pageViews": 74650, "conversions": 952, "conversionRate": 3.40},
    {"date": "2024-07-01", "visits": 31250, "pageViews": 83350, "conversions": 1063, "conversionRate": 3.40},
    {"date": "2024-08-01", "visits": 29560, "pageViews": 78900, "conversions": 1006, "conversionRate": 3.40},
    {"date": "2024-09-01", "visits": 33480, "pageViews": 89250, "conversions": 1138, "conversionRate": 3.40},
    {"date": "2024-10-01", "visits": 36120, "pageViews": 96350, "conversions": 1228, "conversionRate": 3.40},
    {"date": "2024-11-01", "visits": 38950, "pageViews": 103850, "conversions": 1325, "conversionRate": 3.40},
    {"date": "2024-12-01", "visits": 44280, "pageViews": 118050, "conversions": 1506, "conversionRate": 3.40}
  ],
  "summary": {
    "totalRevenue": 1321387.25,
    "totalOrders": 15655,
    "totalVisits": 332760,
    "totalPageViews": 887800,
    "averageOrderValue": 84.50,
    "conversionRate": 3.40
  }
}
```

## Data Field Specifications

### Sales Data Point
- `date` (string, required): ISO 8601 date format (YYYY-MM-DD)
- `revenue` (number, required): Total revenue in USD, 2 decimal places
- `orders` (integer, required): Total number of orders
- `averageOrderValue` (number, required): Calculated as revenue / orders, 2 decimal places

### Marketing Data Point
- `date` (string, required): ISO 8601 date format (YYYY-MM-DD)
- `visits` (integer, required): Unique visitor count
- `pageViews` (integer, required): Total page views
- `conversions` (integer, required): Total conversions (purchases, signups, etc.)
- `conversionRate` (number, required): Calculated as (conversions / visits) * 100, 2 decimal places

### Summary Object
- `totalRevenue` (number): Sum of all revenue across the period
- `totalOrders` (integer): Sum of all orders
- `totalVisits` (integer): Sum of all visits
- `totalPageViews` (integer): Sum of all page views
- `averageOrderValue` (number): Overall average (totalRevenue / totalOrders)
- `conversionRate` (number): Overall conversion rate percentage

## Default Date Ranges

- **Daily**: Last 30 days (if no start_date provided)
- **Weekly**: Last 12 weeks (if no start_date provided)
- **Monthly**: Last 12 months (if no start_date provided)

## Aggregation Rules

### Daily
- Group all transactions/events by calendar day
- Date represents the day (YYYY-MM-DD)

### Weekly
- Group by week (Monday to Sunday)
- Date represents the first day of the week (Monday)
- Use ISO week numbering

### Monthly
- Group by calendar month
- Date represents the first day of the month (YYYY-MM-01)

## Backend Implementation Checklist

- [ ] Create database tables for sales and marketing analytics
- [ ] Implement daily aggregation query
- [ ] Implement weekly aggregation query
- [ ] Implement monthly aggregation query
- [ ] Calculate average order value
- [ ] Calculate conversion rates
- [ ] Generate summary statistics
- [ ] Add caching layer (recommended for performance)
- [ ] Add authentication/authorization
- [ ] Add error handling
- [ ] Test with sample data provided

## Database Schema Suggestions

See [ANALYTICS_API_SPEC.md](./ANALYTICS_API_SPEC.md) for detailed database schema suggestions.

## Testing

Use the sample data provided above to:
1. Test frontend chart rendering
2. Verify data formatting
3. Test time period switching
4. Validate calculations

## Next Steps

1. Install recharts: `npm install recharts`
2. Implement backend API endpoint
3. Test with sample data
4. Deploy and monitor
