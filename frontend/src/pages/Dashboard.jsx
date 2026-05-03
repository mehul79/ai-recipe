import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChefHat, UtensilsCrossed, Calendar, Clock } from 'lucide-react';
import usePantryStore from '../store/usePantryStore';
import useRecipeStore from '../store/useRecipeStore';
import useMealPlanStore from '../store/useMealPlanStore';

const Dashboard = () => {
    const { items: pantryItems, fetchItems: fetchPantry, fetchPantryStats } = usePantryStore();
    const { recipes, fetchRecipes, fetchRecipeStats, fetchMostUsedIngredients, fetchPopularRecipes } = useRecipeStore();
    const { mealPlans, fetchMealPlans } = useMealPlanStore();

    const [recipeStats, setRecipeStats] = useState([]);
    const [topIngredients, setTopIngredients] = useState([]);
    const [pantryStats, setPantryStats] = useState([]);
    const [popularRecipes, setPopularRecipes] = useState([]);

    useEffect(() => {
        fetchPantry();
        fetchRecipes();
        fetchMealPlans();

        const loadAnalytics = async () => {
            const [rStats, iStats, pStats, popStats] = await Promise.all([
                fetchRecipeStats(),
                fetchMostUsedIngredients(),
                fetchPantryStats(),
                fetchPopularRecipes()
            ]);
            setRecipeStats(rStats);
            setTopIngredients(iStats);
            setPantryStats(pStats);
            setPopularRecipes(popStats);
        };
        loadAnalytics();
    }, [fetchPantry, fetchRecipes, fetchMealPlans, fetchRecipeStats, fetchMostUsedIngredients, fetchPantryStats, fetchPopularRecipes]);

    const stats = {
        totalRecipes: recipes.length,
        pantryItems: pantryItems.length,
        mealsPlanned: mealPlans.length
    };

    const recentRecipes = recipes.slice(0, 5);
    const upcomingMeals = mealPlans.slice(0, 5);

    return (
        <div className="min-h-screen bg-[var(--paper-bg)]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="cookbook-header mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest italic">Dashboard</h1>
                    <p className="text-gray-600 mt-2 font-serif italic text-lg tracking-tight">Welcome back! Here's your cooking overview</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<ChefHat className="w-6 h-6" />}
                        label="Total Recipes"
                        value={stats.totalRecipes}
                    />
                    <StatCard
                        icon={<UtensilsCrossed className="w-6 h-6" />}
                        label="Pantry Items"
                        value={stats.pantryItems}
                    />
                    <StatCard
                        icon={<Calendar className="w-6 h-6" />}
                        label="Meals Planned"
                        value={stats.mealsPlanned}
                    />
                </div>

                {/* Kitchen Analytics Section */}
                <div className="mb-8">
                    <div className="cookbook-card">
                        <h2 className="text-2xl font-bold uppercase tracking-widest italic mb-8 border-b-2 border-double border-[var(--border-ink)] pb-4 text-center">Kitchen Analytics</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Cuisine Popularity */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9b2226] border-b border-gray-100 pb-2">Cuisine Popularity</h3>
                                <div className="space-y-2">
                                    {recipeStats.length > 0 ? recipeStats.map((stat, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="font-serif italic text-gray-700">{stat._id || 'General'}</span>
                                            <span className="font-bold border-b border-dotted border-gray-300 flex-1 mx-2"></span>
                                            <span className="font-bold">{stat.count} recipes</span>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-gray-400 italic">Insufficient data</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Ingredients */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9b2226] border-b border-gray-100 pb-2">Top Ingredients</h3>
                                <div className="flex flex-wrap gap-2">
                                    {topIngredients.length > 0 ? topIngredients.map((ing, idx) => (
                                        <span key={idx} className="px-2 py-1 border border-[var(--border-ink)] text-[10px] font-bold uppercase tracking-tight bg-white shadow-sm">
                                            {ing._id} <span className="text-[#9b2226] ml-1">({ing.count})</span>
                                        </span>
                                    )) : (
                                        <p className="text-xs text-gray-400 italic">Insufficient data</p>
                                    )}
                                </div>
                            </div>

                            {/* Pantry Breakdown */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9b2226] border-b border-gray-100 pb-2">Pantry Breakdown</h3>
                                <div className="space-y-2">
                                    {pantryStats.length > 0 ? pantryStats.map((stat, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="font-serif italic text-gray-700">{stat._id}</span>
                                            <div className="flex-1 mx-2 h-1.5 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[#9b2226]" 
                                                    style={{ width: `${Math.min(100, (stat.totalItems / pantryItems.length) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-bold">{stat.totalItems} items</span>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-gray-400 italic">Insufficient data</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Behavioral Analytics */}
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9b2226] mb-4 text-center">Your Most Interacted Masterpieces</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {popularRecipes.length > 0 ? popularRecipes.map((pop, idx) => (
                                    <Link 
                                        key={idx} 
                                        to={`/recipes/${pop._id}`}
                                        className="p-3 border border-dashed border-gray-200 bg-white hover:border-[#9b2226] transition-all group text-center"
                                    >
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{pop.cuisine || 'Classic'}</p>
                                        <h4 className="font-bold text-xs truncate group-hover:text-[#9b2226]">{pop.name}</h4>
                                        <p className="text-[9px] italic text-gray-500 mt-2">{pop.viewCount} views</p>
                                    </Link>
                                )) : (
                                    <div className="col-span-5 text-center py-4 text-xs text-gray-400 italic">Browse your recipes to see popularity trends here</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link
                        to="/generate"
                        className="cookbook-card hover:bg-gray-50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center group-hover:bg-[#9b2226] group-hover:text-white transition-all">
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl uppercase tracking-tight">Generate Recipe</h3>
                                <p className="text-[#9b2226] font-serif italic">Create AI-powered recipes</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/pantry"
                        className="cookbook-card hover:bg-gray-50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center group-hover:bg-[#9b2226] group-hover:text-white transition-all">
                                <UtensilsCrossed className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl uppercase tracking-tight text-gray-900">Manage Pantry</h3>
                                <p className="text-gray-600 font-serif italic">Add and track ingredients</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Recipes & Upcoming Meals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Recipes */}
                    <div className="cookbook-card">
                        <div className="flex items-center justify-between mb-6 border-b border-[var(--border-ink)] pb-2">
                            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900">Recent Recipes</h2>
                            <Link to="/recipes" className="text-sm text-[#9b2226] hover:underline font-bold uppercase tracking-widest">
                                View all
                            </Link>
                        </div>

                        {recentRecipes.length > 0 ? (
                            <div className="space-y-4">
                                {recentRecipes.map((recipe) => (
                                    <Link
                                        key={recipe._id}
                                        to={`/recipes/${recipe._id}`}
                                        className="flex items-center gap-4 p-2 border border-transparent hover:border-[var(--border-ink)] hover:bg-gray-50 transition-all"
                                    >
                                        <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center bg-gray-50">
                                            <ChefHat className="w-6 h-6 text-[#9b2226]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-gray-900 truncate">{recipe.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 font-serif italic">
                                                <Clock className="w-3 h-3" />
                                                {recipe.cook_time} mins
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8 font-serif italic">No recipes yet. Generate your first one!</p>
                        )}
                    </div>

                    {/* Upcoming Meals */}
                    <div className="cookbook-card">
                        <div className="flex items-center justify-between mb-6 border-b border-[var(--border-ink)] pb-2">
                            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900">Upcoming Meals</h2>
                            <Link to="/meal-plan" className="text-sm text-[#9b2226] hover:underline font-bold uppercase tracking-widest">
                                View calendar
                            </Link>
                        </div>

                        {upcomingMeals.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingMeals.map((meal) => (
                                    <div
                                        key={meal._id}
                                        className="flex items-center gap-4 p-2 border border-[var(--border-ink)] bg-gray-50"
                                    >
                                        <div className="w-12 h-12 border border-[var(--border-ink)] flex items-center justify-center bg-white">
                                            <Calendar className="w-6 h-6 text-gray-700" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-gray-900 truncate">
                                                {meal.recipe_id?.name || 'Unknown Recipe'}
                                            </h3>
                                            <p className="text-sm text-gray-500 capitalize font-serif italic">{meal.meal_type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8 font-serif italic">No meals planned yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => {
    return (
        <div className="cookbook-card flex flex-col items-center text-center">
            <div className="w-14 h-14 border border-[var(--border-ink)] flex items-center justify-center mb-4 bg-gray-50 text-[#9b2226]">
                {icon}
            </div>
            <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">{label}</p>
                <p className="text-4xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export default Dashboard;
