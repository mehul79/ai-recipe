import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChefHat, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import useRecipeStore from '../store/useRecipeStore';

const MyRecipes = () => {
    const { recipes, loading, fetchRecipes, deleteRecipe } = useRecipeStore();
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    const cuisines = ['All', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
    const difficulties = ['All', 'easy', 'medium', 'hard'];

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const filterRecipes = () => {
        let filtered = recipes;

        if (searchQuery) {
            filtered = filtered.filter(recipe =>
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCuisine !== 'All') {
            filtered = filtered.filter(recipe => recipe.cuisine_type === selectedCuisine);
        }

        if (selectedDifficulty !== 'All') {
            filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
        }

        setFilteredRecipes(filtered);
    };

    useEffect(() => {
        filterRecipes();
    }, [recipes, searchQuery, selectedCuisine, selectedDifficulty]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        const result = await deleteRecipe(id);
        if (result.success) {
            toast.success('Recipe deleted');
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
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest italic">Recipe Library</h1>
                    <p className="text-gray-600 mt-2 font-serif italic text-lg tracking-tight">Your curated collection of culinary inspirations</p>
                </div>

                {/* Search and Filters */}
                <div className="cookbook-card mb-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search your collection..."
                                className="w-full pl-10 pr-4 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white"
                            />
                        </div>

                        {/* Cuisine Filter */}
                        <select
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                            className="px-4 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white appearance-none min-w-[160px]"
                        >
                            {cuisines.map(cuisine => (
                                <option key={cuisine} value={cuisine}>
                                    {cuisine === 'All' ? 'All Cuisines' : cuisine}
                                </option>
                            ))}
                        </select>

                        {/* Difficulty Filter */}
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-4 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white appearance-none min-w-[160px]"
                        >
                            {difficulties.map(diff => (
                                <option key={diff} value={diff}>
                                    {diff === 'All' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Recipe Count */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex-1 border-t border-[var(--border-ink)] border-double h-1"></div>
                    <p className="text-[10px] font-bold text-[#9b2226] uppercase tracking-widest font-sans px-4">
                        Indexing {filteredRecipes.length} of {recipes.length} entries
                    </p>
                    <div className="flex-1 border-t border-[var(--border-ink)] border-double h-1"></div>
                </div>

                {/* Recipes Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-2 border-[#9b2226] border-t-transparent animate-spin"></div>
                    </div>
                ) : filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe._id}
                                recipe={recipe}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="cookbook-card py-24 text-center border-dashed border-2">
                        <ChefHat className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <p className="text-xl text-gray-400 italic mb-8">
                            {recipes.length === 0 ? 'Your library is currently empty.' : 'No entries found matching your criteria.'}
                        </p>
                        {recipes.length === 0 && (
                            <Link
                                to="/generate"
                                className="cookbook-button uppercase tracking-widest text-[10px] font-bold font-sans"
                            >
                                Create Your First Entry
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const RecipeCard = ({ recipe, onDelete }) => {
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

    return (
        <div className="cookbook-card group p-0 overflow-hidden flex flex-col h-full border-2 transition-all hover:shadow-[6px_6px_0px_0px_rgba(45,42,46,0.1)]">
            {/* Sketchy Placeholder */}
            <div className="h-48 bg-gray-50 border-b-2 border-[var(--border-ink)] flex items-center justify-center relative overflow-hidden">
                <ChefHat className="w-16 h-16 text-gray-200" />
                <div className="absolute inset-0 border-[20px] border-white/40 pointer-events-none"></div>
                <div className="absolute top-4 left-4 text-[10px] font-bold font-sans uppercase tracking-[0.2em] text-gray-300">Vol. I</div>
            </div>

            {/* Recipe Content */}
            <div className="p-6 flex flex-col flex-1">
                <Link to={`/recipes/${recipe._id}`} className="block mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight italic group-hover:text-[#9b2226] transition-colors line-clamp-2">
                        {recipe.name}
                    </h3>
                    {recipe.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic leading-relaxed">{recipe.description}</p>
                    )}
                </Link>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6 font-sans uppercase tracking-widest text-[9px] font-bold">
                    {recipe.cuisine_type && (
                        <span className="px-2 py-0.5 border border-[#9b2226] text-[#9b2226]">
                            {recipe.cuisine_type}
                        </span>
                    )}
                    {recipe.difficulty && (
                        <span className={`px-2 py-0.5 border ${recipe.difficulty === 'easy' ? 'border-green-800 text-green-800' :
                            recipe.difficulty === 'medium' ? 'border-amber-800 text-amber-800' :
                                'border-red-800 text-red-800'
                            }`}>
                            {recipe.difficulty}
                        </span>
                    )}
                    {recipe.dietary_tags && recipe.dietary_tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 border border-gray-300 text-gray-500">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Meta Info */}
                <div className="mt-auto pt-4 border-t border-[var(--border-ink)] border-dashed flex items-center justify-between text-[10px] font-bold font-sans uppercase tracking-widest text-gray-500">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{totalTime} minutes</span>
                    </div>
                    {recipe.nutrition?.calories && (
                        <span className="border-l border-gray-300 pl-4">{recipe.nutrition.calories} kcal</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                    <Link
                        to={`/recipes/${recipe._id}`}
                        className="flex-1 cookbook-button text-center uppercase tracking-widest text-[10px] font-bold font-sans"
                    >
                        Read More
                    </Link>
                    <button
                        onClick={() => onDelete(recipe._id)}
                        className="p-2 border border-transparent hover:border-[#9b2226] text-gray-300 hover:text-[#9b2226] transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyRecipes;
