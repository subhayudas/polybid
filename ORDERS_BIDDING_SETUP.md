# Orders & Bidding System Setup Guide

## Overview
Your Polybid application now includes a comprehensive orders and bidding system! After users sign in, they are automatically redirected to the orders page where they can view all available orders and place bids.

## Features Implemented

### 1. **Orders Page** (`/orders`)
- Displays all orders from the database
- Shows order details including:
  - Order number, status, and priority
  - File name and material
  - Quantity and pricing
  - Technical specifications (color, infill, layer height, etc.)
  - Timestamps (creation date, delivery estimates)
- Real-time order listing with automatic updates

### 2. **Bidding System**
- Users can submit bids on any order
- Bid submission includes:
  - Bid amount ($)
  - Estimated delivery time (days)
  - Optional notes
- View all existing bids for an order
- Transparent bidding - all users can see all bids
- Lowest bid is highlighted automatically
- Bids are sorted by amount (lowest first)

### 3. **User Experience**
- Automatic redirect to orders page after Google sign-in
- Beautiful, responsive UI with Tailwind CSS
- Color-coded status badges (pending, confirmed, in production, etc.)
- Priority indicators (urgent, high, normal, low)
- Real-time timestamps with human-readable formats

### 4. **Navigation**
- Updated Navbar with "Orders" link (visible only to authenticated users)
- Smooth routing between landing page and orders page
- Active route highlighting

## Database Setup

### Apply the Migration

Run the following command to apply the new migration to your Supabase database:

```bash
npx supabase db push
```

This migration will:
1. Add foreign key constraint from `bids` to `orders` table
2. Set up Row Level Security (RLS) policies for the `bids` table
3. Create policies for `vendor_profiles` table
4. Add a trigger to automatically create vendor profiles for new users
5. Create database indexes for better query performance

### Manual Migration (Alternative)

If you prefer to apply the migration manually through Supabase Dashboard:

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Open and run the migration file: `supabase/migrations/20251109000003_update_bids_table.sql`

## File Structure

```
src/
├── pages/
│   ├── Landing.tsx       # Landing page (moved from App.tsx)
│   └── Orders.tsx        # Orders & bidding page (NEW)
├── components/
│   └── Navbar.tsx        # Updated with Orders link
├── App.tsx              # Updated with routing
└── main.tsx             # Updated with BrowserRouter
```

## Testing the System

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test the Flow
1. Open your browser and navigate to `http://localhost:5173`
2. Click "Sign in with Google" in the Navbar
3. After successful authentication, you'll be automatically redirected to `/orders`
4. You should see all orders from the database
5. Click on any order to view details
6. Fill out the bid form and submit a bid
7. Your bid should appear in the "Current Bids" section

### 3. Create Test Orders (Optional)

If you don't have any orders in the database yet, you can create some test orders using the SQL Editor in Supabase:

```sql
-- Insert a test order
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity,
  status,
  priority,
  notes,
  color,
  infill_percentage,
  layer_height,
  support_required
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),  -- Use an existing user ID
  'test-part.stl',
  'PLA',
  5,
  'pending',
  'normal',
  'Test order for bidding system',
  'Blue',
  20,
  0.2,
  true
);
```

## Database Tables

### Orders Table
Already exists with all necessary fields for manufacturing orders.

### Bids Table
- `id`: UUID primary key
- `order_id`: References orders table
- `vendor_id`: References vendor_profiles table
- `bid_amount`: Decimal (bid price)
- `estimated_delivery_days`: Integer
- `notes`: Text (optional)
- `status`: Enum ('active', 'withdrawn', 'accepted', 'rejected', 'expired')
- `submitted_at`: Timestamp
- `updated_at`: Timestamp

### Vendor Profiles Table
Automatically created for each user with:
- Company name (from user metadata or email)
- Business email
- Verification status
- Active status

## Security

### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

**Bids Table:**
- ✅ All authenticated users can view all bids
- ✅ Users can only create bids for themselves
- ✅ Users can only update/delete their own bids

**Vendor Profiles Table:**
- ✅ All authenticated users can view all profiles
- ✅ Users can only create/update their own profile

**Orders Table:**
- Policies should already be set up from previous migrations

## Customization

### Modify Bid Fields
To add more fields to the bidding form, edit `/src/pages/Orders.tsx`:

1. Add state variables for new fields
2. Add form inputs in the "Submit Your Bid" section
3. Update the `handleSubmitBid` function to include new fields

### Change Order Display
To customize which order fields are displayed, edit the order card section in `/src/pages/Orders.tsx`.

### Styling
All styles use Tailwind CSS classes. Modify the color scheme by changing:
- `emerald` → your preferred color
- Adjust in `tailwind.config.ts` for global changes

## Troubleshooting

### Orders Not Showing
1. Check if orders exist in the database
2. Verify RLS policies on the orders table
3. Check browser console for errors

### Can't Submit Bids
1. Ensure user is authenticated
2. Check if vendor_profile was created for the user
3. Verify the bids table migration was applied
4. Check browser console for detailed error messages

### Redirect Not Working
1. Clear browser cache
2. Check if user is properly authenticated
3. Verify the `useEffect` in `App.tsx` is running

## Next Steps

Consider implementing:
1. **Bid acceptance** - Allow order creators to accept bids
2. **Bid notifications** - Email/push notifications for new bids
3. **Order filtering** - Filter by status, priority, material
4. **Search functionality** - Search orders by keywords
5. **User dashboard** - Show user's own orders and bids
6. **Bid expiry** - Automatic bid expiration after certain time
7. **Order analytics** - Statistics and charts for orders and bids

## Support

For issues or questions:
- Check the browser console for errors
- Review Supabase logs in the dashboard
- Verify all migrations have been applied
- Ensure environment variables are set correctly in `.env`

---

**Status**: ✅ Complete and ready to use!


