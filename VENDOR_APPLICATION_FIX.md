# Vendor Application Submission Issue - Fix Guide

## Problem Identified

The vendor application submission is failing due to an **infinite recursion error in the database RLS (Row Level Security) policies** for the `user_roles` table. This is preventing all database operations on vendor-related tables.

### Error Message
```
infinite recursion detected in policy for relation "user_roles"
```

### Root Cause
The RLS policies on the vendor tables (vendor_applications, vendor_profiles, bids, order_assignments) reference the `user_roles` table to check for admin permissions. However, the `user_roles` table itself has RLS policies that create a circular dependency, causing infinite recursion.

## Immediate Fix Required

### Option 1: Fix via Supabase Dashboard (Recommended)

1. **Access Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `xthxutsliqptoodkzrcp`

2. **Go to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Fix Migration**
   - Copy and paste the contents of `supabase/migrations/20250118000001_fix_vendor_application_policies.sql`
   - Execute the SQL to fix the RLS policies

### Option 2: Manual Policy Fix

If you can't run the full migration, execute these critical SQL commands in the Supabase SQL Editor:

```sql
-- Drop problematic admin policies
DROP POLICY IF EXISTS "Admins can manage all vendor profiles" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.vendor_applications;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.order_assignments;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.vendor_reviews;

-- Create basic policies for vendor applications
CREATE POLICY "Users can create applications" ON public.vendor_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications" ON public.vendor_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role for system operations
CREATE POLICY "Service role can manage applications" ON public.vendor_applications
  FOR ALL USING (auth.role() = 'service_role');
```

### Option 3: Temporary Workaround (If database access is limited)

The frontend has been updated to handle the RLS recursion error gracefully. However, the vendor application submission will still fail until the database policies are fixed.

## Files Modified

1. **`src/hooks/useVendorProfile.ts`**
   - Added error handling for RLS recursion errors
   - Prevents app crashes when the database error occurs
   - Provides better error messages to users

2. **`supabase/migrations/20250118000001_fix_vendor_application_policies.sql`**
   - Contains the complete fix for the RLS policy issues
   - Removes problematic admin policies that cause recursion
   - Adds safe policies that don't reference user_roles

## Testing the Fix

After applying the database fix, test the vendor application submission:

1. Start the development server: `npm run dev`
2. Navigate to the application
3. Sign up/sign in as a new user
4. Fill out the vendor application form
5. Submit the application

The submission should now work without the infinite recursion error.

## Long-term Solution

1. **Fix the user_roles table RLS policies** to prevent recursion
2. **Re-implement admin policies** once the user_roles recursion is resolved
3. **Add proper admin role management** with non-recursive policies

## Current Status

- ✅ Issue identified: RLS policy infinite recursion
- ✅ Frontend error handling implemented
- ✅ Database fix migration created
- ⏳ **Database fix needs to be applied via Supabase Dashboard**
- ⏳ Testing required after database fix

## Next Steps

1. **URGENT**: Apply the database fix via Supabase Dashboard
2. Test vendor application submission
3. Verify all vendor-related functionality works
4. Plan long-term fix for user_roles table RLS policies

---

**Note**: The vendor application system will remain non-functional until the database RLS policies are fixed. The frontend changes provide better error handling but don't resolve the underlying database issue.





