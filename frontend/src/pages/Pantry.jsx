import { useState, useEffect } from 'react';
import { Plus, Search, X, Calendar, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import usePantryStore from '../store/usePantryStore';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];

const Pantry = () => {
    const { items, loading, fetchItems, addItem, deleteItem, getExpiringItems } = usePantryStore();
    const [filteredItems, setFilteredItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expiringItems, setExpiringItems] = useState([]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        setExpiringItems(getExpiringItems());
    }, [items, getExpiringItems]);

    const filterItems = () => {
        let filtered = items;

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        setFilteredItems(filtered);
    };

    useEffect(() => {
        filterItems();
    }, [items, searchQuery, selectedCategory]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const result = await deleteItem(id);
        if (result.success) {
            toast.success('Item deleted');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--paper-bg)] font-serif">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="cookbook-header mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest italic">Pantry</h1>
                    <p className="text-gray-600 mt-2 font-serif italic text-lg tracking-tight">Manage your ingredients and track inventory</p>
                </div>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="cookbook-button flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Item
                    </button>
                </div>

                {/* Expiring Soon Alert */}
                {expiringItems.length > 0 && (
                    <div className="border-2 border-[#9b2226] p-6 mb-8 bg-white">
                        <div className="flex items-start gap-3 text-[#9b2226]">
                            <AlertCircle className="w-6 h-6 mt-0.5" />
                            <div>
                                <h3 className="font-bold uppercase tracking-widest text-lg">Inventory Warning</h3>
                                <p className="text-gray-800 italic mt-1">
                                    {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring within 7 days. Plan your meals accordingly!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="cookbook-card mb-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search ingredients..."
                                className="w-full pl-10 pr-4 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 font-sans uppercase tracking-widest text-[10px] font-bold">
                            <CategoryButton
                                label="All"
                                active={selectedCategory === 'All'}
                                onClick={() => setSelectedCategory('All')}
                            />
                            {CATEGORIES.map(category => (
                                <CategoryButton
                                    key={category}
                                    label={category}
                                    active={selectedCategory === category}
                                    onClick={() => setSelectedCategory(category)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-[#9b2226] border-t-transparent animate-spin"></div>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <PantryItemCard
                                key={item._id}
                                item={item}
                                onDelete={handleDelete}
                                isExpiring={expiringItems.some(exp => exp._id === item._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="cookbook-card py-20 text-center">
                        <p className="text-gray-500 italic text-xl">No ingredients found in your pantry.</p>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

const CategoryButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1 border border-[var(--border-ink)] transition-all whitespace-nowrap ${active
            ? 'bg-[#9b2226] text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
    >
        {label}
    </button>
);

const PantryItemCard = ({ item, onDelete, isExpiring }) => {
    const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();

    return (
        <div className={`cookbook-card group ${isExpiring ? 'border-[#9b2226] border-2 shadow-[4px_4px_0px_0px_#9b2226]' : ''}`}>
            <div className="flex items-start justify-between mb-4 border-b border-[var(--border-ink)] pb-2">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 italic tracking-tight">{item.name}</h3>
                    <p className="text-[10px] font-bold text-[#9b2226] uppercase tracking-widest font-sans">{item.category}</p>
                </div>
                <button
                    onClick={() => onDelete(item._id)}
                    className="text-gray-400 hover:text-[#9b2226] transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3 font-serif">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 italic">Quantity:</span>
                    <span className="font-bold text-gray-900 border-b border-gray-200">
                        {item.quantity} {item.unit}
                    </span>
                </div>

                {item.expiry_date && (
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 italic flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Status:
                        </span>
                        <span className={`font-bold ${isExpired ? 'text-[#9b2226] underline decoration-double' : isExpiring ? 'text-[#9b2226]' : 'text-gray-600'}`}>
                            {isExpired ? 'Expired' : 'Best by'}: {format(new Date(item.expiry_date), 'MMM dd')}
                        </span>
                    </div>
                )}

                {item.is_running_low && (
                    <div className="mt-4 pt-2 border-t border-dashed border-gray-200">
                        <span className="inline-block px-2 py-0.5 border border-[#9b2226] text-[#9b2226] text-[10px] font-bold uppercase tracking-widest font-sans">
                            Running Low
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddItemModal = ({ onClose, onSuccess }) => {
    const addItem = usePantryStore((state) => state.addItem);
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other',
        expiry_date: '',
        is_running_low: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const itemData = {
            ...formData,
            quantity: parseFloat(formData.quantity),
            expiry_date: formData.expiry_date || null
        };

        const result = await addItem(itemData);
        if (result.success) {
            toast.success('Item added to pantry');
            onSuccess();
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="cookbook-card max-w-md w-full bg-[var(--paper-bg)]">
                <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--border-ink)] pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest italic">New Ingredient</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Ingredient Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif appearance-none"
                            >
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="l">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="cups">Cups</option>
                                <option value="tbsp">Tablespoons</option>
                                <option value="tsp">Teaspoons</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif appearance-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Best Before Date</label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif"
                        />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            id="running-low"
                            checked={formData.is_running_low}
                            onChange={(e) => setFormData({ ...formData, is_running_low: e.target.checked })}
                            className="w-4 h-4 accent-[#9b2226] border-[var(--border-ink)]"
                        />
                        <label htmlFor="running-low" className="text-sm italic text-gray-700">
                            Mark as running low
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-[var(--border-ink)] text-gray-700 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all font-sans"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 cookbook-button uppercase tracking-widest text-[10px] font-bold disabled:opacity-50"
                        >
                            {loading ? 'Recording...' : 'Record Ingredient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Pantry;
