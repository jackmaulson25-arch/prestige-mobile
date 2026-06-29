# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose organization and enter:
   - **Project name:** `prestige-supliments`
   - **Database password:** (generate a strong one)
   - **Region:** Choose closest to your users
4. Wait for project creation (~2 minutes)

## 2. Get API Keys

Go to **Settings → API** and copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 3. Run Migrations

Install Supabase CLI:
```bash
npm install -g supabase
```

Login and link:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Push migrations:
```bash
supabase db push
```

This creates all tables, indexes, triggers, and RLS policies.

## 4. Seed Test Data

```bash
supabase db seed
```

This creates:
- 3 subscription tiers (Free, Basic, Premium)
- 5 sample content items

## 5. Set Up Auth Providers

### Email (Default)
Already enabled by default.

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → **Authentication → Providers → Google**:
   - Enable Google
   - Add Client ID and Client Secret

### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com)
2. Create an App ID and Service ID
3. Configure Sign in with Apple
4. In Supabase Dashboard → **Authentication → Providers → Apple**:
   - Enable Apple
   - Add Service ID, Team ID, Key ID, and Private Key

## 6. Deploy Edge Functions

```bash
supabase functions deploy stripe-webhook
supabase functions deploy revenuecat-webhook
supabase functions deploy create-checkout
```

Set secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set REVENUECAT_WEBHOOK_SECRET=your-secret
```

## 7. Configure Webhooks

### Stripe Webhook
1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Add endpoint: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### RevenueCat Webhook
1. Go to RevenueCat Dashboard → **Integrations → Webhooks**
2. Add webhook URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/revenuecat-webhook`
3. Add authorization header: `Bearer YOUR_WEBHOOK_SECRET`

## 8. Create Admin User

After a user signs up, make them an admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 9. Enable Row Level Security

RLS is enabled by the migration. Verify in **Authentication → Policies** that all tables have appropriate policies.

## Troubleshooting

### "Permission denied" errors
- Check RLS policies are correctly set
- Ensure you're using the correct API key (anon for client, service_role for admin)

### Webhook not receiving events
- Verify the webhook URL is correct
- Check Edge Function logs: `supabase functions logs stripe-webhook`
- Ensure secrets are set correctly

### Auth callback not working
- Verify redirect URLs are configured in Supabase Dashboard
- Check OAuth provider settings match your app's configuration
