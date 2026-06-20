import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Report from './pages/Report';
import ItemDetail from './pages/ItemDetail';
import MyItems from './pages/MyItems';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-ink-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/item/:id" element={<ItemDetail />} />

              <Route path="/login" element={
                <PublicOnlyRoute><Login /></PublicOnlyRoute>
              } />
              <Route path="/register" element={
                <PublicOnlyRoute><Register /></PublicOnlyRoute>
              } />

              <Route path="/report" element={
                <ProtectedRoute><Report /></ProtectedRoute>
              } />
              <Route path="/my-items" element={
                <ProtectedRoute><MyItems /></ProtectedRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute><Admin /></AdminRoute>
              } />

              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <p className="text-5xl mb-4">404</p>
                  <p className="text-ink-500 font-medium">Page not found</p>
                  <a href="/" className="btn-primary mt-4 text-sm">Go home</a>
                </div>
              } />
            </Routes>
          </main>
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#161618',
              border: '1px solid #eeeef0',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
