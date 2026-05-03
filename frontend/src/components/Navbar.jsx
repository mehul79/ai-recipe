import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ChefHat, Home, UtensilsCrossed, Calendar, ShoppingCart, Settings, LogOut } from 'lucide-react';

const Navbar = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-[var(--border-ink)] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-900 uppercase tracking-tight">
                        <ChefHat className="w-7 h-7 text-[#9b2226]" />
                        <span>Cook Gen</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" />
                        <NavLink to="/pantry" icon={<UtensilsCrossed className="w-4 h-4" />} label="Pantry" />
                        <NavLink to="/generate" icon={<ChefHat className="w-4 h-4" />} label="Generate" />
                        <NavLink to="/recipes" icon={<UtensilsCrossed className="w-4 h-4" />} label="Recipes" />
                        <NavLink to="/meal-plan" icon={<Calendar className="w-4 h-4" />} label="Meal Plan" />
                        <NavLink to="/shopping-list" icon={<ShoppingCart className="w-4 h-4" />} label="Shopping" />
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/settings"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-[var(--border-ink)] transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-[var(--border-ink)] transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => {
    return (
        <Link
            to={to}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-[#9b2226] hover:bg-gray-50 border-b-2 border-transparent hover:border-[#9b2226] transition-colors"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default Navbar;
