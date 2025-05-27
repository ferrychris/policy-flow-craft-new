import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PolicySidebar } from './PolicySidebar';
import { ChatInterface } from './ChatInterface';

export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If we're exactly at /dashboard, redirect to the home view
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="flex h-screen overflow-hidden">
      <PolicySidebar />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
