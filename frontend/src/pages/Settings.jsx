import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, ChefHat } from 'lucide-react';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];

const Settings = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });

    // Preferences state
    const [preferences, setPreferences] = useState({
        dietary_restrictions: [],
        allergies: [],
        preferred_cuisines: [],
        default_servings: 4,
        measurement_unit: 'metric'
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const loadUserData = async () => {
        try {
            const [userRes, prefRes] = await Promise.all([
                api.get('/auth/me'),
                api.get('/preferences')
            ]);
            
            if (userRes.data?.user) {
                setProfile({
                    name: userRes.data.user.name || '',
                    email: userRes.data.user.email || ''
                });
            }

            if (prefRes.data?.data) {
                const data = prefRes.data.data;
                setPreferences({
                    dietary_restrictions: data.dietary_restrictions || [],
                    allergies: data.allergies || [],
                    preferred_cuisines: data.preferred_cuisines || [],
                    default_servings: data.default_servings || 4,
                    measurement_unit: data.measurement_unit || 'metric'
                });
            }
        } catch (error) {
            console.error('Failed to load user data', error);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/auth/profile', profile);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
        setSaving(false);
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/preferences', preferences);
            toast.success('Preferences updated successfully');
        } catch (error) {
            toast.error('Failed to update preferences');
        }
        setSaving(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation !== 'DELETE') {
            toast.error('Account deletion cancelled');
            return;
        }

        try {
            await api.delete('/auth/account');
            toast.success('Account deleted successfully');
            logout();
            navigate('/login');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    const toggleDietary = (option) => {
        setPreferences(prev => ({
            ...prev,
            dietary_restrictions: prev.dietary_restrictions.includes(option)
                ? prev.dietary_restrictions.filter(d => d !== option)
                : [...prev.dietary_restrictions, option]
        }));
    };

    const toggleCuisine = (cuisine) => {
        setPreferences(prev => ({
            ...prev,
            preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
                ? prev.preferred_cuisines.filter(c => c !== cuisine)
                : [...prev.preferred_cuisines, cuisine]
        }));
    };

    return (
        <div className="min-h-screen bg-[var(--paper-bg)] font-serif">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="cookbook-header mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest italic">Kitchen Settings</h1>
                    <p className="text-gray-600 mt-2 font-serif italic text-lg tracking-tight">Configure your culinary preferences and account</p>
                </div>

                <div className="space-y-12">
                    {/* Profile Section */}
                    <div className="cookbook-card">
                        <div className="flex items-center gap-4 mb-8 border-b border-[var(--border-ink)] pb-4">
                            <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center bg-gray-50 text-[#9b2226]">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold italic text-gray-900 tracking-tight">Personal Information</h2>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Email Address</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full px-3 py-2 border border-[var(--border-ink)] font-serif bg-gray-50 text-gray-400 italic"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="cookbook-button uppercase tracking-widest text-[10px] font-bold font-sans flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Recording...' : 'Record Changes'}
                            </button>
                        </form>
                    </div>


                    {/* Preferences Section */}
                    <div className="cookbook-card">
                        <div className="flex items-center gap-4 mb-8 border-b border-[var(--border-ink)] pb-4">
                            <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center bg-gray-50 text-[#9b2226]">
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold italic text-gray-900 tracking-tight">Dietary Preferences</h2>
                        </div>

                        <form onSubmit={handlePreferencesUpdate} className="space-y-8 font-serif">
                            {/* Dietary Restrictions */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-sans">Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-3">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleDietary(option)}
                                            className={`px-4 py-1 border font-sans uppercase tracking-widest text-[10px] font-bold transition-all ${preferences.dietary_restrictions.includes(option)
                                                ? 'bg-[#9b2226] text-white border-[#9b2226]'
                                                : 'bg-white text-gray-700 border-[var(--border-ink)] hover:bg-gray-50'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Known Allergies (comma-separated)</label>
                                <input
                                    type="text"
                                    value={preferences.allergies.join(', ')}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                    })}
                                    placeholder="e.g., peanuts, shellfish, soy"
                                    className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif italic"
                                />
                            </div>

                            {/* Preferred Cuisines */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-sans">Preferred Cuisines</label>
                                <div className="flex flex-wrap gap-3">
                                    {CUISINES.map(cuisine => (
                                        <button
                                            key={cuisine}
                                            type="button"
                                            onClick={() => toggleCuisine(cuisine)}
                                            className={`px-4 py-1 border font-sans uppercase tracking-widest text-[10px] font-bold transition-all ${preferences.preferred_cuisines.includes(cuisine)
                                                ? 'bg-[#9b2226] text-white border-[#9b2226]'
                                                : 'bg-white text-gray-700 border-[var(--border-ink)] hover:bg-gray-50'
                                                }`}
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Default Servings */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-sans">
                                        Default Servings: {preferences.default_servings}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="12"
                                        value={preferences.default_servings}
                                        onChange={(e) => setPreferences({ ...preferences, default_servings: parseInt(e.target.value) })}
                                        className="w-full h-1 bg-[var(--border-ink)] rounded-none appearance-none cursor-pointer accent-[#9b2226]"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-sans font-bold uppercase tracking-widest">
                                        <span>1</span>
                                        <span>12</span>
                                    </div>
                                </div>

                                {/* Measurement Unit */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-sans">Measurement Standard</label>
                                    <div className="flex border border-[var(--border-ink)]">
                                        <button
                                            type="button"
                                            onClick={() => setPreferences({ ...preferences, measurement_unit: 'metric' })}
                                            className={`flex-1 py-2 font-sans uppercase tracking-widest text-[10px] font-bold transition-all ${preferences.measurement_unit === 'metric'
                                                ? 'bg-[#9b2226] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            Metric
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreferences({ ...preferences, measurement_unit: 'imperial' })}
                                            className={`flex-1 py-2 font-sans uppercase tracking-widest text-[10px] font-bold border-l border-[var(--border-ink)] transition-all ${preferences.measurement_unit === 'imperial'
                                                ? 'bg-[#9b2226] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            Imperial
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="cookbook-button uppercase tracking-widest text-[10px] font-bold font-sans flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Recording...' : 'Update Preferences'}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Section */}
                    <div className="cookbook-card">
                        <div className="flex items-center gap-4 mb-8 border-b border-[var(--border-ink)] pb-4">
                            <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center bg-gray-50 text-[#9b2226]">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold italic text-gray-900 tracking-tight">Security Standards</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="cookbook-button uppercase tracking-widest text-[10px] font-bold font-sans flex items-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                {saving ? 'Updating...' : 'Update Security'}
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-2 border-[#9b2226] p-8 bg-white font-serif">
                        <div className="flex items-center gap-4 mb-6 text-[#9b2226]">
                            <div className="w-12 h-12 border border-[#9b2226] flex items-center justify-center bg-[#9b2226]/5">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold italic tracking-tight">Irreversible Actions</h2>
                        </div>

                        <p className="text-gray-700 italic mb-8 leading-relaxed max-w-2xl">
                            By proceeding with account deletion, all recorded recipes, planned culinary events, and inventory data will be permanently expunged from our records. This action cannot be reversed.
                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-2 border-2 border-[#9b2226] text-[#9b2226] hover:bg-[#9b2226] hover:text-white transition-all font-sans uppercase tracking-[0.2em] text-[10px] font-bold"
                        >
                            Delete Personal Record
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
