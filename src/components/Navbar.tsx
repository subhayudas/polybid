import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Features', href: '#features' },
  { name: 'Solution', href: '#solution' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
];

export const Navbar = () => {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in with Google', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);

  const authControls = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
      {!isLoading && user ? (
        <>
          <span className="text-sm font-medium text-slate-600 sm:text-right">
            {user.user_metadata?.full_name ?? user.email}
          </span>
          <Button
            onClick={handleSignOut}
            variant="outline"
            disabled={isSubmitting}
            className="sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Sign out'}
          </Button>
        </>
      ) : (
        <Button
          onClick={handleSignIn}
          disabled={isLoading || isSubmitting}
          className="sm:w-auto"
        >
          {isLoading || isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Sign in with Google'
          )}
        </Button>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
      <nav
        data-state={isMenuOpen ? 'open' : 'closed'}
        className="relative w-full px-6 py-4 transition md:px-10 lg:px-16"
      >
        <div className="flex w-full items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-200">
              P
            </span>
            Polybid
          </Link>
          <div className="hidden items-center gap-10 lg:flex">
            <ul className="flex items-center gap-8 text-sm font-medium text-slate-600">
              {user && (
                <li>
                  <Link
                    to="/orders"
                    className={cn(
                      "transition hover:text-emerald-600",
                      location.pathname === '/orders' && "text-emerald-600 font-semibold"
                    )}
                  >
                    Orders
                  </Link>
                </li>
              )}
              {location.pathname === '/' && menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="transition hover:text-emerald-600"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            {authControls}
          </div>
          <button
            type="button"
            onClick={handleToggleMenu}
            className="relative inline-flex size-10 items-center justify-center rounded-lg border border-emerald-100 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 lg:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu
              className={cn(
                'absolute size-5 transition-all duration-200',
                isMenuOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
              )}
            />
            <X
              className={cn(
                'absolute size-5 transition-all duration-200',
                isMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            'lg:hidden',
            isMenuOpen
              ? 'pointer-events-auto max-h-screen opacity-100'
              : 'pointer-events-none max-h-0 opacity-0',
          )}
        >
          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 shadow-xl shadow-emerald-200/20">
            <ul className="flex flex-col divide-y divide-emerald-50 text-sm font-medium text-slate-600">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="block px-5 py-4 transition hover:bg-emerald-50/60 hover:text-emerald-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-emerald-50 bg-emerald-50/40 px-5 py-6">
              {authControls}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

