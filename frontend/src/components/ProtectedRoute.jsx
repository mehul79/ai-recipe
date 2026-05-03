import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--paper-bg)]">
                <div className="w-8 h-8 border-2 border-[#9b2226] border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
