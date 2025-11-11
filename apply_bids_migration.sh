#!/bin/bash

# Apply the bids table migration to Supabase

echo "🚀 Applying bids table migration to Supabase..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Install it with: npm install -g supabase"
    exit 1
fi

echo "📋 Migration file: supabase/migrations/20251109000003_update_bids_table.sql"
echo ""

# Apply the migration
npx supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🎉 Your orders and bidding system is now ready to use!"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run dev' to start the development server"
    echo "  2. Sign in with Google"
    echo "  3. You'll be redirected to the orders page automatically"
    echo "  4. Start browsing orders and placing bids!"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error message above."
    echo ""
    echo "Manual option:"
    echo "  1. Go to your Supabase project dashboard"
    echo "  2. Navigate to SQL Editor"
    echo "  3. Copy and paste the contents of supabase/migrations/20251109000003_update_bids_table.sql"
    echo "  4. Run the SQL query"
    echo ""
fi



