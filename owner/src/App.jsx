import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import AddListing from './pages/AddListing';
import EditListing from './pages/EditListing';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';

function OwnerLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar />
      <div className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with sidebar layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <OwnerLayout><Dashboard /></OwnerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings"
            element={
              <ProtectedRoute>
                <OwnerLayout><Listings /></OwnerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/new"
            element={
              <ProtectedRoute>
                <OwnerLayout><AddListing /></OwnerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              <ProtectedRoute>
                <OwnerLayout><EditListing /></OwnerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <OwnerLayout><Bookings /></OwnerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <OwnerLayout><Profile /></OwnerLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '14px' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
