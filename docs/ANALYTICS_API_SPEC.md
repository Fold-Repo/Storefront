# Analytics API Specification

This document provides the API specification for the Dashboard Analytics feature, including sample request/response structures for sales and marketing data.

## Overview

The Analytics API provides time-series data for sales and marketing metrics, supporting daily, weekly, and monthly aggregations.

## Base Endpoint

```
GET /api/v1/analytics/business/:business_id/trends
```

## Request Parameters

### Path Parameters
- `business_id` (required): The business ID (integer or string)

### Query Parameters
- `period` (required): Time period aggregation
  - Values: `daily`, `weekly`, `monthly`
  - Default: `daily`
- `start_date` (optional): Start date in ISO 8601 format (YYYY-MM-DD)
  - If not provided, defaults to 30 days ago for daily, 12 weeks ago for weekly, 12 months ago for monthly
- `end_date` (optional): End date in ISO 8601 format (YYYY-MM-DD)
  - If not provided, defaults to today

### Example Requests

```bash
# Daily trends (last 30 days)
GET /api/v1/analytics/business/123/trends?period=daily

# Weekly trends (last 12 weeks)
GET /api/v1/analytics/business/123/trends?period=weekly

# Monthly trends (last 12 months)
GET /api/v1/analytics/business/123/trends?period=monthly

# Custom date range
GET /api/v1/analytics/business/123/trends?period=daily&start_date=2024-01-01&end_date=2024-01-31
```

## Response Structure

### Success Response (200 OK)

