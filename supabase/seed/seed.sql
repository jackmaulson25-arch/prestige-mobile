-- =============================================
-- PrestigeSupliments — Seed Data
-- =============================================

-- Subscription Tiers
INSERT INTO public.subscription_tiers (name, slug, price_monthly, price_yearly, features, revenuecat_product_id, stripe_price_id_monthly, stripe_price_id_yearly, sort_order)
VALUES
    (
        'Free',
        'free',
        0,
        0,
        '["Access to basic articles", "Weekly newsletter", "Community forum access"]'::JSONB,
        NULL,
        NULL,
        NULL,
        0
    ),
    (
        'Basic',
        'basic',
        9.99,
        99.99,
        '["Everything in Free", "Premium articles & guides", "Monthly supplement recommendations", "Exclusive recipes", "Priority email support"]'::JSONB,
        'prestige_basic_monthly',
        'price_basic_monthly',
        'price_basic_yearly',
        1
    ),
    (
        'Premium',
        'premium',
        19.99,
        199.99,
        '["Everything in Basic", "1-on-1 nutrition coaching", "Custom supplement stacks", "Video workout programs", "Early access to new products", "VIP Discord access", "Quarterly supplement box"]'::JSONB,
        'prestige_premium_monthly',
        'price_premium_monthly',
        'price_premium_yearly',
        2
    );

