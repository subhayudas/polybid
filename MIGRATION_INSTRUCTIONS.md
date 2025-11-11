# Orders Table Migration Instructions

## Problem
The error `relation "public.orders" does not exist` means the orders table hasn't been created in your Supabase database yet.

## Solution
Apply the migration using the Supabase SQL Editor.

## Steps

### 1. Open Supabase SQL Editor
- Go to: https://supabase.com/dashboard/project/xthxutsliqptoodkzrcp
- Click **SQL Editor** in the left sidebar
- Click **New Query**

### 2. Copy and Run Migration
- Open the file: `apply_orders_migration.sql`
- Copy **ALL** the contents
- Paste into the Supabase SQL Editor
- Click **Run** (or press Cmd+Enter)

### 3. Verify Success
After running the script, verify it worked by running this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'orders';
```

You should see the `orders` table listed.

### 4. Insert Test Data (Optional)
To test that everything works, you can insert a sample order:

```sql
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity,
  status,
  priority
) VALUES (
  auth.uid(), -- Uses your current user ID
  'test_part.stl',
  'PLA',
  5,
  'pending',
  'normal'
);
```

Then query to see it:

```sql
SELECT * FROM public.orders ORDER BY created_at DESC;
```

### 5. Refresh Your Website
After the migration is complete:
1. Go back to your Polybid website
2. Refresh the `/orders` page
3. You should now see orders loading without errors!

## What This Migration Creates

- ✅ `orders` table with all necessary columns
- ✅ `order_status_history` table for tracking status changes
- ✅ Enums for order status and priority
- ✅ Automatic order number generation (PO-YYYYMMDD-00001)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic timestamps and logging

## Troubleshooting

### Foreign Key Errors
If you see errors about missing tables like `materials`, `material_types`, etc., that's okay! The migration will skip those foreign key constraints and the orders table will still be created. Those constraints only matter if you're using those specific features.

### Permission Errors
Make sure you're logged into Supabase with an account that has admin access to the project.

### Still Getting 404 Errors?
1. Verify the table exists using the query in step 3
2. Check the browser console for any new error messages
3. Make sure you refreshed the website after running the migration
4. Check that your `.env` file has the correct Supabase URL

## Need Help?
If you encounter any issues, share the error message and I'll help you resolve it!



