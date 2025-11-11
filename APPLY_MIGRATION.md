# How to Apply the Migration Fix

This migration fixes the infinite recursion issue in the `user_roles` RLS policies when submitting vendor applications.

## Option 1: Apply via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/xthxutsliqptoodkzrcp
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/20250118000000_fix_user_roles_recursion.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

## Option 2: Apply via Supabase CLI (If you have access)

If you have the Supabase CLI configured with proper access:

```bash
cd /Users/subhayudas/Desktop/polybid
supabase db push
```

## What This Migration Does

1. **Creates `get_admin_users()` helper function**: Uses `SECURITY DEFINER` to bypass RLS when querying `user_roles`, preventing infinite recursion
2. **Updates `notify_admins_new_application()` function**: Now uses the helper function instead of directly querying `user_roles`
3. **Updates admin policies**: Adds `WITH CHECK` clauses to all admin policies for consistency

## Verification

After applying the migration, test vendor application submission:
1. Submit a new vendor application through the web interface
2. The application should submit successfully without the recursion error
3. Check the browser console for any errors

## Troubleshooting

If you encounter any issues:
- Check the Supabase dashboard logs for SQL errors
- Verify that the `user_roles` table exists and has the correct structure
- Ensure you have admin privileges to create functions and policies