-- Premium Content
INSERT INTO public.premium_content (title, slug, body, excerpt, content_type, required_tier_slug, is_published, published_at)
VALUES
    (
        'The Ultimate Guide to Protein Supplements',
        'ultimate-protein-guide',
        E'# The Ultimate Guide to Protein Supplements\n\nProtein is the building block of muscle, and choosing the right supplement can make or break your fitness goals.\n\n## Types of Protein\n\n### Whey Protein\nWhey is the most popular protein supplement. It''s fast-absorbing and contains all essential amino acids.\n\n**Best for:** Post-workout recovery, muscle building\n\n### Casein Protein\nCasein is slow-digesting, making it ideal before bed.\n\n**Best for:** Overnight muscle recovery, sustained amino acid release\n\n### Plant-Based Protein\nPea, rice, and hemp proteins are excellent alternatives for vegans.\n\n**Best for:** Vegetarians, vegans, those with dairy allergies\n\n## How Much Protein Do You Need?\n\n- **Sedentary:** 0.8g per kg of body weight\n- **Active:** 1.2-1.6g per kg\n- **Muscle building:** 1.6-2.2g per kg\n- **Fat loss:** 2.0-2.4g per kg\n\n## Timing Your Protein\n\n1. **Morning:** 20-30g to break the overnight fast\n2. **Pre-workout:** 20g, 30 minutes before training\n3. **Post-workout:** 30-40g within 30 minutes\n4. **Before bed:** 20-40g casein for overnight recovery\n\n## Our Top Picks\n\n1. **Prestige Whey Gold** — 25g protein, 5.5g BCAAs, grass-fed\n2. **Prestige Casein Plus** — 24g slow-release protein\n3. **Prestige Plant Power** — 22g complete plant protein blend',
        'Everything you need to know about choosing the right protein supplement for your goals.',
        'guide',
        'free',
        TRUE,
        NOW()
    ),
    (
        'Creatine: The Science-Backed Performance Booster',
        'creatine-science-guide',
        E'# Creatine: The Science-Backed Performance Booster\n\nCreatine is the most researched supplement in sports nutrition. Here''s what the science says.\n\n## What is Creatine?\n\nCreatine is a naturally occurring compound found in muscle cells. It helps your muscles produce energy during heavy lifting or high-intensity exercise.\n\n## Benefits\n\n- **Strength increase:** 5-15% improvement in max strength\n- **Power output:** Enhanced sprint and jump performance\n- **Muscle volume:** Increased water retention in muscle cells\n- **Brain health:** Emerging evidence for cognitive benefits\n- **Recovery:** Faster recovery between sets and sessions\n\n## How to Use Creatine\n\n### Loading Phase (Optional)\n- 20g per day for 5-7 days (split into 4 doses)\n\n### Maintenance Phase\n- 3-5g per day, every day\n\n### Timing\n- Post-workout may be slightly more effective\n- Consistency matters more than timing\n\n## Types of Creatine\n\n1. **Creatine Monohydrate** — Gold standard, most researched\n2. **Creatine HCL** — Better solubility, smaller dose\n3. **Buffered Creatine** — Marketing hype, no proven advantage\n\n## Side Effects\n\n- Water retention (temporary weight gain)\n- Digestive issues at high doses (rare)\n- No evidence of kidney damage in healthy individuals\n\n> **Pro tip:** Combine creatine with carbohydrates and protein for better absorption.',
        'The definitive guide to creatine supplementation backed by scientific research.',
        'article',
        'basic',
        TRUE,
        NOW()
    ),
    (
        'Custom Supplement Stack Builder',
        'custom-stack-builder',
        E'# Custom Supplement Stack Builder\n\nBuild your personalized supplement routine based on your specific goals.\n\n## Goal: Muscle Building\n\n### Essential Stack\n| Supplement | Dose | Timing |\n|-----------|------|--------|\n| Whey Protein | 30g | Post-workout |\n| Creatine Monohydrate | 5g | Daily |\n| Vitamin D3 | 4000 IU | Morning |\n| Omega-3 | 2-3g | With meals |\n\n### Advanced Additions\n- **HMB:** 3g daily during cutting phases\n- **Beta-Alanine:** 3-5g daily for endurance\n- **Citrulline Malate:** 6-8g pre-workout\n\n## Goal: Fat Loss\n\n### Essential Stack\n| Supplement | Dose | Timing |\n|-----------|------|--------|\n| Whey Protein | 25g | Between meals |\n| Green Tea Extract | 500mg | Morning |\n| L-Carnitine | 2g | Pre-workout |\n| Multivitamin | 1 serving | Morning |\n\n## Goal: General Health\n\n### Essential Stack\n| Supplement | Dose | Timing |\n|-----------|------|--------|\n| Multivitamin | 1 serving | Morning |\n| Omega-3 | 2g | With meals |\n| Vitamin D3 | 2000 IU | Morning |\n| Probiotics | 10B CFU | Morning |\n| Magnesium | 400mg | Evening |\n\n## Personalization Factors\n\n- **Age:** Adjust doses based on life stage\n- **Diet:** Vegetarians need B12 and iron\n- **Activity level:** Athletes need higher protein\n- **Health conditions:** Consult a healthcare provider\n\n> This stack is personalized using your quiz results. Update your profile for refined recommendations.',
        'Get a personalized supplement stack based on your goals, diet, and lifestyle.',
        'guide',
        'premium',
        TRUE,
        NOW()
    ),
    (
        'High-Protein Meal Prep: 7-Day Plan',
        'high-protein-meal-prep',
        E'# High-Protein Meal Prep: 7-Day Plan\n\nPrepare a week''s worth of high-protein meals in under 3 hours.\n\n## Shopping List\n\n### Proteins\n- 2 lbs chicken breast\n- 1 lb ground turkey\n- 1 lb salmon fillets\n- 2 dozen eggs\n- 2 cups Greek yogurt\n- 1 block firm tofu\n\n### Carbs\n- 3 cups brown rice\n- 2 lbs sweet potatoes\n- 1 lb whole wheat pasta\n- 1 loaf whole grain bread\n\n### Vegetables\n- 2 lbs broccoli\n- 1 lb green beans\n- 1 lb spinach\n- 6 bell peppers\n- 1 lb asparagus\n\n## Day 1-3 Meals\n\n### Breakfast: Protein Pancakes\n- 1 cup oats, 1 scoop protein, 2 eggs, 1 banana\n- **Macros:** 42g protein, 65g carbs, 12g fat\n\n### Lunch: Chicken & Rice Bowl\n- 6oz chicken, 1 cup brown rice, roasted vegetables\n- **Macros:** 45g protein, 55g carbs, 8g fat\n\n### Dinner: Salmon & Sweet Potato\n- 6oz salmon, 1 medium sweet potato, steamed broccoli\n- **Macros:** 40g protein, 40g carbs, 18g fat\n\n## Day 4-7 Meals\n\n### Breakfast: Egg Muffins\n- 12 eggs, turkey sausage, spinach, cheese\n- **Macros:** 35g protein, 5g carbs, 18g fat\n\n### Lunch: Turkey Taco Bowl\n- 6oz ground turkey, black beans, rice, salsa\n- **Macros:** 42g protein, 50g carbs, 12g fat\n\n### Dinner: Tofu Stir-Fry\n- 8oz tofu, mixed vegetables, brown rice, soy sauce\n- **Macros:** 30g protein, 45g carbs, 14g fat\n\n## Meal Prep Instructions\n\n1. Cook all rice and sweet potatoes\n2. Bake chicken at 400°F for 25 minutes\n3. Pan-sear salmon 4 minutes per side\n4. Brown ground turkey with taco seasoning\n5. Prepare egg muffins in muffin tin (350°F, 20 min)\n6. Portion into containers\n7. Refrigerate — meals last 4-5 days',
        'A complete 7-day high-protein meal prep plan with shopping list and macros.',
        'recipe',
        'basic',
        TRUE,
        NOW()
    ),
    (
        '12-Week Hypertrophy Training Program',
        '12-week-hypertrophy',
        E'# 12-Week Hypertrophy Training Program\n\nA science-backed program designed to maximize muscle growth.\n\n## Program Overview\n\n- **Duration:** 12 weeks\n- **Frequency:** 4 days per week\n- **Split:** Upper/Lower\n- **Rest periods:** 60-90 seconds for hypertrophy\n\n## Week 1-4: Foundation Phase\n\n### Upper Body A\n| Exercise | Sets | Reps |\n|----------|------|------|\n| Bench Press | 4 | 8-10 |\n| Barbell Row | 4 | 8-10 |\n| Overhead Press | 3 | 10-12 |\n| Lat Pulldown | 3 | 10-12 |\n| Dumbbell Curl | 3 | 12-15 |\n| Tricep Pushdown | 3 | 12-15 |\n\n### Lower Body A\n| Exercise | Sets | Reps |\n|----------|------|------|\n| Squat | 4 | 8-10 |\n| Romanian Deadlift | 4 | 8-10 |\n| Leg Press | 3 | 10-12 |\n| Leg Curl | 3 | 10-12 |\n| Calf Raise | 4 | 15-20 |\n\n## Week 5-8: Volume Phase\n\nAdd 1 set to each compound movement. Introduce drop sets on isolation exercises.\n\n## Week 9-12: Intensity Phase\n\nIncrease weight 5-10%, reduce reps to 6-8 on compounds. Add rest-pause sets.\n\n## Nutrition Guidelines\n\n- **Calories:** TDEE + 300-500 surplus\n- **Protein:** 1.6-2.2g per kg bodyweight\n- **Carbs:** 4-6g per kg bodyweight\n- **Fats:** 0.8-1.2g per kg bodyweight\n\n## Supplement Protocol\n\n- **Pre-workout:** Caffeine (200mg) + Citrulline (6g)\n- **Intra-workout:** BCAAs (5g) — optional\n- **Post-workout:** Whey Protein (30g) + Creatine (5g)\n- **Before bed:** Casein Protein (30g)\n\n## Recovery\n\n- Sleep 7-9 hours per night\n- Foam roll on rest days\n- Deload every 4th week (50% volume)',
        'A complete 12-week hypertrophy program with progressive overload and supplement protocol.',
        'workout',
        'premium',
        TRUE,
        NOW()
    );
