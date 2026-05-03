import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, ArrowLeft, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import useRecipeStore from '../store/useRecipeStore';
import api from '../services/api';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRecipeById, deleteRecipe, getSubstitutions } = useRecipeStore();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [substitutions, setSubstitutions] = useState({});
    const [conflicts, setConflicts] = useState([]);
    const [activeSubstitution, setActiveSubstitution] = useState(null);

    useEffect(() => {
        const loadRecipe = async () => {
            setLoading(true);
            const response = await api.get(`/recipes/${id}`);
            if (response.data.success) {
                const recipeData = response.data.data;
                setRecipe(recipeData);
                setServings(recipeData.servings || 4);
                setConflicts(response.data.conflicts || []);
                setSubstitutions(response.data.substitutions || {});
            } else {
                toast.error('Recipe not found');
                navigate('/recipes');
            }
            setLoading(false);
        };
        loadRecipe();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        const result = await deleteRecipe(id);
        if (result.success) {
            toast.success('Recipe deleted');
            navigate('/recipes');
        } else {
            toast.error(result.message);
        }
    };

    const toggleIngredient = (index) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    const adjustQuantity = (originalQty, originalServings) => {
        return ((originalQty * servings) / originalServings).toFixed(2);
    };

    const handleSwapIngredient = (originalName, newName) => {
        const updatedIngredients = recipe.ingredients.map(ing => {
            if (ing.name.toLowerCase() === originalName.toLowerCase()) {
                return { ...ing, name: newName };
            }
            return ing;
        });

        setRecipe({
            ...recipe,
            ingredients: updatedIngredients
        });

        // Also update conflicts locally
        setConflicts(conflicts.filter(c => c.ingredient.toLowerCase() !== originalName.toLowerCase()));
        
        setActiveSubstitution(null);
        toast.success(`Swapped ${originalName} with ${newName}`);
    };

    if (!recipe) {
        return null;
    }

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;

    return (
        <div className="min-h-screen bg-[var(--paper-bg)] font-serif">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    to="/recipes"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-sans uppercase tracking-widest text-xs font-bold"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Recipes
                </Link>

                {/* Recipe Header */}
                <div className="cookbook-header mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 italic leading-tight">{recipe.name}</h1>
                            {recipe.description && (
                                <p className="text-gray-600 text-lg italic max-w-2xl mx-auto">{recipe.description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-[#9b2226] border border-transparent hover:border-[var(--border-ink)] transition-colors self-start"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap justify-center gap-8 text-gray-600 mt-6 border-t border-[var(--border-ink)] pt-4 font-sans uppercase tracking-widest text-xs font-bold">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{totalTime} minutes</span>
                        </div>
                        {recipe.prep_time && (
                            <div>Prep: {recipe.prep_time} min</div>
                        )}
                        {recipe.cook_time && (
                            <div>Cook: {recipe.cook_time} min</div>
                        )}
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Serves {servings}</span>
                        </div>
                    </div>
                </div>

                {/* Tags - Cookbook Style */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 font-sans uppercase tracking-widest text-[10px] font-bold">
                    {recipe.recipe_type && (
                        <span className="px-3 py-1 border border-[var(--border-ink)] text-gray-700">
                            {recipe.recipe_type}
                        </span>
                    )}
                    {recipe.cuisine_type && (
                        <span className="px-3 py-1 border border-[#9b2226] text-[#9b2226]">
                            {recipe.cuisine_type}
                        </span>
                    )}
                    {recipe.difficulty && (
                        <span className={`px-3 py-1 border ${recipe.difficulty === 'easy' ? 'border-green-700 text-green-700' :
                            recipe.difficulty === 'medium' ? 'border-amber-700 text-amber-700' :
                                'border-red-700 text-red-700'
                            }`}>
                            {recipe.difficulty}
                        </span>
                    )}
                    {recipe.dietary_tags && recipe.dietary_tags.map(tag => (
                        <span key={tag} className="px-3 py-1 border border-gray-400 text-gray-600">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Allergy Conflict Warning */}
                {conflicts.length > 0 && (
                    <div className="border-2 border-[#9b2226] p-6 mb-8 bg-white">
                        <div className="flex items-center gap-3 text-[#9b2226] font-bold mb-4 uppercase tracking-widest">
                            <AlertTriangle className="w-6 h-6" />
                            <h2 className="text-lg underline decoration-double">Dietary Conflicts</h2>
                        </div>
                        <ul className="text-gray-800 space-y-3 font-serif italic">
                            {conflicts.map((conflict, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="mt-1 font-bold text-[#9b2226]">!</span>
                                    <span>
                                        This recipe contains <strong className="border-b border-[#9b2226]">{conflict.ingredient}</strong>, which conflicts with your <strong className="border-b border-[#9b2226]">{conflict.reason}</strong> setting.
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="cookbook-card grid grid-cols-1 lg:grid-cols-3 gap-0 p-0 overflow-hidden">
                    {/* Ingredients Section */}
                    <div className="lg:col-span-1 p-8 border-b lg:border-b-0 lg:border-r border-[var(--border-ink)] bg-white">
                        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-ink)] pb-2">
                            <h2 className="text-2xl font-bold uppercase tracking-tighter italic">Ingredients</h2>
                        </div>

                        {/* Servings Adjuster */}
                        <div className="mb-8 font-sans">
                            <div className="flex items-center justify-between p-2 border border-gray-200">
                                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Adjust Yield</span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                        className="text-lg font-bold hover:text-[#9b2226]"
                                    >
                                        −
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">
                                        {servings}
                                    </span>
                                    <button
                                        onClick={() => setServings(servings + 1)}
                                        className="text-lg font-bold hover:text-[#9b2226]"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients List */}
                        <div className="space-y-1">
                            {recipe.ingredients && recipe.ingredients.map((ingredient, index) => {
                                const adjustedQty = adjustQuantity(ingredient.quantity, originalServings);
                                const isChecked = checkedIngredients.has(index);
                                const hasSubs = substitutions[ingredient.name.toLowerCase()];
                                const hasConflict = conflicts.some(c => c.ingredient.toLowerCase() === ingredient.name.toLowerCase());

                                return (
                                    <div key={index} className="flex flex-col gap-1">
                                        <div className="flex items-start justify-between group border-b border-gray-50 pb-1">
                                            <label className="flex items-start gap-4 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleIngredient(index)}
                                                    className="mt-1 w-4 h-4 accent-[#9b2226] border-[var(--border-ink)]"
                                                />
                                                <span className={`flex-1 text-lg leading-snug ${isChecked ? 'line-through text-gray-300 italic' : 'text-gray-800'}`}>
                                                    <span className="font-bold">{adjustedQty}</span> {ingredient.unit} {ingredient.name}
                                                    {hasConflict && !isChecked && (
                                                        <span className="ml-2 inline-flex text-[9px] border border-[#9b2226] text-[#9b2226] px-1 font-bold uppercase">
                                                            !
                                                        </span>
                                                    )}
                                                </span>
                                            </label>
                                            
                                            {hasSubs && !isChecked && (
                                                <button
                                                    onClick={() => setActiveSubstitution(activeSubstitution === ingredient.name ? null : ingredient.name)}
                                                    className={`p-1 transition-colors ${activeSubstitution === ingredient.name 
                                                        ? 'text-[#9b2226]' 
                                                        : 'text-gray-400 hover:text-gray-900'}`}
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Substitution Panel */}
                                        {activeSubstitution === ingredient.name && (
                                            <div className="ml-8 p-3 border border-dashed border-[var(--border-ink)] bg-gray-50 space-y-2">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suggested Alternatives:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {substitutions[ingredient.name.toLowerCase()].map(sub => (
                                                        <button
                                                            key={sub}
                                                            onClick={() => handleSwapIngredient(ingredient.name, sub)}
                                                            className="px-2 py-1 bg-white border border-[var(--border-ink)] text-[10px] font-bold uppercase tracking-tight hover:bg-[#9b2226] hover:text-white transition-all shadow-sm"
                                                        >
                                                            {sub}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="lg:col-span-2 p-8 bg-white">
                        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-ink)] pb-2">
                            <h2 className="text-2xl font-bold uppercase tracking-tighter italic">Instructions</h2>
                        </div>
                        <ol className="space-y-8">
                            {recipe.instructions && recipe.instructions.map((step, index) => (
                                <li key={index} className="flex gap-6 group">
                                    <span className="shrink-0 w-10 h-10 border-2 border-[var(--border-ink)] text-gray-900 flex items-center justify-center text-xl font-bold italic group-hover:bg-[#9b2226] group-hover:text-white group-hover:border-[#9b2226] transition-all">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-800 text-lg leading-relaxed pt-1 flex-1 border-b border-gray-50 pb-4 group-last:border-0">{step}</p>
                                </li>
                            ))}
                        </ol>

                        {/* Nutrition Info */}
                        {recipe.nutrition && (
                            <div className="mt-12 pt-8 border-t-2 border-double border-[var(--border-ink)]">
                                <h2 className="text-xl font-bold uppercase tracking-widest mb-6 text-center italic">Nutritional Analysis</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal" />
                                    <NutritionCard label="Protein" value={recipe.nutrition.protein} unit="g" />
                                    <NutritionCard label="Carbs" value={recipe.nutrition.carbs} unit="g" />
                                    <NutritionCard label="Fats" value={recipe.nutrition.fats} unit="g" />
                                    <NutritionCard label="Fiber" value={recipe.nutrition.fiber} unit="g" />
                                </div>
                                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-sans">Values calculated per serving</p>
                            </div>
                        )}

                        {/* User Notes */}
                        {recipe.user_notes && (
                            <div className="mt-8 p-6 border border-[var(--border-ink)] bg-gray-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#9b2226] opacity-20"></div>
                                <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#9b2226]"></span>
                                    Chef's Notes
                                </h3>
                                <p className="text-gray-700 italic leading-relaxed">{recipe.user_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionCard = ({ label, value, unit }) => (
    <div className="text-center p-2 border border-gray-100">
        <div className="text-lg font-bold text-gray-900 border-b border-gray-100 mb-1 pb-1">{value}<span className="text-[10px] ml-0.5">{unit}</span></div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-sans">{label}</div>
    </div>
);

export default RecipeDetail;
