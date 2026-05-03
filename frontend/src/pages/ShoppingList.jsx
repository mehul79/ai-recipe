import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, X, Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import useShoppingStore from '../store/useShoppingStore';

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Grains', 'Spices', 'Beverages', 'Other'];

const ShoppingList = () => {
    const { items, loading, fetchItems, addItem, updateItem, deleteItem, syncPantry } = useShoppingStore();
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const groupedItems = useMemo(() => {
        const grouped = {};
        items.forEach(item => {
            const category = item.category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        return grouped;
    }, [items]);

    const handleToggleChecked = async (id, currentStatus) => {
        const result = await updateItem(id, { is_checked: !currentStatus });
        if (!result.success) {
            toast.error(result.message);
        }
    };

    const handleDeleteItem = async (id) => {
        const result = await deleteItem(id);
        if (result.success) {
            toast.success('Item removed');
        } else {
            toast.error(result.message);
        }
    };

    const handleSyncPantry = async () => {
        const checkedCount = items.filter(item => item.is_checked).length;
        if (checkedCount === 0) {
            toast.error('No items checked');
            return;
        }

        if (!confirm(`Add ${checkedCount} checked items to pantry?`)) return;

        const result = await syncPantry();
        if (result.success) {
            toast.success('Items added to pantry');
        } else {
            toast.error(result.message);
        }
    };

    const checkedCount = items.filter(item => item.is_checked).length;
    const totalCount = items.length;

    return (
        <div className="min-h-screen bg-[var(--paper-bg)] font-serif">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="cookbook-header mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest italic">Provisions List</h1>
                    <p className="text-gray-600 mt-2 font-serif italic text-lg tracking-tight">
                        {totalCount > 0 ? `${checkedCount} of ${totalCount} items gathered` : 'Your provisions list is empty'}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="cookbook-button flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold font-sans"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Entry
                    </button>
                    
                    {checkedCount > 0 && (
                        <button
                            onClick={handleSyncPantry}
                            className="px-4 py-2 bg-[#9b2226] text-white border border-[#9b2226] flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold font-sans hover:bg-[#7a1a1d] transition-all shadow-[2px_2px_0px_0px_var(--border-ink)]"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Transfer to Pantry ({checkedCount})
                        </button>
                    )}
                </div>

                {/* Shopping List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-[#9b2226] border-t-transparent animate-spin"></div>
                    </div>
                ) : totalCount > 0 ? (
                    <div className="space-y-12">
                        {Object.entries(groupedItems).map(([category, categoryItems]) => (
                            <div key={category} className="relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <h2 className="text-xl font-bold italic text-gray-900 border-b-2 border-[var(--border-ink)] pr-8">{category}</h2>
                                    <div className="flex-1 border-b border-dashed border-gray-300"></div>
                                </div>
                                <div className="space-y-1">
                                    {categoryItems.map(item => (
                                        <ShoppingListItem
                                            key={item._id}
                                            item={item}
                                            onToggle={() => handleToggleChecked(item._id, item.is_checked)}
                                            onDelete={() => handleDeleteItem(item._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="cookbook-card py-20 text-center border-dashed border-2">
                        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <p className="text-xl text-gray-400 italic mb-8">Your list is currently empty.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="cookbook-button uppercase tracking-widest text-[10px] font-bold font-sans"
                        >
                            <Plus className="w-4 h-4 mr-2 inline" />
                            Begin Your List
                        </button>
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

const ShoppingListItem = ({ item, onToggle, onDelete }) => {
    return (
        <div className="flex items-center gap-4 group py-2 hover:bg-white/50 transition-colors">
            <button
                onClick={onToggle}
                className="shrink-0"
            >
                <div className={`w-5 h-5 border border-[var(--border-ink)] flex items-center justify-center transition-all ${item.is_checked
                    ? 'bg-[#9b2226] border-[#9b2226]'
                    : 'bg-white hover:border-[#9b2226]'
                    }`}>
                    {item.is_checked && <Check className="w-3 h-3 text-white" />}
                </div>
            </button>

            <div className="flex-1 min-w-0 flex items-baseline gap-2">
                <p className={`text-lg transition-all ${item.is_checked ? 'line-through text-gray-300 italic' : 'text-gray-900'}`}>
                    {item.ingredient_name}
                </p>
                <div className="flex-1 border-b border-dotted border-gray-200 min-w-[20px]"></div>
                <p className={`text-sm font-bold font-sans uppercase tracking-tight ${item.is_checked ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.quantity} {item.unit}
                </p>
                {item.from_meal_plan && !item.is_checked && (
                    <span className="text-[8px] font-bold text-[#9b2226] border border-[#9b2226] px-1 uppercase tracking-tighter">Plan</span>
                )}
            </div>

            <button
                onClick={onDelete}
                className="shrink-0 p-1 text-gray-300 hover:text-[#9b2226] transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const AddItemModal = ({ onClose, onSuccess }) => {
    const addItem = useShoppingStore((state) => state.addItem);
    const [formData, setFormData] = useState({
        ingredient_name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const newItem = {
            ingredient_name: formData.ingredient_name,
            quantity: parseFloat(formData.quantity),
            unit: formData.unit,
            category: formData.category
        };

        const result = await addItem(newItem);
        if (result.success) {
            toast.success('Item added to shopping list');
            onSuccess();
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="cookbook-card max-w-md w-full bg-[var(--paper-bg)] font-serif">
                <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--border-ink)] pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest italic">New Entry</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Item Name</label>
                        <input
                            type="text"
                            value={formData.ingredient_name}
                            onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
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
                            {loading ? 'Recording...' : 'Record Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShoppingList;
