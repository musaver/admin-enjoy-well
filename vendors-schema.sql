-- ============================================
-- VENDOR MODULE - DATABASE SCHEMA
-- ============================================
-- This file contains the SQL queries to create the vendor_profiles table
-- Execute this query in your MySQL database

-- First, update the user table to support 'vendor' user type (if not already done)
-- ALTER TABLE user MODIFY COLUMN user_type VARCHAR(20) DEFAULT 'customer' COMMENT 'customer, driver, admin, vendor';

-- Table: vendor_profiles
-- Description: Stores extended company/brand information for vendor users
CREATE TABLE IF NOT EXISTS `vendor_profiles` (
  `id` VARCHAR(255) PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Reference to user table with userType=vendor',
  
  -- Company Information
  `company_name` VARCHAR(255) NOT NULL,
  `company_legal_name` VARCHAR(255),
  `company_registration_number` VARCHAR(100),
  `tax_id` VARCHAR(100) COMMENT 'NTN or Sales Tax Number',
  
  -- Business Details
  `business_type` VARCHAR(50) COMMENT 'manufacturer, distributor, retailer, wholesaler',
  `industry_category` VARCHAR(100),
  `year_established` INT,
  `number_of_employees` VARCHAR(50) COMMENT '1-10, 11-50, 51-200, 201-500, 500+',
  
  -- Contact Information
  `company_email` VARCHAR(255),
  `company_phone` VARCHAR(20),
  `company_website` VARCHAR(255),
  
  -- Address
  `business_address` TEXT,
  `business_city` VARCHAR(100),
  `business_state` VARCHAR(100),
  `business_postal_code` VARCHAR(20),
  `business_country` VARCHAR(100),
  
  -- Bank Details (for payments)
  `bank_name` VARCHAR(255),
  `bank_account_title` VARCHAR(255),
  `bank_account_number` VARCHAR(50),
  `bank_iban` VARCHAR(50),
  `bank_branch_code` VARCHAR(50),
  
  -- Business Documents
  `logo` VARCHAR(500) COMMENT 'Company logo URL',
  `business_license` VARCHAR(500) COMMENT 'Business license document URL',
  `tax_certificate` VARCHAR(500) COMMENT 'Tax registration certificate URL',
  
  -- Description & Social Media
  `description` TEXT COMMENT 'Company description',
  `short_bio` VARCHAR(500) COMMENT 'Short company bio',
  `facebook_url` VARCHAR(255),
  `instagram_url` VARCHAR(255),
  `twitter_url` VARCHAR(255),
  `linkedin_url` VARCHAR(255),
  
  -- Commission & Payment Settings
  `commission_rate` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Percentage commission',
  `payment_terms` VARCHAR(100) COMMENT 'Net 30, Net 60, etc.',
  
  -- Status & Verification
  `verification_status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, verified, rejected',
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  
  -- Additional Info
  `notes` TEXT COMMENT 'Admin notes about the vendor',
  `rating` DECIMAL(3, 2) COMMENT 'Average rating',
  `total_products` INT DEFAULT 0,
  `total_sales` DECIMAL(15, 2) DEFAULT 0.00,
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_vendor_profiles_user_id` (`user_id`),
  INDEX `idx_vendor_profiles_company_name` (`company_name`),
  INDEX `idx_vendor_profiles_verification_status` (`verification_status`),
  INDEX `idx_vendor_profiles_is_active` (`is_active`),
  
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (Optional - Remove if not needed)
-- ============================================

-- Sample vendor user (create a user first)
-- INSERT INTO `user` 
--   (`id`, `name`, `email`, `phone`, `user_type`, `status`, `created_at`)
-- VALUES
--   (UUID(), 'ABC Corporation', 'contact@abccorp.com', '+92-300-1234567', 'vendor', 'approved', NOW());

-- Sample vendor profile (replace USER_ID with actual user ID from above)
-- INSERT INTO `vendor_profiles`
--   (`id`, `user_id`, `company_name`, `company_email`, `company_phone`, 
--    `business_type`, `business_address`, `business_city`, `business_country`,
--    `verification_status`, `is_active`)
-- VALUES
--   (UUID(), 'USER_ID_HERE', 'ABC Corporation', 'contact@abccorp.com', '+92-300-1234567',
--    'manufacturer', '123 Business Street', 'Karachi', 'Pakistan',
--    'verified', TRUE);

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get all vendors with their user information
-- SELECT 
--   u.id, u.name, u.email, u.phone, u.status,
--   vp.company_name, vp.company_phone, vp.business_type,
--   vp.verification_status, vp.total_products, vp.total_sales
-- FROM user u
-- INNER JOIN vendor_profiles vp ON u.id = vp.user_id
-- WHERE u.user_type = 'vendor'
-- ORDER BY vp.created_at DESC;

-- Get verified and active vendors
-- SELECT * FROM vendor_profiles 
-- WHERE verification_status = 'verified' 
-- AND is_active = TRUE
-- ORDER BY company_name;

-- Get vendors pending verification
-- SELECT 
--   u.name, u.email, vp.company_name, vp.created_at
-- FROM user u
-- INNER JOIN vendor_profiles vp ON u.id = vp.user_id
-- WHERE vp.verification_status = 'pending'
-- ORDER BY vp.created_at ASC;

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure the 'user' table exists before running this
-- 2. The user_type field in 'user' table should support 'vendor' value
-- 3. Each vendor must have a user account first with user_type='vendor'
-- 4. The vendor_profiles table stores extended company information
-- 5. One user can have only one vendor profile (UNIQUE constraint on user_id)

