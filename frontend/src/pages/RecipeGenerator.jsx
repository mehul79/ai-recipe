import { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Plus, X, Clock, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import useRecipeStore from '../store/useRecipeStore';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const COOKING_TIMES = [
    { value: 'quick', label: 'Quick (<30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Long (>60 min)' }
];
const RECIPE_TYPES = ['complete meal', 'snack', 'dessert', 'savory', 'shake'];

const RecipeGenerator = () => {
    const { generateRecipe, generating, generatedRecipe, saveRecipe, clearGeneratedRecipe, updateGeneratedRecipe } = useRecipeStore();
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [usePantry, setUsePantry] = useState(false);
    const [cuisineType, setCuisineType] = useState('Any');
    const [recipeType, setRecipeType] = useState('complete meal');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [cookingTime, setCookingTime] = useState('medium');
    const [saving, setSaving] = useState(false);
    const [substitutions, setSubstitutions] = useState({});
    const [conflicts, setConflicts] = useState([]);
    const [activeSubstitution, setActiveSubstitution] = useState(null);

    useEffect(() => {
        return () => clearGeneratedRecipe();
    }, [clearGeneratedRecipe]);

    const addIngredient = () => {
        if (inputValue.trim()) {
            if (!ingredients.includes(inputValue.trim().toLowerCase())) {
                setIngredients([...ingredients, inputValue.trim().toLowerCase()]);
            }
            setInputValue('');
        }
    };

    const removeIngredient = (ingredient) => {
        setIngredients(ingredients.filter(i => i !== ingredient));
    };

    const toggleDietary = (option) => {
        if (dietaryRestrictions.includes(option)) {
            setDietaryRestrictions(dietaryRestrictions.filter(r => r !== option));
        } else {
            setDietaryRestrictions([...dietaryRestrictions, option]);
        }
    };

    const handleGenerate = async () => {
        if (!usePantry && ingredients.length === 0) {
            toast.error('Please add at least one ingredient or use pantry items');
            return;
        }

        const result = await generateRecipe({
            ingredients,
            usePantry,
            cuisine_type: cuisineType,
            recipe_type: recipeType,
            dietary_restrictions: dietaryRestrictions,
            cooking_time: cookingTime
        });

        if (result.success) {
            toast.success('Recipe generated successfully!');
            setConflicts(result.conflicts || []);
            setSubstitutions(result.substitutions || {});
        } else {
            toast.error(result.message);
        }
    };

    const handleSwapIngredient = (originalName, newName) => {
        const updatedIngredients = generatedRecipe.ingredients.map(ing => {
            if (ing.name.toLowerCase() === originalName.toLowerCase()) {
                return { ...ing, name: newName };
            }
            return ing;
        });

        updateGeneratedRecipe({
            ...generatedRecipe,
            ingredients: updatedIngredients
        });
        setActiveSubstitution(null);
        toast.success(`Swapped ${originalName} with ${newName}`);
    };

    const handleSaveRecipe = async () => {
        if (!generatedRecipe) return;
        setSaving(true);

        const result = await saveRecipe(generatedRecipe);
        if (result.success) {
            toast.success('Recipe saved to your collection!');
        } else {
            toast.error(result.message);
        }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-[var(--paper-bg)] font-serif">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="cookbook-header mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 border-2 border-[var(--border-ink)] flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_var(--border-ink)]">
                            <Sparkles className="w-8 h-8 text-[#9b2226]" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest italic">Cook Gen</h1>
                    <p className="text-gray-600 mt-4 font-serif italic text-lg tracking-tight">Consult the digital oracle for your next culinary masterpiece</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-8">
                        <div className="cookbook-card">
                            <h2 className="text-xl font-bold uppercase tracking-tighter italic mb-6 border-b border-[var(--border-ink)] pb-2">Ingredients</h2>

                            {/* Use Pantry Toggle */}
                            <div className="flex items-center gap-4 mb-6 p-4 border border-[#9b2226] bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="use-pantry"
                                    checked={usePantry}
                                    onChange={(e) => setUsePantry(e.target.checked)}
                                    className="w-4 h-4 accent-[#9b2226] border-[var(--border-ink)]"
                                />
                                <label htmlFor="use-pantry" className="text-sm font-bold uppercase tracking-widest text-[#9b2226]">
                                    Use ingredients from my pantry
                                </label>
                            </div>

                            {/* Manual Ingredient Input */}
                            <div className="flex gap-0 mb-6 font-sans">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                                    placeholder="Add ingredient (e.g., tomatoes)"
                                    className="flex-1 px-4 py-3 border border-[var(--border-ink)] focus:bg-gray-50 outline-none placeholder:italic"
                                />
                                <button
                                    onClick={addIngredient}
                                    className="px-6 py-3 bg-[var(--border-ink)] text-white hover:bg-[#9b2226] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Ingredient Tags */}
                            {ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {ingredients.map((ingredient, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-ink)] bg-gray-50 text-xs font-bold uppercase tracking-widest"
                                        >
                                            {ingredient}
                                            <button
                                                onClick={() => removeIngredient(ingredient)}
                                                className="hover:text-[#9b2226] transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Preferences */}
                        <div className="cookbook-card space-y-8">
                            <h2 className="text-xl font-bold uppercase tracking-tighter italic mb-2 border-b border-[var(--border-ink)] pb-2">Preferences</h2>

                            {/* Recipe Type */}
                            <div className="font-sans">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Recipe Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {RECIPE_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setRecipeType(type)}
                                            className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-all ${recipeType === type
                                                ? 'bg-[#9b2226] text-white border-[#9b2226]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--border-ink)]'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cuisine Type */}
                            <div className="font-sans">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Cuisine Type</label>
                                <select
                                    value={cuisineType}
                                    onChange={(e) => setCuisineType(e.target.value)}
                                    className="w-full px-4 py-3 border border-[var(--border-ink)] bg-white outline-none font-bold uppercase tracking-widest text-xs"
                                >
                                    {CUISINES.map(cuisine => (
                                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dietary Restrictions */}
                            <div className="font-sans">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => toggleDietary(option)}
                                            className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-all ${dietaryRestrictions.includes(option)
                                                ? 'bg-[#9b2226] text-white border-[#9b2226]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--border-ink)]'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cooking Time */}
                            <div className="font-sans">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Preparation Speed</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {COOKING_TIMES.map(time => (
                                        <button
                                            key={time.value}
                                            onClick={() => setCookingTime(time.value)}
                                            className={`px-3 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all ${cookingTime === time.value
                                                ? 'bg-[#9b2226] text-white border-[#9b2226]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--border-ink)]'
                                                }`}
                                        >
                                            {time.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full bg-[var(--border-ink)] hover:bg-[#9b2226] text-white font-bold uppercase tracking-[0.3em] py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                        >
                            {generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Recipe
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="lg:sticky lg:top-8 h-auto lg:h-[calc(100vh-8rem)] flex flex-col">
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--border-ink)] scrollbar-track-transparent">
                            {generatedRecipe ? (
                                <div className="cookbook-card p-0 overflow-hidden">
                                    {/* Recipe Header */}
                                    <div className="p-8 border-b-2 border-double border-[var(--border-ink)]">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4 italic leading-tight">{generatedRecipe.name}</h2>
                                        <p className="text-gray-600 italic text-lg leading-relaxed">{generatedRecipe.description}</p>

                                        <div className="flex flex-wrap gap-3 mt-6 font-sans">
                                            <span className="px-3 py-1 border border-[var(--border-ink)] text-[10px] font-bold uppercase tracking-widest">
                                                {generatedRecipe.recipe_type}
                                            </span>
                                            <span className="px-3 py-1 border border-[#9b2226] text-[#9b2226] text-[10px] font-bold uppercase tracking-widest">
                                                {generatedRecipe.cuisine_type}
                                            </span>
                                            <span className="px-3 py-1 border border-gray-400 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                                                {generatedRecipe.difficulty}
                                            </span>
                                            {generatedRecipe.dietary_tags?.map(tag => (
                                                <span key={tag} className="px-3 py-1 border border-dashed border-gray-400 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-6 mt-6 font-sans uppercase tracking-[0.2em] text-[10px] font-bold text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>Total: {(generatedRecipe.prep_time || 0) + (generatedRecipe.cook_time || 0)} mins</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Allergy Conflict Warning */}
                                    {conflicts.length > 0 && (
                                        <div className="bg-red-50 border-b border-[var(--border-ink)] p-6 space-y-4">
                                            <div className="flex items-center gap-3 text-[#9b2226] font-bold uppercase tracking-widest text-sm">
                                                <AlertTriangle className="w-5 h-5" />
                                                <span>Dietary Conflicts Detected</span>
                                            </div>
                                            <ul className="text-sm text-gray-800 space-y-2 font-serif italic">
                                                {conflicts.map((conflict, idx) => (
                                                    <li key={idx} className="flex gap-2">
                                                        <span className="font-bold text-[#9b2226]">•</span>
                                                        <span>{conflict.ingredient} conflicts with {conflict.reason} profile.</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Ingredients & Instructions Content */}
                                    <div className="p-8 space-y-10">
                                        {/* Ingredients */}
                                        <div>
                                            <h3 className="text-xl font-bold uppercase tracking-tighter italic mb-6 border-b border-gray-100 pb-2">Ingredients</h3>
                                            <ul className="space-y-1">
                                                {generatedRecipe.ingredients?.map((ing, index) => (
                                                    <li key={index} className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between group border-b border-gray-50 pb-1">
                                                            <div className="flex items-center gap-3 text-gray-800 text-lg">
                                                                <span className="w-1.5 h-1.5 bg-[#9b2226]"></span>
                                                                <span className="font-bold">{ing.quantity}</span> {ing.unit} {ing.name}
                                                            </div>
                                                            {substitutions[ing.name.toLowerCase()] && (
                                                                <button
                                                                    onClick={() => setActiveSubstitution(activeSubstitution === ing.name ? null : ing.name)}
                                                                    className={`p-1 transition-colors ${activeSubstitution === ing.name ? 'text-[#9b2226]' : 'text-gray-400'}`}
                                                                >
                                                                    <Sparkles className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Substitution Panel */}
                                                        {activeSubstitution === ing.name && (
                                                            <div className="ml-4.5 p-3 border border-dashed border-[var(--border-ink)] bg-gray-50 space-y-2">
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Alternatives:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {substitutions[ing.name.toLowerCase()].map(sub => (
                                                                        <button
                                                                            key={sub}
                                                                            onClick={() => handleSwapIngredient(ing.name, sub)}
                                                                            className="px-2 py-1 bg-white border border-[var(--border-ink)] text-[10px] font-bold uppercase tracking-tight hover:bg-[#9b2226] hover:text-white transition-all shadow-sm"
                                                                        >
                                                                            {sub}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Instructions */}
                                        <div>
                                            <h3 className="text-xl font-bold uppercase tracking-tighter italic mb-6 border-b border-gray-100 pb-2">Method</h3>
                                            <ol className="space-y-6">
                                                {generatedRecipe.instructions?.map((step, index) => (
                                                    <li key={index} className="flex gap-4">
                                                        <span className="shrink-0 w-8 h-8 border border-[var(--border-ink)] text-gray-900 flex items-center justify-center text-sm font-bold italic">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-gray-800 text-lg leading-relaxed pt-0.5">{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        {/* Nutrition */}
                                        {generatedRecipe.nutrition && (
                                            <div className="pt-8 border-t border-[var(--border-ink)]">
                                                <h3 className="text-lg font-bold uppercase tracking-widest mb-6 text-center italic">Nutritional Data</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                    <NutritionBadge label="Calories" value={generatedRecipe.nutrition.calories} unit="kcal" />
                                                    <NutritionBadge label="Protein" value={generatedRecipe.nutrition.protein} unit="g" />
                                                    <NutritionBadge label="Carbs" value={generatedRecipe.nutrition.carbs} unit="g" />
                                                    <NutritionBadge label="Fats" value={generatedRecipe.nutrition.fats} unit="g" />
                                                    <NutritionBadge label="Fiber" value={generatedRecipe.nutrition.fiber} unit="g" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Cooking Tips */}
                                        {generatedRecipe.cooking_tips && generatedRecipe.cooking_tips.length > 0 && (
                                            <div className="p-6 border border-[var(--border-ink)] bg-gray-50 relative">
                                                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-[#9b2226]"></span>
                                                    Culinary Secrets
                                                </h3>
                                                <ul className="space-y-3">
                                                    {generatedRecipe.cooking_tips.map((tip, index) => (
                                                        <li key={index} className="text-sm italic text-gray-700 leading-relaxed">• {tip}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="pt-8 border-t border-[var(--border-ink)]">
                                            <button
                                                onClick={handleSaveRecipe}
                                                disabled={saving}
                                                className="w-full bg-[#9b2226] hover:bg-black text-white font-bold uppercase tracking-[0.3em] py-4 transition-all disabled:opacity-50"
                                            >
                                                {saving ? 'Adding to library...' : 'Inscribe in Cookbook'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="cookbook-card border-dashed border-2 flex flex-col items-center justify-center p-20 text-center h-full min-h-[600px] bg-gray-50/50">
                                    <div className="w-20 h-20 border-2 border-gray-200 flex items-center justify-center mb-6 opacity-40">
                                        <ChefHat className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-serif italic text-xl">Waiting for your request to be inscribed...</p>
                                    <div className="mt-8 w-24 h-0.5 bg-gray-100"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionBadge = ({ label, value, unit }) => (
    <div className="text-center p-2 border border-gray-100 bg-white">
        <div className="text-lg font-bold text-gray-900 leading-tight">{value}<span className="text-[8px] ml-0.5">{unit}</span></div>
        <div className="text-[8px] text-gray-500 uppercase tracking-widest font-bold font-sans mt-1">{label}</div>
    </div>
);

export default RecipeGenerator;
