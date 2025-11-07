# Subscription Module - Installation Instructions

## ✅ What Has Been Done

A complete subscription management system has been added to your admin panel with the following components:

#### 📦 Files Created/Modified.

1. **Database Schema** (`lib/schema.ts`) - ✅ Updated
2. **SQL Migration** (`subscriptions-schema.sql`) - ✅ Created
3. **API Routes** - ✅ Created
   - `/api/subscriptions/route.ts`
   - `/api/subscriptions/[id]/route.ts`
4. **Frontend Pages** - ✅ Created
   - `/app/subscriptions/page.tsx`
   - `/app/subscriptions/add/page.tsx`
   - `/app/subscriptions/edit/[id]/page.tsx`
5. **Navigation Menu** (`app/components/ClientLayout.tsx`) - ✅ Updated
6. **Documentation** - ✅ Created
   - `SUBSCRIPTION_MODULE_GUIDE.md`
   - `SUBSCRIPTION_SUMMARY.md`
   - `INSTALLATION_INSTRUCTIONS.md` (this file)

---

## 🚀 Quick Installation (3 Steps)

### Step 1: Run the SQL Query

Open your MySQL database client and execute the following SQL:

```sql
-- COPY THIS ENTIRE SQL BLOCK AND RUN IT IN YOUR DATABASE

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'USD',
  `billing_cycle` VARCHAR(20) NOT NULL DEFAULT 'monthly',
  `billing_interval_count` INT DEFAULT 1,
  `duration_days` INT,
  `expires_after_days` INT,
  `trial_days` INT DEFAULT 0,
  `features` JSON,
  `max_users` INT,
  `max_orders` INT,
  `max_products` INT,
  `discount_percentage` DECIMAL(5, 2) DEFAULT 0.00,
  `compare_price` DECIMAL(10, 2),
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_popular` BOOLEAN DEFAULT FALSE,
  `sort_order` INT DEFAULT 0,
  `color` VARCHAR(7),
  `icon` VARCHAR(100),
  `badge` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_subscriptions_slug` (`slug`),
  INDEX `idx_subscriptions_is_active` (`is_active`),
  INDEX `idx_subscriptions_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL,
  `subscription_id` VARCHAR(255) NOT NULL,
  `order_id` VARCHAR(255),
  `subscription_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'USD',
  `status` VARCHAR(20) DEFAULT 'active',
  `start_date` DATETIME NOT NULL,
  `expiry_date` DATETIME,
  `cancelled_at` DATETIME,
  `next_billing_date` DATETIME,
  `last_billing_date` DATETIME,
  `billing_cycle` VARCHAR(20),
  `is_trial_used` BOOLEAN DEFAULT FALSE,
  `trial_ends_at` DATETIME,
  `auto_renew` BOOLEAN DEFAULT TRUE,
  `cancel_reason` TEXT,
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_subscriptions_user_id` (`user_id`),
  INDEX `idx_user_subscriptions_subscription_id` (`subscription_id`),
  INDEX `idx_user_subscriptions_order_id` (`order_id`),
  INDEX `idx_user_subscriptions_status` (`status`),
  INDEX `idx_user_subscriptions_expiry_date` (`expiry_date`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Alternative:** You can also run the complete SQL file:
```bash
mysql -u your_username -p your_database_name < subscriptions-schema.sql
```

### Step 2: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 3: Access the Subscription Module

Navigate to: **http://localhost:3000/subscriptions**

You should now see:
- 📊 A dashboard showing subscription statistics
- 📝 An empty table (or sample subscriptions if you ran the full SQL file)
- ➕ An "Add Subscription" button

---

## 🎯 Test the Installation

### Test 1: Access the Page
1. Go to `http://localhost:3000/subscriptions`
2. You should see the subscription management page

### Test 2: Create a Subscription
1. Click "Add Subscription"
2. Fill in the form:
   - **Name**: "Test Plan"
   - **Price**: "19.99"
   - **Billing Cycle**: "Monthly"
   - Click "Create Subscription"
3. You should be redirected back to the list

### Test 3: Edit a Subscription
1. Click the three-dot menu on any subscription
2. Select "Edit"
3. Make changes and save
4. Changes should be reflected in the list

### Test 4: Delete a Subscription
1. Click the three-dot menu
2. Select "Delete"
3. Confirm deletion
4. Subscription should be removed

---

## 📁 Where Everything Is Located

```
admin/
├── lib/
│   └── schema.ts                              # Database schema (MODIFIED)
│
├── app/
│   ├── components/
│   │   └── ClientLayout.tsx                   # Navigation menu (MODIFIED)
│   │
│   ├── api/
│   │   └── subscriptions/
│   │       ├── route.ts                       # List & Create API (NEW)
│   │       └── [id]/
│   │           └── route.ts                   # Get, Update, Delete API (NEW)
│   │
│   └── subscriptions/
│       ├── page.tsx                           # List page (NEW)
│       ├── add/
│       │   └── page.tsx                       # Add page (NEW)
│       └── edit/
│           └── [id]/
│               └── page.tsx                   # Edit page (NEW)
│
├── subscriptions-schema.sql                   # SQL migration (NEW)
├── SUBSCRIPTION_MODULE_GUIDE.md               # Full documentation (NEW)
├── SUBSCRIPTION_SUMMARY.md                    # Quick reference (NEW)
└── INSTALLATION_INSTRUCTIONS.md               # This file (NEW)
```

---

## 🔍 Troubleshooting

### Issue: "Table doesn't exist" Error

**Solution:**
- Make sure you ran the SQL query in Step 1
- Check your database name is correct
- Verify the connection in `lib/db.ts`

### Issue: Page Not Found (404)

**Solution:**
- Restart your development server
- Clear your browser cache
- Check the URL is correct: `/subscriptions`

### Issue: Navigation Menu Doesn't Show "Subscriptions"

**Solution:**
- Make sure you're logged in as an admin
- Restart the development server
- Check `app/components/ClientLayout.tsx` was updated correctly

### Issue: API Errors (500)

**Solution:**
- Check browser console for specific errors
- Check terminal/server logs
- Verify database connection is working
- Make sure all tables were created successfully

### Issue: Foreign Key Constraint Error

**Solution:**
The foreign keys reference `user` and `orders` tables. If you don't have these tables, either:
1. Remove the foreign key constraints from the SQL
2. Create the referenced tables first

To remove foreign keys, run:
```sql
ALTER TABLE user_subscriptions DROP FOREIGN KEY user_subscriptions_ibfk_1;
ALTER TABLE user_subscriptions DROP FOREIGN KEY user_subscriptions_ibfk_2;
ALTER TABLE user_subscriptions DROP FOREIGN KEY user_subscriptions_ibfk_3;
```

---

## 🎨 Customization

### Change the Navigation Icon

Edit `app/components/ClientLayout.tsx`:

```typescript
// Find this line:
{ name: 'Subscriptions', href: '/subscriptions', icon: CreditCardIcon, category: 'main' },

// Change CreditCardIcon to another icon, like:
{ name: 'Subscriptions', href: '/subscriptions', icon: StarIcon, category: 'main' },
```

### Change Colors

Edit the subscription list page (`app/subscriptions/page.tsx`):
```typescript
// Find the stats cards and change the text color classes:
<div className="text-2xl font-bold text-green-600"> // Change text-green-600
<div className="text-2xl font-bold text-blue-600">  // Change text-blue-600
```

### Add More Fields

1. Add column to SQL:
```sql
ALTER TABLE subscriptions ADD COLUMN new_field VARCHAR(255);
```

2. Update schema (`lib/schema.ts`):
```typescript
newField: varchar("new_field", { length: 255 }),
```

3. Update forms and API routes to handle the new field

---

## 📊 Sample Data (Optional)

If you want to start with sample subscriptions, run this SQL after creating the tables:

```sql
INSERT INTO `subscriptions` 
  (`id`, `name`, `slug`, `description`, `price`, `billing_cycle`, `trial_days`, 
   `features`, `is_active`, `is_popular`, `sort_order`, `color`)
VALUES
  (UUID(), 'Basic Plan', 'basic-plan', 'Perfect for getting started', 9.99, 'monthly', 7,
   '["Email support", "5 GB storage", "Basic features"]', TRUE, FALSE, 1, '#3B82F6'),
  
  (UUID(), 'Pro Plan', 'pro-plan', 'For growing businesses', 29.99, 'monthly', 14,
   '["Priority support", "50 GB storage", "Advanced features", "API access"]', TRUE, TRUE, 2, '#8B5CF6'),
  
  (UUID(), 'Enterprise', 'enterprise', 'For large organizations', 99.99, 'monthly', 30,
   '["24/7 support", "Unlimited storage", "All features", "Dedicated manager"]', TRUE, FALSE, 3, '#EF4444');
```

---

## ✅ Verification Checklist

Use this checklist to verify everything is working:

- [ ] SQL tables created successfully
- [ ] Development server restarted
- [ ] `/subscriptions` page loads without errors
- [ ] Can see the "Subscriptions" link in the sidebar menu
- [ ] Can click "Add Subscription" button
- [ ] Can fill out and submit the add form
- [ ] Can see the new subscription in the list
- [ ] Can click edit and update a subscription
- [ ] Can delete a subscription
- [ ] Stats cards show correct numbers

---

## 🚀 You're All Set!

Your subscription module is now fully functional. You can:

✅ Create unlimited subscription plans
✅ Set different prices and billing cycles
✅ Add features and usage limits
✅ Mark plans as featured or popular
✅ Track user subscriptions (via user_subscriptions table)

For more details, see:
- `SUBSCRIPTION_MODULE_GUIDE.md` - Complete documentation
- `SUBSCRIPTION_SUMMARY.md` - Quick reference guide

---

## 📞 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the browser console for errors
3. Check server logs in your terminal
4. Verify database connection and tables
5. Ensure all dependencies are installed: `npm install`

---

**Installation Date**: November 2025  
**Module Version**: 1.0.0  
**Status**: ✅ Ready to Use

