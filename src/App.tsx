import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, ProtectedRoute, SignInForm, SignUpForm } from './components/auth';
import { OrganizationProvider } from '@/contexts/organization-context';
import { ChatProvider } from '@/contexts/ChatContext';

import Dashboard from './pages/Dashboard';
import TeamsPage from './pages/organization/teams';
import PoliciesPage from './pages/organization/policies';
import NotFound from './pages/NotFound';
import { DashboardHome } from './components/dashboard/DashboardHome';
import PricingPage from './pages/pricing/Index';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <AuthProvider>
              <OrganizationProvider>
                <ChatProvider>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sign-in" element={<SignInForm />} />
                    <Route path="/sign-up" element={<SignUpForm />} />
                    <Route path="*" element={<NotFound />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    >

                      <Route index element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
                      <Route path="pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                      <Route path="organization">
                        <Route path="teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
                        <Route path="policies" element={<ProtectedRoute><PoliciesPage /></ProtectedRoute>} />
                        <Route path='pricing' element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                      </Route>
                      <Route path="generator" element={<ProtectedRoute><div>Policy Generator</div></ProtectedRoute>} />
                    </Route>
                  </Routes>
                </ChatProvider>
              </OrganizationProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
