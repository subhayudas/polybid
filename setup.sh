#!/bin/bash
set -e

echo "🚀 Polybid Setup Script"
echo "========================"
echo ""

# Check Docker
echo "📦 Checking Docker..."
if ! docker ps &>/dev/null; then
    echo "❌ Docker is not running!"
    echo "   Please start Docker Desktop and run this script again."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Start Supabase
echo "🗄️  Starting Supabase..."
supabase start
echo ""

# Run migrations
echo "📊 Running database migrations..."
supabase db reset
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' in a new terminal"
echo "2. Open http://localhost:3001 in your browser"
echo ""
