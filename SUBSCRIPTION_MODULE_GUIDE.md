# Subscription Module - Implementation Guide

## 📋 Overview

A complete subscription management system has been added to your admin panel. This module allows you to create, manage, and track subscription plans with flexible pricing, features, and billing cycles.

## 🗄️ Database Setup

### Step 1: Run the SQL Migration

Execute the SQL queries in `subscriptions-schema.sql` to create the necessary database tables:

```bash
# Connect to your MySQL database and run:
mysql -u your_username -p your_database_name < subscriptions-schema.sql
```

Or manually execute the SQL file in your MySQL client (phpMyAdmin, MySQL Workbench, etc.)

### Step 2: Push Schema Changes (Drizzle ORM)

If you're using Drizzle ORM migrations:

```bash
npm run db:push
# or
npm run db:generate
```

## 📁 Files Created

### 1. Database Schema
- **File**: `lib/schema.ts`
- **Tables Added**:
  - `subscriptions` - Stores subscription plans
  - `user_subscriptions` - Tracks user subscription purchases

### 2. API Routes
- **`app/api/subscriptions/route.ts`** - GET (list), POST (create)
- **`app/api/subscriptions/[id]/route.ts`** - GET (single), PUT (update), DELETE (delete)

### 3. Frontend Pages
- **`app/subscriptions/page.tsx`** - List all subscriptions with stats
- **`app/subscriptions/add/page.tsx`** - Add new subscription
- **`app/subscriptions/edit/[id]/page.tsx`** - Edit existing subscription

### 4. SQL Schema
- **`subscriptions-schema.sql`** - Complete SQL migration with sample data

## 🚀 Features

### Subscription Plan Features
- ✅ Flexible pricing (multiple currencies supported)
- ✅ Multiple billing cycles (daily, weekly, monthly, yearly, custom)
- ✅ Trial periods
- ✅ Expiration dates
- ✅ Feature lists
- ✅ Usage limits (max users, orders, products)
- ✅ Discount percentages
- ✅ Featured and popular badges
- ✅ Custom colors and icons
- ✅ Sort ordering

### Admin Interface
- ✅ Responsive table view
- ✅ Quick stats dashboard
- ✅ Filter and search capabilities
- ✅ Easy-to-use form with validation
- ✅ Feature management (add/remove features)
- ✅ Status management (active/inactive)

## 📊 Database Schema Details

### Subscriptions Table

| Field | Type | Description |
|-------|------|-------------|
| id | VARCHAR(255) | Primary key (UUID) |
| name | VARCHAR(255) | Subscription plan name |
| slug | VARCHAR(255) | SEO-friendly URL slug (unique) |
| description | TEXT | Plan description |
| price | DECIMAL(10,2) | Price amount |
| currency | VARCHAR(3) | Currency code (USD, EUR, etc.) |
| billing_cycle | VARCHAR(20) | Billing frequency (monthly, yearly, etc.) |
| trial_days | INT | Free trial period in days |
| features | JSON | Array of feature strings |
| max_users | INT | Maximum users allowed (null = unlimited) |
| max_orders | INT | Maximum orders allowed (null = unlimited) |
| max_products | INT | Maximum products allowed (null = unlimited) |
| is_active | BOOLEAN | Whether plan is active |
| is_featured | BOOLEAN | Featured plan badge |
| is_popular | BOOLEAN | Popular plan badge |
| sort_order | INT | Display order (lower = first) |

### User Subscriptions Table

| Field | Type | Description |
|-------|------|-------------|
| id | VARCHAR(255) | Primary key (UUID) |
| user_id | VARCHAR(255) | Reference to user table |
| subscription_id | VARCHAR(255) | Reference to subscriptions table |
| order_id | VARCHAR(255) | Reference to orders table (if purchased) |
| status | VARCHAR(20) | active, expired, cancelled, suspended |
| start_date | DATETIME | When subscription started |
| expiry_date | DATETIME | When it expires (null = lifetime) |
| next_billing_date | DATETIME | Next billing date for recurring |
| auto_renew | BOOLEAN | Auto-renewal enabled |

