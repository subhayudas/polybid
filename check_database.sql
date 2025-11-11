-- =====================================================
-- CHECK WHAT EXISTS IN YOUR DATABASE
-- Run this FIRST to see what tables you have
-- =====================================================

-- 1. List all tables in the public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: This will show you ALL tables that currently exist
-- If 'orders' is NOT in this list, the table doesn't exist yet



