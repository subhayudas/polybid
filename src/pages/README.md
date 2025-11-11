# Pages Directory

This directory contains all the main page components for the Polybid application.

## Pages

### Landing.tsx
The landing page of the application. Shows marketing content, features, pricing, and about sections. Visible to all users (authenticated and non-authenticated).

**Route:** `/`

**Features:**
- Hero section with email signup
- Features showcase
- Solution overview
- Pricing tiers
- About section

### Orders.tsx
The orders and bidding page. Shows all available orders and allows users to submit bids.

**Route:** `/orders`

**Access:** Authenticated users only (automatic redirect after sign-in)

**Features:**
- Orders listing with real-time data
- Order details panel
- Bid submission form
- Current bids display
- Status and priority indicators
- Responsive design

**State Management:**
- `orders` - List of all orders from database
- `selectedOrder` - Currently selected order for bidding
- `bids` - List of bids for selected order
- `isLoading` - Loading state
- `isSubmittingBid` - Bid submission state

**API Calls:**
- `fetchOrders()` - Fetches all orders from Supabase
- `fetchBidsForOrder()` - Fetches bids for a specific order
- `handleSubmitBid()` - Submits a new bid

## Adding New Pages

To add a new page:

1. Create a new component file in this directory (e.g., `MyPage.tsx`)
2. Export the component:
   ```tsx
   export const MyPage = () => {
     return <div>My Page Content</div>;
   };
   ```
3. Add the route in `src/App.tsx`:
   ```tsx
   import { MyPage } from '@/pages/MyPage';
   
   // In the Routes section:
   <Route path="/my-page" element={<MyPage />} />
   ```
4. Add navigation link in `src/components/Navbar.tsx` if needed

## Page Layout

All pages should follow this structure:

```tsx
export const MyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page content */}
      </div>
    </div>
  );
};
```

This ensures consistent styling with the rest of the application.

## Protected Routes

To make a route accessible only to authenticated users:

1. Add authentication check in the component:
   ```tsx
   import { useAuth } from '@/hooks/useAuth';
   import { useNavigate } from 'react-router-dom';
   import { useEffect } from 'react';

   export const ProtectedPage = () => {
     const { user, isLoading } = useAuth();
     const navigate = useNavigate();

     useEffect(() => {
       if (!isLoading && !user) {
         navigate('/');
       }
     }, [user, isLoading, navigate]);

     if (isLoading) {
       return <div>Loading...</div>;
     }

     return <div>Protected Content</div>;
   };
   ```

2. Or create a ProtectedRoute wrapper component (recommended for multiple protected pages)

## Styling

- Use Tailwind CSS classes for styling
- Follow the existing color scheme (emerald/cyan)
- Use shadcn/ui components from `@/components/ui/`
- Ensure responsive design (test on mobile, tablet, desktop)

## Data Fetching

Use Supabase client for data operations:

```tsx
import { supabase } from '@/integrations/supabase/client';

const fetchData = async () => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Use data
};
```

## Best Practices

1. **Loading States**: Always show loading indicators during async operations
2. **Error Handling**: Handle and display errors gracefully
3. **Type Safety**: Use TypeScript types from `@/types/database.ts`
4. **Accessibility**: Include proper ARIA labels and semantic HTML
5. **Performance**: Optimize re-renders with proper dependencies
6. **Mobile First**: Design for mobile, then enhance for larger screens


