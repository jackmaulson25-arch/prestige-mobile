# 🏆 PrestigeSupliments — Premium Supplements Subscription Platform

A production-ready SaaS platform for supplement subscriptions, built with Expo (mobile), Next.js (web admin), and Supabase (backend).

## 📱 Architecture

```
prestige-mobile/
├── apps/
│   ├── mobile/          # Expo SDK 52+ mobile app (expo-router)
│   └── web/             # Next.js 15 admin dashboard (App Router)
├── packages/
│   └── shared/          # Shared types, validation schemas, utilities
├── supabase/
│   ├── migrations/      # Database migrations (SQL)
│   ├── functions/       # Edge Functions (webhooks)
│   └── seed/            # Seed data
└── .env.example         # Environment variables reference
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **Supabase CLI** (`npm i -g supabase`)
- **Expo CLI** (`npm i -g expo-cli`)
- **EAS CLI** (`npm i -g eas-cli`)

### 1. Clone & Install

```bash
cd prestige-mobile
npm install
```

### 2. Set Up Supabase

```bash
# Login to Supabase
supabase login

# Link to your project (or create one)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed test data
supabase db seed
```

### 3. Configure Environment Variables

**Mobile** (`apps/mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your-ios-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your-android-key
```

**Web** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development

```bash
# Mobile app
npm run dev:mobile

# Web dashboard
npm run dev:web
```

## 📱 Mobile App (Expo)

### Features

- **Authentication** — Email/password, Google, Apple sign-in via Supabase Auth
- **Home Screen** — Featured content, quick actions, upgrade CTA
- **Content Library** — Filterable content with tier-based gating
- **Subscription Plans** — Monthly/yearly billing with RevenueCat IAP
- **Profile** — User info, subscription status, sign out
- **Navigation** — Tab-based (Home, Content, Subscribe, Profile)

### Key Screens

| Screen | Description |
|--------|-------------|
| `(auth)/login` | Email/password + social login |
| `(auth)/register` | Account creation with validation |
| `(auth)/forgot-password` | Password reset flow |
| `(tabs)/index` | Home with featured content |
| `(tabs)/content` | Filterable content library |
| `(tabs)/subscribe` | Tier selection with RevenueCat |
| `(tabs)/profile` | User profile and settings |
| `content/[slug]` | Content detail with markdown rendering |

### Tech Stack

- **Expo SDK 52+** with expo-router (file-based navigation)
- **NativeWind** — Tailwind CSS for React Native
- **Zustand** — State management
- **Supabase Auth** — Authentication with SecureStore persistence
- **RevenueCat** — In-app purchases

## 🖥️ Web Admin Dashboard (Next.js)

### Features

- **Dashboard** — User count, MRR, revenue breakdown, recent payments
- **Users** — Searchable/filterable user table with subscription status
- **Subscriptions** — Active subscriptions, revenue stats, payment history
- **Content Management** — CRUD for premium content with tier gating
- **Settings** — Tier pricing configuration, integration IDs

### Key Pages

| Page | Description |
|------|-------------|
| `/login` | Admin authentication |
| `/dashboard` | Overview with stats and charts |
| `/dashboard/users` | User management with search/filter |
| `/dashboard/subscriptions` | Subscription monitoring |
| `/dashboard/content` | Content CRUD with publish toggle |
| `/dashboard/settings` | Tier pricing and integration config |

### Tech Stack

- **Next.js 15** (App Router)
- **shadcn/ui** — Component library
- **Tailwind CSS** — Styling
- **Recharts** — Charts (extensible)
- **Stripe** — Web payments

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `subscription_tiers` | Available subscription tiers |
| `user_subscriptions` | Active user subscriptions |
| `premium_content` | Gated content with tier requirements |
| `payments` | Payment records |

### Key Relationships

```
auth.users → profiles (1:1, auto-created via trigger)
profiles → user_subscriptions (1:many)
subscription_tiers → user_subscriptions (1:many)
profiles → payments (1:many)
```

### Row Level Security

- Users can only read/update their own profile
- Users can only read their own subscriptions and payments
- Published content is publicly readable
- Admin users have full access to all tables
- Service role can manage subscriptions (for webhooks)

## 💳 Stripe Integration (Web)

### Setup

1. Create a Stripe account and get API keys
2. Create products and prices in Stripe Dashboard
3. Add price IDs to `subscription_tiers` table
4. Configure webhook endpoint: `https://your-domain.com/api/stripe/webhook`
5. Listen for events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe webhooks |
| `/api/stripe/portal` | POST | Create billing portal session |

## 📱 RevenueCat Integration (Mobile)

### Setup

1. Create a RevenueCat project
2. Configure products and entitlements
3. Add API keys to environment variables
4. Configure webhook in RevenueCat dashboard → `https://your-project.supabase.co/functions/v1/revenuecat-webhook`

### Products

| Product ID | Tier | Cycle |
|-----------|------|-------|
| `prestige_basic_monthly` | Basic | Monthly |
| `prestige_basic_yearly` | Basic | Yearly |
| `prestige_premium_monthly` | Premium | Monthly |
| `prestige_premium_yearly` | Premium | Yearly |

## 🔐 Supabase Edge Functions

| Function | Description |
|----------|-------------|
| `stripe-webhook` | Handles Stripe payment events |
| `revenuecat-webhook` | Handles RevenueCat subscription events |
| `create-checkout` | Creates Stripe checkout sessions (server-side) |

Deploy with:
```bash
supabase functions deploy stripe-webhook
supabase functions deploy revenuecat-webhook
supabase functions deploy create-checkout
```

## 🧪 Seed Data

The seed script creates:

- **3 subscription tiers** — Free, Basic ($9.99/mo), Premium ($19.99/mo)
- **5 premium content items** — Guides, articles, recipes, workout programs
- All content is pre-published and tier-gated

Run: `supabase db seed`

## 📦 Build & Deploy

### Mobile (EAS Build)

```bash
cd apps/mobile

# Development build
eas build --profile development

# Preview build (internal testing)
eas build --profile preview

# Production build
eas build --profile production

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

### Web (Vercel / Any Platform)

```bash
cd apps/web
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel --prod
```

## 📋 App Store / Play Store Submission

### iOS (App Store)

1. **Apple Developer Account** — $99/year
2. **App Store Connect** — Create app listing
3. **Screenshots** — 6.7", 6.5", 5.5" iPhone + iPad
4. **Privacy Policy** — Required URL
5. **App Review** — Ensure compliance with guidelines
6. **In-App Purchases** — Configure in App Store Connect, link to RevenueCat

### Android (Play Store)

1. **Google Play Developer Account** — $25 one-time
2. **Play Console** — Create app listing
3. **Screenshots** — Phone + tablet
4. **Content Rating** — Complete questionnaire
5. **Data Safety** — Fill out form
6. **In-App Products** — Configure in Play Console, link to RevenueCat

## 🔧 Environment Variables Reference

See `.env.example` in the root directory for all required variables.

| Variable | Used By | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Both | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Web | Supabase service role (admin) |
| `STRIPE_SECRET_KEY` | Web | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Web | Stripe webhook signing secret |
| `REVENUECAT_API_KEY_IOS` | Mobile | RevenueCat iOS API key |
| `REVENUECAT_API_KEY_ANDROID` | Mobile | RevenueCat Android API key |
| `REVENUECAT_WEBHOOK_SECRET` | Supabase | RevenueCat webhook auth |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checks
5. Submit a pull request

## 📄 License

MIT License — see LICENSE file for details.
