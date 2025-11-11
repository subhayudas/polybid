import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Landing } from '@/pages/Landing';
import { Orders } from '@/pages/Orders';
import { useAuth } from '@/hooks/useAuth';

const App = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to orders page after sign-in
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/orders');
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 text-slate-900">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 translate-x-1/3 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="relative flex min-h-screen flex-col">
        <Navbar />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>

        <footer className="border-t border-emerald-100/70 bg-white">
          <div className="flex w-full flex-col gap-4 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-12 lg:px-20">
            <span>&copy; {new Date().getFullYear()} Polybid. All rights reserved.</span>
            <a href="mailto:hello@polybid.com" className="font-medium text-emerald-600 transition hover:text-emerald-700">
              Contact us
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
