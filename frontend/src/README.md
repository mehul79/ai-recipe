# UI Boilerplate - Cook Gen

This is a **UI-only boilerplate** version of the Cook Gen frontend. It contains all the UI components and styling but uses **dummy data** instead of making actual API calls to the backend.

## Purpose

This boilerplate is designed for:
- **YouTube tutorials** - Start with a working UI and implement backend integration step-by-step
- **UI/UX demonstrations** - Show the complete interface without backend setup
- **Frontend development** - Work on styling and components without backend dependencies

## What's Included

✅ **All UI Components** - Complete React components with Tailwind CSS styling  
✅ **Dummy Data** - Realistic sample data for all features  
✅ **No API Dependencies** - All data is loaded from local dummy data file  
✅ **Full Navigation** - All routes and page transitions work  
✅ **Interactive UI** - Forms, buttons, and interactions work (UI-only, no persistence)

## Features with Dummy Data

- **Dashboard** - Shows stats, recent recipes, and upcoming meals
- **Pantry Management** - Add, view, and delete pantry items (UI-only)
- **Cook Gen** - Generate recipes with dummy AI response
- **My Recipes** - Browse saved recipes with search and filters
- **Recipe Details** - View full recipe information
- **Meal Planner** - Weekly calendar with meal scheduling
- **Shopping List** - Manage shopping items with categories
- **Settings** - User profile and preferences
- **Authentication** - Login/Signup pages (auto-login with dummy user)

## How to Use

### 1. Replace the `src` folder

```bash
cd /Users/raviteja/Documents/TTP/React\ JS/2026/AIRecipeGenerator/frontend/cook-gen

# Backup original src (optional)
mv src src-original

# Use boilerplate
cp -r src-boilerplate src

# Start dev server
npm run dev
```

### 2. Open the app

Navigate to `http://localhost:5173` and explore all the pages!

### 3. Restore original src (when done)

```bash
# Remove boilerplate
rm -rf src

# Restore original
mv src-original src
```

## File Structure

```
src-boilerplate/
├── data/
│   └── dummyData.js          # All dummy data (recipes, pantry, meals, etc.)
├── components/
│   ├── Navbar.jsx            # Navigation bar
│   └── ProtectedRoute.jsx    # Route protection (dummy)
├── context/
│   └── AuthContext.jsx       # Auth context (dummy user)
├── pages/
│   ├── Dashboard.jsx         # Dashboard with stats
│   ├── Pantry.jsx            # Pantry management
│   ├── RecipeGenerator.jsx   # Cook Gen
│   ├── MyRecipes.jsx         # Recipe collection
│   ├── RecipeDetail.jsx      # Recipe details
│   ├── MealPlanner.jsx       # Weekly meal planner
│   ├── ShoppingList.jsx      # Shopping list
│   ├── Settings.jsx          # User settings
│   ├── Login.jsx             # Login page
│   └── SignUp.jsx            # Signup page
├── services/
│   └── api.js                # (Not used in boilerplate)
├── App.jsx                   # Main app component
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

## Dummy Data

All dummy data is centralized in `src-boilerplate/data/dummyData.js`:

- **dummyUser** - Sample user profile
- **dummyPreferences** - User preferences (dietary, cuisines, servings)
- **dummyRecipes** - 5 sample recipes with full details
- **dummyPantryItems** - 15 pantry items with categories and expiry dates
- **dummyMealPlans** - Weekly meal plan entries
- **dummyShoppingListItems** - Shopping list with categories
- **dummyStats** - Dashboard statistics
- **dummyGeneratedRecipe** - Sample AI-generated recipe

## Key Differences from Production

| Feature | Production | Boilerplate |
|---------|-----------|-------------|
| Data Source | Backend API | Local dummy data |
| Authentication | JWT tokens | Auto-login (dummy) |
| Recipe Generation | Google Gemini AI | Pre-defined dummy recipe |
| Data Persistence | PostgreSQL database | None (UI-only) |
| Loading States | Real API delays | Instant or simulated |
| Error Handling | API error responses | None needed |

## Next Steps for Tutorial

When using this boilerplate for a tutorial, you can implement features step-by-step:

1. **Setup Backend** - Create Express server and PostgreSQL database
2. **Authentication** - Implement JWT-based auth
3. **API Integration** - Replace dummy data with real API calls
4. **Recipe Generation** - Integrate Google Gemini AI
5. **Data Persistence** - Save data to database
6. **Error Handling** - Add proper error handling
7. **Loading States** - Add loading indicators
8. **Deployment** - Deploy to production

## Notes

- All "add", "edit", and "delete" operations work in the UI but don't persist
- The app will reset to dummy data on page refresh
- No backend server is required to run this boilerplate
- Perfect for demonstrating the UI/UX without backend complexity

## Support

For the full production version with backend integration, see the main `src` folder and `README.md` in the project root.

---

**Happy Coding! 🚀**
