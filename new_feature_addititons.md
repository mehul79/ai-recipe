# 🍳 Cook Gen with Substitution Engine

## (DB + Backend + Frontend Flow Context Document)

---

# 📌 1. Core Philosophy

This system is designed with a **DB-first architecture**:

> MongoDB is not just storage — it acts as a **computation and logic engine**.

Instead of pushing logic to backend loops, we:

* Use **aggregation pipelines**
* Use **array operators**
* Use **query + logical operators**

This results in:

* Faster responses
* Cleaner backend
* Scalable architecture

---

# 🧱 2. DATABASE ARCHITECTURE

## Collections

### 1. users

Stores:

* preferences (diet, cuisines, health goals)
* allergies
* savedRecipes
* searchHistory

### 2. recipes (CORE COLLECTION)

Embedded design:

* ingredients[]
* tags[]
* nutrition {}

Why embedded?

* Eliminates joins
* Enables `$elemMatch`
* Works efficiently with aggregation

---

### 3. substitution_rules

Stores substitution logic:

* ingredient
* substitutes[]
* notAllowedFor[]

Used for:

* allergy filtering
* diet compatibility

---

### 4. recipe_logs

Stores user actions:

* userId
* recipeId
* action (view, save, generate)
* timestamp

Used for:

* analytics
* trending recipes
* user behavior

---

# ⚙️ 3. BACKEND LOGIC DESIGN

Backend acts as a **thin layer**:

Responsibilities:

* API routing
* validation
* calling MongoDB queries
* returning formatted responses

NOT responsible for:

* heavy logic
* substitution computation
* analytics

---

# 🧠 4. CORE DATABASE LOGIC

---

## 🔹 ARRAY OPERATIONS

Used in:

* ingredients
* tags
* allergies
* searchHistory

### Operators:

* `$push` → add history, ingredients
* `$addToSet` → avoid duplicates (tags, allergies)
* `$pull` → remove items

Example:

Add cuisine:
`$addToSet: { "preferences.cuisines": "italian" }`

Remove ingredient:
`$pull: { ingredients: { name: "butter" } }`

---

## 🔹 LOGICAL OPERATORS

Used for decision-making inside DB

* `$and` → strict filtering
* `$or` → flexible matching
* `$not` → exclusion
* `$nor` → reject multiple conditions

Example:

Find vegan low-calorie recipes:

* `$and` on tags + nutrition

---

## 🔹 MODIFIERS

Used for updates and transformations

* `$set` → update fields
* `$inc` → counters
* `$unset` → remove fields
* `$rename` → schema migration
* `$setOnInsert` → upsert logic

---

# 🔁 5. SUBSTITUTION ENGINE (CORE FEATURE)

## Goal:

Detect incompatible ingredients and suggest alternatives.

---

## Pipeline Logic:

1. Select recipe
2. Break ingredients array (`$unwind`)
3. Join substitution rules (`$lookup`)
4. Filter conflicts (`$match` with user allergies/diet)
5. Return substitutes (`$project`)

---

## Output Example:

```
[
  {
    ingredient: "milk",
    substitutes: ["almond milk", "soy milk"]
  }
]
```

---

## Key DB Concepts Used:

* `$unwind` → process each ingredient
* `$lookup` → join rules
* `$match` → detect conflicts
* `$project` → shape API output

---

## Backend Flow:

Frontend sends:

* recipeId
* user preferences

Backend:

* injects user allergies into pipeline
* executes aggregation
* returns substitutions

---

# 📊 6. AGGREGATION PIPELINES (FEATURE MAPPING)

---

## 🔥 Top Ingredients

* `$unwind ingredients`
* `$group`
* `$sort`

Used for:

* analytics dashboard

---

## 🔥 Popular Recipes

* `$group` on logs
* `$lookup` with recipes

Used for:

* trending section

---

## 🔥 Smart Pantry

* `$setIntersection`
* `$size`

Used for:

* “What can I cook?” feature

---

## 🔥 User Analytics

* `$unwind preferences`
* `$group`

Used for:

* insights

---

# ⚡ 7. INDEXING STRATEGY

Indexes are based on query patterns.

---

## Recipes

* `ingredients.name` → ingredient search
* `tags` → filtering
* `nutrition.calories` → range queries

Compound index:

* `{ tags, nutrition.calories }`

---

## Users

* `email` (unique)
* `preferences.diet`

---

## Substitution Rules

* `ingredient` → lookup optimization
* `notAllowedFor` → allergy matching

---

## Logs

* `userId`
* `recipeId`
* `timestamp`

---

# 🔄 8. COMPLETE DATA FLOW

```
Frontend Input
   ↓
Backend API
   ↓
MongoDB Query / Aggregation
   ↓
Processed Result
   ↓
Frontend Rendering
```

---

# 🖥️ 9. FRONTEND REPRESENTATION

---

## 🧾 Recipe Page

Displays:

* title
* ingredients
* tags
* nutrition

---

## ⚠️ Substitution Suggestions UI

When conflicts detected:

Example UI:

* Milk ❌ (Lactose)
  → Almond Milk ✅
  → Soy Milk ✅

This comes directly from:

* aggregation pipeline output

---

## 🔥 Trending Section

Displays:

* top recipes

Data source:

* logs aggregation pipeline

---

## 🧺 Smart Pantry UI

User inputs ingredients:

Frontend shows:

* best matching recipes
* match percentage

---

## 👤 User Profile

Displays:

* saved recipes
* preferences
* allergies

Backed by:

* users collection

---

# 🧠 10. SYSTEM DESIGN INSIGHT

---

## What makes this system strong?

### 1. DB handles logic

* substitution engine
* filtering
* analytics

---

### 2. Backend is lightweight

* no heavy loops
* no complex processing

---

### 3. Scalable architecture

* aggregation pipelines scale well
* indexes optimize performance

---

### 4. Feature-driven queries

Each feature maps directly to a DB query.

---

# 🎯 FINAL SUMMARY

This system demonstrates:

### 1. Storage Layer

* recipes, users, logs

### 2. Logic Layer (inside DB)

* substitution engine
* filtering
* matching

### 3. Analytics Engine

* aggregation pipelines

---

# 🧠 FINAL VIVA LINE

“This system uses MongoDB not only as a storage layer but as a computation engine. By leveraging aggregation pipelines, array operators, and indexed queries, it performs substitution logic, filtering, and analytics directly within the database, minimizing backend complexity and improving scalability.”

---

# 🚀 EXTENSION (OPTIONAL)

Future improvements:

* ingredient normalization (ingredient_catalog)
* recommendation system
* caching AI-generated recipes
* hybrid AI + DB ranking

---

This document captures the full **DB + backend + frontend integration logic** of the system.
