-- ============================================
-- SUBSCRIPTION MODULE - DATABASE SCHEMA
-- ============================================
-- This file contains the SQL queries to create the subscription tables
-- Execute these queries in your MySQL database

-- Table: subscriptions
-- Description: Stores subscription plans/tiers with pricing and features
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'PKR',
  
  -- Billing cycle
  `billing_cycle` VARCHAR(20) NOT NULL DEFAULT 'monthly' COMMENT 'daily, weekly, monthly, yearly, custom',
  `billing_interval_count` INT DEFAULT 1 COMMENT 'e.g., 2 months, 3 weeks',
  
  -- Duration
  `duration_days` INT COMMENT 'Total duration in days (null for unlimited)',
  `expires_after_days` INT COMMENT 'Auto-expire after X days from purchase',
  
  -- Trial period
  `trial_days` INT DEFAULT 0 COMMENT 'Free trial period in days',
  
  -- Features and limits
  `features` JSON COMMENT 'Array of feature strings',
  `max_users` INT COMMENT 'Maximum number of users (null for unlimited)',
  `max_orders` INT COMMENT 'Maximum number of orders (null for unlimited)',
  `max_products` INT COMMENT 'Maximum number of products (null for unlimited)',
  
  -- Discount and promotions
  `discount_percentage` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Discount percentage',
  `compare_price` DECIMAL(10, 2) COMMENT 'Original price before discount',
  
  -- Status and visibility
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_popular` BOOLEAN DEFAULT FALSE,
  
  -- Priority and sorting
  `sort_order` INT DEFAULT 0,
  
  -- Additional metadata
  `color` VARCHAR(7) COMMENT 'Hex color code for UI',
  `icon` VARCHAR(100) COMMENT 'Icon name for UI',
  `badge` VARCHAR(50) COMMENT 'Badge text (e.g., "Best Value", "Popular")',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_subscriptions_slug` (`slug`),
  INDEX `idx_subscriptions_is_active` (`is_active`),
  INDEX `idx_subscriptions_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_subscriptions
-- Description: Tracks user subscription purchases and their status
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL,
  `subscription_id` VARCHAR(255) NOT NULL,
  `order_id` VARCHAR(255) COMMENT 'Reference to order if purchased',
  
  -- Subscription details (snapshot at time of purchase)
  `subscription_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'PKR',
  
  -- Status
  `status` VARCHAR(20) DEFAULT 'active' COMMENT 'active, expired, cancelled, suspended',
  
  -- Dates
  `start_date` DATETIME NOT NULL,
  `expiry_date` DATETIME COMMENT 'When subscription expires (null for lifetime)',
  `cancelled_at` DATETIME,
  
  -- Billing
  `next_billing_date` DATETIME COMMENT 'For recurring subscriptions',
  `last_billing_date` DATETIME,
  `billing_cycle` VARCHAR(20) COMMENT 'monthly, yearly, etc.',
  
  -- Trial
  `is_trial_used` BOOLEAN DEFAULT FALSE,
  `trial_ends_at` DATETIME,
  
  -- Auto-renewal
  `auto_renew` BOOLEAN DEFAULT TRUE,
  
  -- Additional info
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

-- ============================================
-- SAMPLE DATA (Optional - Remove if not needed)
-- ============================================

-- Sample subscription plans
INSERT INTO `subscriptions` 
  (`id`, `name`, `slug`, `description`, `price`, `currency`, `billing_cycle`, `trial_days`, 
   `features`, `is_active`, `is_featured`, `is_popular`, `sort_order`, `color`, `badge`)
VALUES
  (
    UUID(),
    'Basic Plan',
    'basic-plan',
    'Perfect for individuals and small businesses',
    999,
    'PKR',
    'monthly',
    7,
    '["Access to all products", "Email support", "5 GB storage", "Basic analytics"]',
    TRUE,
    FALSE,
    FALSE,
    1,
    '#3B82F6',
    NULL
  ),
  (
    UUID(),
    'Pro Plan',
    'pro-plan',
    'Ideal for growing businesses',
    2999,
    'PKR',
    'monthly',
    14,
    '["Access to all products", "Priority email & chat support", "50 GB storage", "Advanced analytics", "Custom branding", "API access"]',
    TRUE,
    TRUE,
    TRUE,
    2,
    '#8B5CF6',
    'Popular'
  ),
  (
    UUID(),
    'Enterprise Plan',
    'enterprise-plan',
    'For large organizations with advanced needs',
    9999,
    'PKR',
    'monthly',
    30,
    '["Access to all products", "24/7 phone, email & chat support", "Unlimited storage", "Advanced analytics & reporting", "Custom branding", "API access", "Dedicated account manager", "Custom integrations"]',
    TRUE,
    FALSE,
    FALSE,
    3,
    '#EF4444',
    'Best Value'
  );

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure to replace UUID() with actual UUID generation if your MySQL version doesn't support it
-- 2. Adjust foreign key constraints based on your existing database schema
-- 3. The sample data is optional and can be removed or modified
-- 4. Consider adding additional indexes based on your query patterns
-- 5. Review and adjust the VARCHAR lengths according to your needs

