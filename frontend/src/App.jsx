import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import RecipeGenerator from './pages/RecipeGenerator';
import MyRecipes from './pages/MyRecipes';
import RecipeDetail from './pages/RecipeDetail';
import ShoppingList from './pages/ShoppingList';
import Settings from './pages/Settings';
import MealPlanner from './pages/MealPlanner';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><RecipeGenerator /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
        <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/meal-plan" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
        <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#2d2a2e',
            border: '2px solid #3d3a3d',
            borderRadius: '0',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          },
          success: {
            iconTheme: {
              primary: '#9b2226',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#9b2226',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

// Temporary Coming Soon component
const ComingSoon = ({ page }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{page}</h1>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
};

export default App;
