-- Fix signup issue: Ensure no unique constraints on business_email that could interfere with signup
-- This migration checks and removes any problematic constraints

-- Check if there's a unique constraint on business_email in vendor_applications
-- If one exists, we should remove it as it could prevent legitimate signups
-- (Multiple applications with the same business email should be allowed, 
--  as a user might want to reapply after rejection)

-- Drop any unique constraint on business_email if it exists
DO $$
BEGIN
  -- Check if a unique constraint exists on business_email
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conrelid = 'public.vendor_applications'::regclass 
    AND conname LIKE '%business_email%'
    AND contype = 'u'
  ) THEN
    -- Get the constraint name and drop it
    EXECUTE (
      SELECT 'ALTER TABLE public.vendor_applications DROP CONSTRAINT IF EXISTS ' || conname || ';'
      FROM pg_constraint 
      WHERE conrelid = 'public.vendor_applications'::regclass 
      AND conname LIKE '%business_email%'
      AND contype = 'u'
      LIMIT 1
    );
  END IF;
END $$;

-- Also check vendor_profiles for any unique constraint on business_email
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conrelid = 'public.vendor_profiles'::regclass 
    AND conname LIKE '%business_email%'
    AND contype = 'u'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.vendor_profiles DROP CONSTRAINT IF EXISTS ' || conname || ';'
      FROM pg_constraint 
      WHERE conrelid = 'public.vendor_profiles'::regclass 
      AND conname LIKE '%business_email%'
      AND contype = 'u'
      LIMIT 1
    );
  END IF;
END $$;

-- Ensure there are no triggers on auth.users that could interfere with signup
-- (We don't create triggers on auth.users in this system, but check anyway)
-- Note: We can't directly check auth.users triggers from public schema,
-- but we can document that no such triggers should exist

-- Add a comment to document this
COMMENT ON TABLE public.vendor_applications IS 'Vendor registration applications. Multiple applications per user are allowed. No unique constraint on business_email to allow reapplications.';
COMMENT ON TABLE public.vendor_profiles IS 'Verified vendor profiles. One profile per user (enforced by primary key on id which references auth.users).';