## 🔗 API Endpoints

### List All Subscriptions
```
GET /api/subscriptions
Query Parameters:
  - sortBy: name, price, createdAt, sortOrder
  - sortOrder: asc, desc
  - isActive: true, false
```

### Get Single Subscription
```
GET /api/subscriptions/[id]
```

### Create Subscription
```
POST /api/subscriptions
Body: {
  name: string (required)
  slug: string
  description: string
  price: number (required)
  currency: string
  billingCycle: string
  trialDays: number
  features: string[]
  isActive: boolean
  ...
}
```

### Update Subscription
```
PUT /api/subscriptions/[id]
Body: { fields to update }
```

### Delete Subscription
```
DELETE /api/subscriptions/[id]
```

## 🎨 Usage Examples

### Creating a Basic Plan

1. Navigate to `/subscriptions`
2. Click "Add Subscription"
3. Fill in the form:
   - Name: "Basic Plan"
   - Price: 9.99
   - Billing Cycle: Monthly
   - Trial Days: 7
   - Features: ["Access to all products", "Email support", "5 GB storage"]
4. Click "Create Subscription"

### Editing a Plan

1. Go to `/subscriptions`
2. Click the three-dot menu on any subscription
3. Select "Edit"
4. Modify fields as needed
5. Click "Update Subscription"

## 🔧 Customization

### Adding New Fields

1. **Update Schema** (`lib/schema.ts`):
```typescript
export const subscriptions = mysqlTable("subscriptions", {
  // ... existing fields
  customField: varchar("custom_field", { length: 255 }),
});
```

2. **Update SQL Migration** (`subscriptions-schema.sql`):
```sql
ALTER TABLE subscriptions 
ADD COLUMN custom_field VARCHAR(255);
```

3. **Update API Routes** to handle the new field

4. **Update Frontend Forms** to include the new field

### Customizing UI Colors

Edit the subscription listing page to change the color scheme:
```typescript
// app/subscriptions/page.tsx
<Badge variant="default"> {/* Change variant */}
  Active
</Badge>
```

## 📝 Sample Data

The SQL file includes three sample subscription plans:
- **Basic Plan** - $9.99/month (7-day trial)
- **Pro Plan** - $29.99/month (14-day trial, Popular badge)
- **Enterprise Plan** - $99.99/month (30-day trial, Best Value badge)

You can modify or remove these in the SQL file before running the migration.

## 🔐 Security Considerations

1. **API Routes**: Currently open. Consider adding authentication middleware:
```typescript
// Add to route.ts files
import { getServerSession } from "next-auth";
const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

2. **Input Validation**: Add more robust validation using Zod or similar

3. **Rate Limiting**: Consider adding rate limiting to API routes

## 🐛 Troubleshooting

### Error: Table doesn't exist
- Make sure you ran the SQL migration file
- Check your database connection in `lib/db.ts`

### Error: Duplicate slug
- Each subscription must have a unique slug
- The slug is auto-generated from the name but can be manually edited

### Features not saving
- Make sure features are sent as an array, not a string
- Check browser console for errors

## 📞 Support

For issues or questions:
1. Check the browser console for JavaScript errors
2. Check server logs for API errors
3. Verify database connection and table creation
4. Ensure all dependencies are installed: `npm install`

## 🚀 Next Steps

1. **Add Payment Integration**: Connect with Stripe, PayPal, or other payment processors
2. **User Dashboard**: Create a frontend for users to view and manage their subscriptions
3. **Email Notifications**: Send emails when subscriptions expire or renew
4. **Analytics**: Track subscription metrics and revenue
5. **Subscription History**: Add a history table to track all subscription changes
6. **Coupons/Promo Codes**: Add discount code functionality

## 📄 License

This subscription module is part of your admin panel project.

---

**Created**: November 2025
**Version**: 1.0.0

