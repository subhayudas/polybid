import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, LogOut, Home, Package, Award } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, vendorProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Available Orders', icon: Package },
    { id: 'my-bids', label: 'My Bids', icon: Award },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Polybid</span>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  onClick={() => onViewChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {vendorProfile && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>{vendorProfile.company_name}</span>
              {vendorProfile.is_verified && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Verified
                </span>
              )}
            </div>
          )}
          
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-3 flex space-x-1 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'default' : 'ghost'}
              onClick={() => onViewChange(item.id)}
              size="sm"
              className="flex items-center space-x-1 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
