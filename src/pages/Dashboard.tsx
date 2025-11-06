import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorProfile, useVendorApplication } from '@/hooks/useVendorProfile';
import { useAvailableOrders } from '@/hooks/useOrders';
import { useVendorBids, useVendorOrderAssignments } from '@/hooks/useBids';
import { AuthForm } from '@/components/AuthForm';
import { VendorApplicationForm } from '@/components/VendorApplicationForm';
import { Navigation } from '@/components/Navigation';
import { OrderCard } from '@/components/OrderCard';
import { BidForm } from '@/components/BidForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order } from '@/hooks/useOrders';
import { AlertCircle, CheckCircle, Clock, DollarSign, Package, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { data: vendorProfile } = useVendorProfile();
  const { data: vendorApplication } = useVendorApplication();
  const { data: orders } = useAvailableOrders();
  const { data: myBids } = useVendorBids();
  const { data: assignments } = useVendorOrderAssignments();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showBidForm, setShowBidForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  // Check if user needs to apply as vendor
  if (!vendorProfile && !vendorApplication) {
    return (
      <VendorApplicationForm 
        onSuccess={() => window.location.reload()} 
      />
    );
  }

  // Show application status if pending
  if (vendorApplication && !vendorProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              {vendorApplication.status === 'pending' && (
                <div className="flex items-center justify-center mb-4">
                  <Clock className="h-12 w-12 text-yellow-500" />
                </div>
              )}
              {vendorApplication.status === 'under_review' && (
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-blue-500" />
                </div>
              )}
              {vendorApplication.status === 'rejected' && (
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Application Status</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your vendor application for <strong>{vendorApplication.company_name}</strong> is currently{' '}
              <span className="capitalize font-medium">{vendorApplication.status}</span>
            </p>
            
            {vendorApplication.status === 'rejected' && vendorApplication.review_notes && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{vendorApplication.review_notes}</p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              We'll notify you via email once your application has been reviewed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceBid = (order: Order) => {
    setSelectedOrder(order);
    setShowBidForm(true);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myBids?.filter(bid => bid.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendorProfile?.rating?.toFixed(1) || '0.0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendorProfile?.total_orders_completed || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders available for bidding</CardDescription>
          </CardHeader>
          <CardContent>
            {orders?.slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">{order.material}</p>
                </div>
                <Button size="sm" onClick={() => handlePlaceBid(order)}>
                  Bid
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Recent Bids</CardTitle>
            <CardDescription>Your latest bid activity</CardDescription>
          </CardHeader>
          <CardContent>
            {myBids?.slice(0, 3).map(bid => (
              <div key={bid.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">Order #{bid.order_id.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">${bid.bid_amount}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  bid.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bid.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Orders</h2>
        <p className="text-muted-foreground">{orders?.length || 0} orders available</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders?.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={() => {}}
            onPlaceBid={handlePlaceBid}
          />
        ))}
      </div>
    </div>
  );

  const renderMyBids = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Bids</h2>
      
      <div className="space-y-4">
        {myBids?.map(bid => (
          <Card key={bid.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Order #{bid.order_id.slice(-8)}</h3>
                  <p className="text-muted-foreground">Bid: ${bid.bid_amount}</p>
                  <p className="text-sm text-muted-foreground">
                    Delivery: {bid.estimated_delivery_days} days
                  </p>
                  {bid.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{bid.notes}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  bid.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bid.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="container mx-auto px-4 py-6">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'orders' && renderOrders()}
        {currentView === 'my-bids' && renderMyBids()}
      </main>

      {showBidForm && selectedOrder && (
        <BidForm
          order={selectedOrder}
          onClose={() => {
            setShowBidForm(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            // Refresh data
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