```json
{
  "sales": [
    {
      "date": "2024-01-01",
      "revenue": 1250.50,
      "orders": 15,
      "averageOrderValue": 83.37
    },
    {
      "date": "2024-01-02",
      "revenue": 1890.75,
      "orders": 22,
      "averageOrderValue": 85.94
    }
  ],
  "marketing": [
    {
      "date": "2024-01-01",
      "visits": 450,
      "pageViews": 1200,
      "conversions": 12,
      "conversionRate": 2.67
    },
    {
      "date": "2024-01-02",
      "visits": 520,
      "pageViews": 1350,
      "conversions": 18,
      "conversionRate": 3.46
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

## Data Point Structures

### Sales Data Point

```typescript
interface SalesDataPoint {
  date: string;              // ISO 8601 date (YYYY-MM-DD)
  revenue: number;           // Total revenue in USD (2 decimal places)
  orders: number;            // Total number of orders (integer)
  averageOrderValue: number; // Average order value in USD (2 decimal places)
}
```

### Marketing Data Point

```typescript
interface MarketingDataPoint {
  date: string;              // ISO 8601 date (YYYY-MM-DD)
  visits: number;            // Total unique visits (integer)
  pageViews: number;         // Total page views (integer)
  conversions: number;       // Total conversions (integer)
  conversionRate: number;     // Conversion rate as percentage (2 decimal places)
}
```

### Summary Object

```typescript
interface Summary {
  totalRevenue: number;      // Total revenue across all periods
  totalOrders: number;        // Total orders across all periods
  totalVisits: number;       // Total visits across all periods
  totalPageViews: number;    // Total page views across all periods
  averageOrderValue: number; // Overall average order value
  conversionRate: number;    // Overall conversion rate percentage
}
```

## Sample Data for Testing

### Daily Period (30 days)

```json
{
  "sales": [
    {
      "date": "2024-01-01",
      "revenue": 1250.50,
      "orders": 15,
      "averageOrderValue": 83.37
    },
    {
      "date": "2024-01-02",
      "revenue": 1890.75,
      "orders": 22,
      "averageOrderValue": 85.94
    },
    {
      "date": "2024-01-03",
      "revenue": 2100.00,
      "orders": 25,
      "averageOrderValue": 84.00
    },
    {
      "date": "2024-01-04",
      "revenue": 1650.25,
      "orders": 19,
      "averageOrderValue": 86.86
    },
    {
      "date": "2024-01-05",
      "revenue": 2300.50,
      "orders": 28,
      "averageOrderValue": 82.16
    },
    {
      "date": "2024-01-06",
      "revenue": 1950.00,
      "orders": 23,
      "averageOrderValue": 84.78
    },
    {
      "date": "2024-01-07",
      "revenue": 1780.75,
      "orders": 21,
      "averageOrderValue": 84.80
    },
    {
      "date": "2024-01-08",
      "revenue": 2200.00,
      "orders": 26,
      "averageOrderValue": 84.62
    },
    {
      "date": "2024-01-09",
      "revenue": 2450.25,
      "orders": 29,
      "averageOrderValue": 84.49
    },
    {
      "date": "2024-01-10",
      "revenue": 1980.50,
      "orders": 24,
      "averageOrderValue": 82.52
    },
    {
      "date": "2024-01-11",
      "revenue": 1675.00,
      "orders": 20,
      "averageOrderValue": 83.75
    },
    {
      "date": "2024-01-12",
      "revenue": 2125.75,
      "orders": 25,
      "averageOrderValue": 85.03
    },
    {
      "date": "2024-01-13",
      "revenue": 1890.00,
      "orders": 22,
      "averageOrderValue": 85.91
    },
    {
      "date": "2024-01-14",
      "revenue": 2250.50,
      "orders": 27,
      "averageOrderValue": 83.35
    },
    {
      "date": "2024-01-15",
      "revenue": 1980.25,
      "orders": 24,
      "averageOrderValue": 82.51
    },
    {
      "date": "2024-01-16",
      "revenue": 1750.00,
      "orders": 21,
      "averageOrderValue": 83.33
    },
    {
      "date": "2024-01-17",
      "revenue": 2100.75,
      "orders": 25,
      "averageOrderValue": 84.03
    },
    {
      "date": "2024-01-18",
      "revenue": 1925.50,
      "orders": 23,
      "averageOrderValue": 83.72
    },
    {
      "date": "2024-01-19",
      "revenue": 2350.00,
      "orders": 28,
      "averageOrderValue": 83.93
    },
    {
      "date": "2024-01-20",
      "revenue": 2050.25,
      "orders": 25,
      "averageOrderValue": 82.01
    },
    {
      "date": "2024-01-21",
      "revenue": 1800.00,
      "orders": 22,
      "averageOrderValue": 81.82
    },
    {
      "date": "2024-01-22",
      "revenue": 2200.75,
      "orders": 26,
      "averageOrderValue": 84.64
    },
    {
      "date": "2024-01-23",
      "revenue": 1950.50,
      "orders": 24,
      "averageOrderValue": 81.27
    },
    {
      "date": "2024-01-24",
      "revenue": 2400.00,
      "orders": 29,
      "averageOrderValue": 82.76
    },
    {
      "date": "2024-01-25",
      "revenue": 1875.25,
      "orders": 23,
      "averageOrderValue": 81.53
    },
    {
      "date": "2024-01-26",
      "revenue": 2150.00,
      "orders": 26,
      "averageOrderValue": 82.69
    },
    {
      "date": "2024-01-27",
      "revenue": 1980.75,
      "orders": 24,
      "averageOrderValue": 82.53
    },
    {
      "date": "2024-01-28",
      "revenue": 2250.50,
      "orders": 27,
      "averageOrderValue": 83.35
    },
    {
      "date": "2024-01-29",
      "revenue": 1900.00,
      "orders": 23,
      "averageOrderValue": 82.61
    },
    {
      "date": "2024-01-30",
      "revenue": 2100.25,
      "orders": 25,
      "averageOrderValue": 84.01
    }
  ],
  "marketing": [
    {
      "date": "2024-01-01",
      "visits": 450,
      "pageViews": 1200,
      "conversions": 12,
      "conversionRate": 2.67
    },
    {
      "date": "2024-01-02",
      "visits": 520,
      "pageViews": 1350,
      "conversions": 18,
      "conversionRate": 3.46
    },
    {
      "date": "2024-01-03",
      "visits": 480,
      "pageViews": 1280,
      "conversions": 15,
      "conversionRate": 3.13
    },
    {
      "date": "2024-01-04",
      "visits": 510,
      "pageViews": 1320,
      "conversions": 14,
      "conversionRate": 2.75
    },
    {
      "date": "2024-01-05",
      "visits": 550,
      "pageViews": 1450,
      "conversions": 20,
      "conversionRate": 3.64
    },
    {
      "date": "2024-01-06",
      "visits": 490,
      "pageViews": 1300,
      "conversions": 16,
      "conversionRate": 3.27
    },
    {
      "date": "2024-01-07",
      "visits": 470,
      "pageViews": 1250,
      "conversions": 13,
      "conversionRate": 2.77
    },
    {
      "date": "2024-01-08",
      "visits": 530,
      "pageViews": 1400,
      "conversions": 19,
      "conversionRate": 3.58
    },
    {
      "date": "2024-01-09",
      "visits": 560,
      "pageViews": 1500,
      "conversions": 22,
      "conversionRate": 3.93
    },
    {
      "date": "2024-01-10",
      "visits": 500,
      "pageViews": 1350,
      "conversions": 17,
      "conversionRate": 3.40
    },
    {
      "date": "2024-01-11",
      "visits": 460,
      "pageViews": 1220,
      "conversions": 12,
      "conversionRate": 2.61
    },
    {
      "date": "2024-01-12",
      "visits": 540,
      "pageViews": 1420,
      "conversions": 20,
      "conversionRate": 3.70
    },
    {
      "date": "2024-01-13",
      "visits": 490,
      "pageViews": 1300,
      "conversions": 15,
      "conversionRate": 3.06
    },
    {
      "date": "2024-01-14",
      "visits": 570,
      "pageViews": 1520,
      "conversions": 23,
      "conversionRate": 4.04
    },
    {
      "date": "2024-01-15",
      "visits": 510,
      "pageViews": 1380,
      "conversions": 18,
      "conversionRate": 3.53
    },
    {
      "date": "2024-01-16",
      "visits": 480,
      "pageViews": 1280,
      "conversions": 14,
      "conversionRate": 2.92
    },
    {
      "date": "2024-01-17",
      "visits": 550,
      "pageViews": 1450,
      "conversions": 21,
      "conversionRate": 3.82
    },
    {
      "date": "2024-01-18",
      "visits": 500,
      "pageViews": 1350,
      "conversions": 16,
      "conversionRate": 3.20
    },
    {
      "date": "2024-01-19",
      "visits": 580,
      "pageViews": 1550,
      "conversions": 24,
      "conversionRate": 4.14
    },
    {
      "date": "2024-01-20",
      "visits": 520,
      "pageViews": 1400,
      "conversions": 19,
      "conversionRate": 3.65
    },
    {
      "date": "2024-01-21",
      "visits": 470,
      "pageViews": 1250,
      "conversions": 13,
      "conversionRate": 2.77
    },
    {
      "date": "2024-01-22",
      "visits": 560,
      "pageViews": 1500,
      "conversions": 22,
      "conversionRate": 3.93
    },
    {
      "date": "2024-01-23",
      "visits": 510,
      "pageViews": 1380,
      "conversions": 18,
      "conversionRate": 3.53
    },
    {
      "date": "2024-01-24",
      "visits": 590,
      "pageViews": 1580,
      "conversions": 25,
      "conversionRate": 4.24
    },
    {
      "date": "2024-01-25",
      "visits": 490,
      "pageViews": 1320,
      "conversions": 15,
      "conversionRate": 3.06
    },
    {
      "date": "2024-01-26",
      "visits": 550,
      "pageViews": 1450,
      "conversions": 21,
      "conversionRate": 3.82
    },
    {
      "date": "2024-01-27",
      "visits": 500,
      "pageViews": 1350,
      "conversions": 17,
      "conversionRate": 3.40
    },
    {
      "date": "2024-01-28",
      "visits": 570,
      "pageViews": 1520,
      "conversions": 23,
      "conversionRate": 4.04
    },
    {
      "date": "2024-01-29",
      "visits": 480,
      "pageViews": 1280,
      "conversions": 14,
      "conversionRate": 2.92
    },
    {
      "date": "2024-01-30",
      "visits": 540,
      "pageViews": 1420,
      "conversions": 20,
      "conversionRate": 3.70
    }
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

### Weekly Period (12 weeks)

```json
{
  "sales": [
    {
      "date": "2024-01-01",
      "revenue": 14250.75,
      "orders": 170,
      "averageOrderValue": 83.83
    },
    {
      "date": "2024-01-08",
      "revenue": 15680.50,
      "orders": 185,
      "averageOrderValue": 84.76
    },
    {
      "date": "2024-01-15",
      "revenue": 16890.25,
      "orders": 200,
      "averageOrderValue": 84.45
    },
    {
      "date": "2024-01-22",
      "revenue": 17560.00,
      "orders": 208,
      "averageOrderValue": 84.42
    },
    {
      "date": "2024-01-29",
      "revenue": 18240.75,
      "orders": 215,
      "averageOrderValue": 84.84
    },
    {
      "date": "2024-02-05",
      "revenue": 19500.50,
      "orders": 230,
      "averageOrderValue": 84.78
    },
    {
      "date": "2024-02-12",
      "revenue": 20120.25,
      "orders": 238,
      "averageOrderValue": 84.54
    },
    {
      "date": "2024-02-19",
      "revenue": 18980.00,
      "orders": 224,
      "averageOrderValue": 84.73
    },
    {
      "date": "2024-02-26",
      "revenue": 21340.75,
      "orders": 252,
      "averageOrderValue": 84.69
    },
    {
      "date": "2024-03-05",
      "revenue": 22560.50,
      "orders": 266,
      "averageOrderValue": 84.81
    },
    {
      "date": "2024-03-12",
      "revenue": 21890.25,
      "orders": 258,
      "averageOrderValue": 84.85
    },
    {
      "date": "2024-03-19",
      "revenue": 23120.00,
      "orders": 273,
      "averageOrderValue": 84.69
    }
  ],
  "marketing": [
    {
      "date": "2024-01-01",
      "visits": 3150,
      "pageViews": 8400,
      "conversions": 105,
      "conversionRate": 3.33
    },
    {
      "date": "2024-01-08",
      "visits": 3420,
      "pageViews": 9100,
      "conversions": 119,
      "conversionRate": 3.48
    },
    {
      "date": "2024-01-15",
      "visits": 3680,
      "pageViews": 9800,
      "conversions": 128,
      "conversionRate": 3.48
    },
    {
      "date": "2024-01-22",
      "visits": 3850,
      "pageViews": 10250,
      "conversions": 135,
      "conversionRate": 3.51
    },
    {
      "date": "2024-01-29",
      "visits": 4020,
      "pageViews": 10700,
      "conversions": 142,
      "conversionRate": 3.53
    },
    {
      "date": "2024-02-05",
      "visits": 4200,
      "pageViews": 11200,
      "conversions": 150,
      "conversionRate": 3.57
    },
    {
      "date": "2024-02-12",
      "visits": 4350,
      "pageViews": 11600,
      "conversions": 156,
      "conversionRate": 3.59
    },
    {
      "date": "2024-02-19",
      "visits": 4100,
      "pageViews": 10950,
      "conversions": 147,
      "conversionRate": 3.59
    },
    {
      "date": "2024-02-26",
      "visits": 4550,
      "pageViews": 12150,
      "conversions": 163,
      "conversionRate": 3.58
    },
    {
      "date": "2024-03-05",
      "visits": 4780,
      "pageViews": 12750,
      "conversions": 172,
      "conversionRate": 3.60
    },
    {
      "date": "2024-03-12",
      "visits": 4650,
      "pageViews": 12400,
      "conversions": 167,
      "conversionRate": 3.59
    },
    {
      "date": "2024-03-19",
      "visits": 4920,
      "pageViews": 13150,
      "conversions": 177,
      "conversionRate": 3.60
    }
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

### Monthly Period (12 months)

```json
{
  "sales": [
    {
      "date": "2024-01-01",
      "revenue": 61234.50,
      "orders": 730,
      "averageOrderValue": 83.88
    },
    {
      "date": "2024-02-01",
      "revenue": 78920.25,
      "orders": 940,
      "averageOrderValue": 84.00
    },
    {
      "date": "2024-03-01",
      "revenue": 87560.75,
      "orders": 1035,
      "averageOrderValue": 84.55
    },
    {
      "date": "2024-04-01",
      "revenue": 92340.00,
      "orders": 1095,
      "averageOrderValue": 84.33
    },
    {
      "date": "2024-05-01",
      "revenue": 101250.50,
      "orders": 1200,
      "averageOrderValue": 84.38
    },
    {
      "date": "2024-06-01",
      "revenue": 112340.25,
      "orders": 1330,
      "averageOrderValue": 84.47
    },
    {
      "date": "2024-07-01",
      "revenue": 125680.75,
      "orders": 1485,
      "averageOrderValue": 84.63
    },
    {
      "date": "2024-08-01",
      "revenue": 118920.50,
      "orders": 1405,
      "averageOrderValue": 84.64
    },
    {
      "date": "2024-09-01",
      "revenue": 134560.00,
      "orders": 1590,
      "averageOrderValue": 84.63
    },
    {
      "date": "2024-10-01",
      "revenue": 145230.75,
      "orders": 1715,
      "averageOrderValue": 84.68
    },
    {
      "date": "2024-11-01",
      "revenue": 156890.50,
      "orders": 1855,
      "averageOrderValue": 84.58
    },
    {
      "date": "2024-12-01",
      "revenue": 178450.25,
      "orders": 2110,
      "averageOrderValue": 84.57
    }
  ],
  "marketing": [
    {
      "date": "2024-01-01",
      "visits": 15300,
      "pageViews": 40800,
      "conversions": 520,
      "conversionRate": 3.40
    },
    {
      "date": "2024-02-01",
      "visits": 19720,
      "pageViews": 52600,
      "conversions": 671,
      "conversionRate": 3.40
    },
    {
      "date": "2024-03-01",
      "visits": 21850,
      "pageViews": 58300,
      "conversions": 744,
      "conversionRate": 3.40
    },
    {
      "date": "2024-04-01",
      "visits": 23040,
      "pageViews": 61450,
      "conversions": 784,
      "conversionRate": 3.40
    },
    {
      "date": "2024-05-01",
      "visits": 25230,
      "pageViews": 67300,
      "conversions": 858,
      "conversionRate": 3.40
    },
    {
      "date": "2024-06-01",
      "visits": 27980,
      "pageViews": 74650,
      "conversions": 952,
      "conversionRate": 3.40
    },
    {
      "date": "2024-07-01",
      "visits": 31250,
      "pageViews": 83350,
      "conversions": 1063,
      "conversionRate": 3.40
    },
    {
      "date": "2024-08-01",
      "visits": 29560,
      "pageViews": 78900,
      "conversions": 1006,
      "conversionRate": 3.40
    },
    {
      "date": "2024-09-01",
      "visits": 33480,
      "pageViews": 89250,
      "conversions": 1138,
      "conversionRate": 3.40
    },
    {
      "date": "2024-10-01",
      "visits": 36120,
      "pageViews": 96350,
      "conversions": 1228,
      "conversionRate": 3.40
    },
    {
      "date": "2024-11-01",
      "visits": 38950,
      "pageViews": 103850,
      "conversions": 1325,
      "conversionRate": 3.40
    },
    {
      "date": "2024-12-01",
      "visits": 44280,
      "pageViews": 118050,
      "conversions": 1506,
      "conversionRate": 3.40
    }
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

## Data Aggregation Rules

### Daily Period
- Group all sales/visits by day
- Date format: `YYYY-MM-DD`
- Default range: Last 30 days

### Weekly Period
- Group all sales/visits by week (Monday to Sunday)
- Date format: `YYYY-MM-DD` (first day of the week)
- Default range: Last 12 weeks

### Monthly Period
- Group all sales/visits by month
- Date format: `YYYY-MM-01` (first day of the month)
- Default range: Last 12 months

## Calculation Formulas

### Average Order Value
```
averageOrderValue = totalRevenue / totalOrders
```

### Conversion Rate
```
conversionRate = (conversions / visits) * 100
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid period. Must be 'daily', 'weekly', or 'monthly'"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized. Please provide a valid authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have access to this business's analytics"
}
```

### 404 Not Found
```json
{
  "error": "Business not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error. Please try again later"
}
```

## Implementation Notes

1. **Date Format**: Always use ISO 8601 format (YYYY-MM-DD)
2. **Currency**: All revenue values should be in USD with 2 decimal places
3. **Percentages**: Conversion rates should be percentages with 2 decimal places
4. **Timezone**: All dates should be in UTC or the business's timezone (specify in documentation)
5. **Caching**: Consider caching daily/weekly/monthly aggregations for performance
6. **Pagination**: For large datasets, consider pagination (not implemented in this spec)

## Database Schema Suggestions

### Sales Table
```sql
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  order_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_business_date ON sales(business_id, order_date);
```

### Marketing Analytics Table
```sql
CREATE TABLE marketing_analytics (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  visit_date DATE NOT NULL,
  visits INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id, visit_date)
);

CREATE INDEX idx_marketing_business_date ON marketing_analytics(business_id, visit_date);
```

## Testing

Use the sample data provided above to test the frontend implementation. The backend should return data in the exact format specified.

## Next Steps

1. Implement the backend API endpoint
2. Set up database tables for sales and marketing data
3. Create aggregation queries for daily/weekly/monthly periods
4. Test with the provided sample data
5. Deploy and monitor performance
