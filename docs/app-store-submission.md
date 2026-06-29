# App Store / Play Store Submission Guide

## iOS App Store

### Prerequisites
- **Apple Developer Account** — $99/year at [developer.apple.com](https://developer.apple.com)
- **App Store Connect** access
- **Xcode** (latest version)
- Physical iOS device for testing

### Step 1: Prepare App

1. **Update app.json** with correct values:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.prestigesupliments",
         "config": {
           "usesNonExemptEncryption": false
         }
       }
     }
   }
   ```

2. **Create app icons** — 1024x1024 PNG, no transparency, no rounded corners

3. **Create splash screen** — Follow Apple's guidelines

### Step 2: Build with EAS

```bash
cd apps/mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for production
eas build --platform ios --profile production
```

### Step 3: Submit to App Store

```bash
eas submit --platform ios
```

Or manually:
1. Download `.ipa` from EAS Build
2. Open **App Store Connect**
3. Create new app
4. Upload build via Transporter or Xcode

### Step 4: App Store Listing

Fill in:
- **App Name:** PrestigeSupliments
- **Subtitle:** Premium Supplement Guidance
- **Category:** Health & Fitness
- **Description:** (see template below)
- **Keywords:** supplements, nutrition, fitness, protein, vitamins
- **Screenshots:** Required for all device sizes
- **App Review Information:** Login credentials for review

### Step 5: In-App Purchases

1. In App Store Connect → **In-App Purchases**
2. Ensure all subscription products are configured
3. Submit for review with the app

### Step 6: Submit for Review

1. Click **Submit for Review**
2. Wait 1-3 days for approval
3. Address any feedback from Apple

---

## Google Play Store

### Prerequisites
- **Google Play Developer Account** — $25 one-time at [play.google.com/console](https://play.google.com/console)
- **Signed APK/AAB**
- **Privacy Policy URL**

### Step 1: Prepare App

1. **Update app.json** with correct values:
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.prestigesupliments",
         "versionCode": 1
       }
     }
   }
   ```

2. **Create feature graphic** — 1024x500 PNG

3. **Create screenshots** — Phone and tablet sizes

### Step 2: Build with EAS

```bash
cd apps/mobile

# Build AAB for production
eas build --platform android --profile production
```

### Step 3: Create Play Console Listing

1. Go to [Play Console](https://play.google.com/console)
2. Create new app
3. Fill in:
   - **App name:** PrestigeSupliments
   - **Default language:** English
   - **App or game:** App
   - **Free or paid:** Free (with in-app purchases)

### Step 4: Complete Store Listing

1. **Store listing:**
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (2-8 per device type)
   - Feature graphic
   - Category: Health & Fitness

2. **Content rating:**
   - Complete the questionnaire
   - Likely rated "Everyone" or "Teen"

3. **Data safety:**
   - Fill out data collection form
   - Disclose what data you collect

### Step 5: In-App Products

1. Go to **Monetize → Subscriptions**
2. Create subscription products matching RevenueCat IDs
3. Set pricing for each product

### Step 6: Upload & Submit

```bash
# Upload AAB
eas submit --platform android
```

Or manually:
1. Download AAB from EAS Build
2. Upload to Play Console → **Release → Production**
3. Create release and submit

---

## App Description Template

```
🏆 PrestigeSupliments — Your Premium Supplement Guide

Transform your nutrition with expert-curated supplement guidance, personalized
recommendations, and science-backed content.

✨ FEATURES:
• Premium articles and guides from nutrition experts
• Custom supplement stack builder for your goals
• High-protein meal prep plans with macros
• 12-week training programs with supplement protocols
• Personalized recommendations based on your profile

💎 SUBSCRIPTION TIERS:
• Free — Basic articles and weekly newsletter
• Basic ($9.99/mo) — Premium content, recipes, email support
• Premium ($19.99/mo) — 1-on- coaching, custom stacks, video programs

📱 Download now and start your supplement journey!
```

---

## Common Rejection Reasons & How to Avoid

### iOS
- **Broken links** — Test all URLs before submission
- **Missing privacy policy** — Required for all apps
- **Incomplete IAP** — All subscription products must be configured
- **Crashes** — Test thoroughly on real devices
- **Metadata mismatch** — Screenshots must match actual app

### Android
- **Incomplete store listing** — Fill all required fields
- **Missing content rating** — Complete the questionnaire
- **Data safety issues** — Be transparent about data collection
- **APK/AAB issues** — Use signed builds from EAS
