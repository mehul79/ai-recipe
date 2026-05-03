import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, ChefHat } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays } from 'date-fns';
import useMealPlanStore from '../store/useMealPlanStore';
import useRecipeStore from '../store/useRecipeStore';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MealPlanner = () => {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const { mealPlans, loading, fetchMealPlans, addMealPlan, deleteMealPlan } = useMealPlanStore();
    const { recipes, fetchRecipes } = useRecipeStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        const startDate = format(weekStart, 'yyyy-MM-dd');
        const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');
        fetchMealPlans(startDate, endDate);
        fetchRecipes();
    }, [weekStart, fetchMealPlans, fetchRecipes]);

    const organizedPlan = {};
    mealPlans.forEach(meal => {
        const dateKey = format(new Date(meal.meal_date), 'yyyy-MM-dd');
        if (!organizedPlan[dateKey]) {
            organizedPlan[dateKey] = {};
        }
        organizedPlan[dateKey][meal.meal_type] = meal;
    });

    const handleAddMeal = (date, mealType) => {
        setSelectedSlot({ date, mealType });
        setShowAddModal(true);
    };

    const handleRemoveMeal = async (mealId) => {
        if (!confirm('Remove this meal from your plan?')) return;

        const result = await deleteMealPlan(mealId);
        if (result.success) {
            toast.success('Meal removed');
        } else {
            toast.error(result.message);
        }
    };

    const getDayMeals = (dayIndex) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return organizedPlan[date] || {};
    };

    return (
        <div className="min-h-screen bg-[var(--paper-bg)] font-serif">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="cookbook-header mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest italic">Meal Planner</h1>
                    <p className="text-gray-600 mt-2 font-serif italic text-lg tracking-tight">Curate your weekly culinary journey</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    {/* Week Navigation */}
                    <div className="flex items-center gap-3 font-sans uppercase tracking-widest text-[10px] font-bold">
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, -7))}
                            className="px-4 py-2 border border-[var(--border-ink)] text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Previous Week
                        </button>
                        <button
                            onClick={() => setWeekStart(startOfWeek(new Date()))}
                            className="px-4 py-2 bg-[#9b2226] text-white border border-[#9b2226] hover:bg-[#7a1a1d] transition-all"
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, 7))}
                            className="px-4 py-2 border border-[var(--border-ink)] text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Next Week
                        </button>
                    </div>

                    {/* Week Display */}
                    <div className="text-center px-8 py-2 border-l-2 border-r-2 border-[var(--border-ink)]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-sans font-bold mb-1">Schedule for</p>
                        <p className="text-xl font-bold text-gray-900 italic">
                            {format(weekStart, 'MMMM d')} — {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="cookbook-card p-0 overflow-hidden border-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-8 border-b-2 border-[var(--border-ink)] bg-gray-50/50">
                        <div className="p-4 font-bold text-gray-900 uppercase tracking-widest text-xs border-r border-[var(--border-ink)] flex items-center justify-center italic bg-white">
                            Meal
                        </div>
                        {DAYS_OF_WEEK.map((day, index) => (
                            <div key={day} className="p-4 text-center border-r border-[var(--border-ink)] last:border-r-0">
                                <div className="font-bold text-gray-900 uppercase tracking-tight text-sm">{day}</div>
                                <div className="text-[10px] text-[#9b2226] font-bold font-sans uppercase tracking-widest">
                                    {format(addDays(weekStart, index), 'MMM d')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Meal Rows */}
                    {MEAL_TYPES.map(mealType => (
                        <div key={mealType} className="grid grid-cols-8 border-b border-[var(--border-ink)] last:border-b-0">
                            <div className="p-4 font-bold text-gray-900 uppercase tracking-tighter text-xs border-r border-[var(--border-ink)] bg-gray-50/30 flex items-center italic">
                                {mealType}
                            </div>
                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                const dayMeals = getDayMeals(dayIndex);
                                const meal = dayMeals[mealType];

                                return (
                                    <div
                                        key={dayIndex}
                                        className="p-3 border-r border-[var(--border-ink)] last:border-r-0 min-h-[120px] hover:bg-gray-50/50 transition-colors relative"
                                    >
                                        {meal ? (
                                            <div className="h-full border border-dashed border-[#9b2226] p-3 bg-white group shadow-[2px_2px_0px_0px_rgba(155,34,38,0.1)]">
                                                <p className="text-sm font-bold text-gray-900 leading-tight italic line-clamp-3">
                                                    {meal.recipe_id?.name || 'Unknown Recipe'}
                                                </p>
                                                <button
                                                    onClick={() => handleRemoveMeal(meal._id)}
                                                    className="absolute top-1 right-1 p-1 text-gray-300 hover:text-[#9b2226] opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddMeal(date, mealType)}
                                                className="w-full h-full flex items-center justify-center text-gray-300 hover:text-[#9b2226] transition-colors group"
                                            >
                                                <Plus className="w-6 h-6 opacity-20 group-hover:opacity-100" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    <div className="cookbook-card flex items-center gap-4">
                        <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center bg-gray-50 text-[#9b2226]">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Meals Planned</p>
                            <p className="text-2xl font-bold text-gray-900">{mealPlans.length}</p>
                        </div>
                    </div>
                    <div className="cookbook-card flex items-center gap-4">
                        <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center bg-gray-50 text-[#9b2226]">
                            <ChefHat className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Library Size</p>
                            <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                        </div>
                    </div>
                    <div className="cookbook-card bg-[#9b2226] text-white">
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Active Period</p>
                        <p className="text-lg font-bold">
                            {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Meal Modal */}
            {showAddModal && selectedSlot && (
                <AddMealModal
                    date={selectedSlot.date}
                    mealType={selectedSlot.mealType}
                    recipes={recipes}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                    onSuccess={() => {
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
};

const AddMealModal = ({ date, mealType, recipes, onClose, onSuccess }) => {
    const addMealPlan = useMealPlanStore((state) => state.addMealPlan);
    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRecipe) {
            toast.error('Please select a recipe');
            return;
        }

        setLoading(true);
        const result = await addMealPlan({
            recipe_id: selectedRecipe,
            meal_date: date,
            meal_type: mealType
        });

        if (result.success) {
            toast.success('Meal added to plan');
            onSuccess();
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="cookbook-card max-w-md w-full bg-[var(--paper-bg)] font-serif">
                <div className="flex items-center justify-between mb-6 border-b-2 border-[var(--border-ink)] pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest italic leading-tight">Schedule Meal</h2>
                        <p className="text-xs font-bold text-[#9b2226] uppercase tracking-widest font-sans mt-1">
                            {format(new Date(date), 'EEEE, MMM d')} • {mealType}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your library..."
                            className="w-full px-3 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif"
                        />
                    </div>

                    {/* Recipe List */}
                    <div className="max-h-64 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.map(recipe => (
                                <label
                                    key={recipe._id}
                                    className={`flex items-center gap-4 p-4 border transition-all cursor-pointer ${selectedRecipe === recipe._id
                                        ? 'border-[#9b2226] bg-white shadow-[3px_3px_0px_0px_#9b2226]'
                                        : 'border-[var(--border-ink)] bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="recipe"
                                        value={recipe._id}
                                        checked={selectedRecipe === recipe._id}
                                        onChange={(e) => setSelectedRecipe(e.target.value)}
                                        className="w-4 h-4 accent-[#9b2226]"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 italic leading-tight">{recipe.name}</p>
                                        {recipe.cuisine_type && (
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans mt-1">{recipe.cuisine_type}</p>
                                        )}
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed border-[var(--border-ink)]">
                                <ChefHat className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 italic">No matching recipes found.</p>
                            </div>
                        )}
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
                            disabled={loading || !selectedRecipe}
                            className="flex-1 cookbook-button uppercase tracking-widest text-[10px] font-bold disabled:opacity-50"
                        >
                            {loading ? 'Recording...' : 'Record Meal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealPlanner;
