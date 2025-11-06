# Polybid - Vendors Portal

A comprehensive vendor bidding system that allows verified vendors to bid on manufacturing orders from Polyform Print Studio. The system features real-time bidding, order management, and automated vendor verification.

## 🚀 Features

### For Vendors
- **Vendor Application System**: Complete application process with verification
- **Real-time Order Feed**: View available orders with detailed specifications
- **Competitive Bidding**: Place bids with custom pricing and delivery estimates
- **Order Management**: Track bid status and manage won orders
- **Dashboard Analytics**: View performance metrics, ratings, and order history
- **Profile Management**: Manage capabilities, materials, and certifications

### System Features
- **Lowest Bid Selection**: Automatic assignment to the lowest qualifying bid
- **Real-time Updates**: Live updates for new orders and bid changes
- **Secure Authentication**: Supabase-powered authentication system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Material & Process Matching**: Advanced filtering based on vendor capabilities

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or bun
- Supabase CLI (for local development)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/subhayudas/polybid.git
cd polybid
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

For local development, the default values work with Supabase local development.

### 3. Database Setup

```bash
# Install Supabase CLI if you haven't already
npm install -g @supabase/cli

# Start local Supabase (this will take a few minutes on first run)
supabase start

# Run migrations
supabase db reset
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## 🗄 Database Schema

The system includes comprehensive database tables:

- **vendor_profiles**: Verified vendor information and capabilities
- **vendor_applications**: New vendor registration applications
- **bids**: Vendor bids on orders with pricing and delivery estimates
- **order_assignments**: Winning bid assignments to vendors
- **bid_notifications**: Real-time notifications for bidding events
- **vendor_reviews**: Customer reviews and ratings for completed orders

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
polybid/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── AuthForm.tsx    # Authentication form
│   │   ├── BidForm.tsx     # Bid submission form
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── OrderCard.tsx   # Order display card
│   │   └── VendorApplicationForm.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── hooks/              # Custom React hooks
│   │   ├── useBids.ts      # Bid management hooks
│   │   ├── useOrders.ts    # Order fetching hooks
│   │   └── useVendorProfile.ts
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client and types
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   └── main.tsx           # Application entry point
├── supabase/
│   ├── config.toml        # Supabase configuration
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## 🔐 Authentication Flow

1. **User Registration**: Users create accounts via email/password
2. **Vendor Application**: New users submit vendor applications
3. **Admin Review**: Applications are reviewed and approved/rejected
4. **Vendor Verification**: Approved vendors get verified status
5. **Bidding Access**: Only verified vendors can place bids

## 📊 Bidding System

### How It Works

1. **Order Creation**: Orders are created in the main Polyform system
2. **Order Display**: Available orders appear in the polybid portal
3. **Vendor Bidding**: Verified vendors can place competitive bids
4. **Automatic Selection**: System assigns orders to the lowest bid
5. **Order Fulfillment**: Winning vendors fulfill the orders

### Bid Components

- **Bid Amount**: Total cost for the order
- **Delivery Time**: Estimated completion days
- **Notes**: Additional details about capabilities or process
- **Materials Breakdown**: Detailed cost breakdown (optional)

## 🚀 Production Deployment

### Environment Variables

For production, update your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build and Deploy

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

## 🔗 Integration with Polyform

This system is designed to integrate with the main Polyform Print Studio system:

1. **Order Sync**: Orders from the main system appear in polybid
2. **Bid Selection**: Winning bids are communicated back to main system
3. **Status Updates**: Order progress is tracked across both systems

## 📝 API Integration

The system uses Supabase for all backend operations:

- **Real-time subscriptions** for live order updates
- **Row Level Security (RLS)** for data protection
- **Automatic triggers** for rating calculations
- **Comprehensive indexing** for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Private - All rights reserved

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team

---

**Built with ❤️ for efficient manufacturing vendor management**

