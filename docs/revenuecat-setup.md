# RevenueCat Setup Guide

## 1. Create RevenueCat Account

1. Go to [revenuecat.com](https://revenuecat.com) and sign up
2. Create a new project: **PrestigeSupliments**

## 2. Configure App Stores

### iOS (App Store Connect)
1. Go to **Project Settings → iOS**
2. Enter your **App Store Connect** credentials
3. Upload App Store Connect API Key

### Android (Google Play Console)
1. Go to **Project Settings → Android**
2. Enter your **Google Play** service account credentials
3. Upload Google Play service account JSON

## 3. Create Products

### In App Store Connect (iOS)
1. Go to your app → **In-App Purchases**
2. Create **Auto-Renewable Subscriptions**:
   - `prestige_basic_monthly` — Basic Monthly ($9.99)
   - `prestige_basic_yearly` — Basic Yearly ($99.99)
   - `prestige_premium_monthly` — Premium Monthly ($19.99)
   - `prestige_premium_yearly` — Premium Yearly ($199.99)
3. Create a **Subscription Group**: `Prestige Premium`

### In Google Play Console (Android)
1. Go to your app → **Monetize → Subscriptions**
2. Create subscriptions with matching product IDs

## 4. Configure in RevenueCat

### Create Entitlements
1. Go to **Entitlements** → Create:
   - `basic` — Basic access
   - `premium` — Premium access

### Create Products
1. Go to **Products** → Add:
   - `prestige_basic_monthly` → Entitlement: `basic`
   - `prestige_basic_yearly` → Entitlement: `basic`
   - `prestige_premium_monthly` → Entitlement: `premium`
   - `prestige_premium_yearly` → Entitlement: `premium`

### Create Offerings
1. Go to **Offerings** → Create default offering
2. Add packages:
   - **Monthly Basic** — `prestige_basic_monthly`
   - **Yearly Basic** — `prestige_basic_yearly`
   - **Monthly Premium** — `prestige_premium_monthly`
   - **Yearly Premium** — `prestige_premium_yearly`

## 5. Get API Keys

1. Go to **Project Settings → API Keys**
2. Copy:
   - **Public SDK Key (iOS)** → `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
   - **Public SDK Key (Android)** → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`

## 6. Configure Webhook

1. Go to **Integrations → Webhooks**
2. Add webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/revenuecat-webhook
   ```
3. Add authorization header:
   ```
   Bearer YOUR_WEBHOOK_SECRET
   ```
4. Select events:
   - `INITIAL_PURCHASE`
   - `RENEWAL`
   - `CANCELLATION`
   - `EXPIRATION`
   - `BILLING_ISSUE`
   - `NON_RENEWING_PURCHASE`

## 7. Mobile Integration

The mobile app uses `react-native-purchases` for IAP:

```typescript
import Purchases from 'react-native-purchases';

// Configure
await Purchases.configure({
  apiKey: Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY,
});

// Get offerings
const offerings = await Purchases.getOfferings();

// Purchase
const { customerInfo } = await Purchases.purchasePackage(package);

// Check entitlements
const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
```

## 8. Testing

### Sandbox Testing (iOS)
1. Create a Sandbox tester in App Store Connect
2. Sign out of App Store on device
3. Run app and purchase — will use sandbox

### Testing (Android)
1. Upload a signed APK to internal testing track
2. Add test accounts in Google Play Console
3. Test purchases

## Troubleshooting

### "No products available"
- Ensure products are approved in App Store Connect / Play Console
- Check product IDs match exactly
- Verify API keys are correct

### Purchases not syncing
- Check webhook URL is accessible
- Verify webhook secret matches
- Check Supabase Edge Function logs

### Restore not working
- Ensure user is logged in with same account
- Check RevenueCat dashboard for customer info
