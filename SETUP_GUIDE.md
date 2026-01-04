# Habit Tracker - Complete Setup & Deployment Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm start

# In another terminal, press:
# w - Open in web browser
# a - Open on Android (Expo Go)
# i - Open on iOS (Expo Go)
```

**Website:** http://localhost:8081

---

## 📋 Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Firebase Configuration](#firebase-configuration)
3. [Development Guide](#development-guide)
4. [Deployment & Testing](#deployment--testing)
5. [Troubleshooting](#troubleshooting)
6. [Architecture](#architecture)

---

## Google OAuth Setup

### Prerequisites
- Google Cloud Project (habit-tracker-73d53)
- Firebase Console Access

### Step-by-Step Setup

1. **Create OAuth 2.0 Credentials**
   - Go to: https://console.cloud.google.com/
   - Select project: `habit-tracker-73d53`
   - Navigate to: APIs & Services > Credentials
   - Click: "Create Credentials" > "OAuth client ID"
   - Choose: "Web application"
   - Name: "Expo App"

2. **Configure Authorized Redirect URIs**
   Add these URIs in the credentials settings:
   ```
   https://habit-tracker-73d53.firebaseapp.com/__/auth/handler
   http://localhost:8081
   http://localhost:19006
   exp://127.0.0.1:19000
   exp://127.0.0.1:19006
   ```

3. **Get Your Client ID**
   - Copy the "Client ID" from the credentials
   - Format: `XXXXXX.apps.googleusercontent.com`

4. **Add to Environment**
   ```bash
   # In .env.local file:
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```

5. **Enable Google Sign-In in Firebase**
   - Firebase Console > Authentication
   - Providers > Google
   - Enable Google Sign-In
   - Add test users if in development mode

### Testing Google Sign-In

1. Start the app: `npm start`
2. Open on web: Press `w`
3. Click "Sign in with Google"
4. Login with your test account
5. Verify you see the Home screen

---

## Firebase Configuration

### Current Configuration

**Project:** habit-tracker-73d53  
**Region:** Asia Southeast 1  
**Database:** Realtime Database

### Database Structure

```
├── habits/
│   ├── {habitId}
│   │   ├── name: "Exercise"
│   │   ├── icon: "💪"
│   │   ├── xp: 100
│   │   ├── streak: 5
│   │   └── createdAt: "2025-01-01T..."
│
└── progress/
    ├── {YYYY-MM-DD}
    │   ├── {habitId}: true/false
    │   └── {habitId}: true/false
```

### Credentials Already Set

The `.env.local` file contains:
- Firebase API Key ✅
- Auth Domain ✅
- Project ID ✅
- Storage Bucket ✅
- Messaging Sender ID ✅
- App ID ✅
- Database URL ✅
- **Google Client ID** ⚠️ (Needs setup - see above)

---

## Development Guide

### File Structure

```
d:\tracker\app/
├── App.js                 # Main application (2728 lines)
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── .env.local             # Environment variables
├── components/
│   ├── LoginScreen.js     # Google Sign-In UI
│   ├── HabitCard.js       # Habit display component
│   ├── LevelProgress.js   # Level/progress display
│   └── QuickStats.js      # Quick stats display
├── utils/
│   └── calculations.js    # Utility calculations
├── assets/                # Images, fonts, etc.
└── docs/                  # Documentation (consolidated)
```

### Key Features

#### 1. **Authentication**
- Google Sign-In via expo-auth-session
- Firebase Authentication
- Auto login on app start via onAuthStateChanged

#### 2. **Habit Management**
- Add custom habits
- Add habit bundles (Health, Learning, Wellness, Productivity)
- Edit habit names
- Delete habits
- Track 30-day history

#### 3. **Progress Tracking**
- Daily habit completion tracking
- Streak counter
- Weekly progress view
- Monthly heatmap
- Success rate calculations

#### 4. **UI Components**
- Home screen: Habit list + daily progress
- Detail screen: Habit stats + 7-day tracker
- Stats screen: Weekly/monthly analytics
- Bottom navigation: Home & Stats tabs

### Running Locally

```bash
# Terminal 1: Start Metro Bundler
npm start

# Then in the same terminal:
# Press 'w' for web
# Press 'a' for Android
# Press 'i' for iOS
# Press 'j' to open debugger
# Press 'r' to reload
```

### Web Development

**URL:** http://localhost:8081

Features:
- Full app functionality on web
- Google Sign-In works with OAuth redirect
- Database syncs in real-time
- Responsive design for desktop/tablet

### Mobile Development

**Android:**
1. Press 'a' in terminal
2. Requires Android emulator or Expo Go installed
3. Scan QR code with Expo Go

**iOS:**
1. Press 'i' in terminal
2. Requires Xcode & iOS simulator
3. Or scan QR code with Camera app

---

## Deployment & Testing

### Before Deployment

1. **Verify Environment Setup**
   ```bash
   npm start
   # Check for any bundler errors
   ```

2. **Test All Features**
   - [ ] Google Sign-In works
   - [ ] Can add habits
   - [ ] Habit completion toggle works
   - [ ] Stats display correctly
   - [ ] Navigation works smoothly
   - [ ] Data persists after reload

3. **Test on Multiple Platforms**
   - [ ] Web (http://localhost:8081)
   - [ ] Android Emulator
   - [ ] iOS Simulator
   - [ ] Physical devices (via Expo Go)

### EAS (Expo Application Services) Deployment

Coming soon - Configure via EAS CLI

### Firebase Hosting

Coming soon - Deploy React Native Web build

### Vercel/Netlify

Coming soon - Deploy web build separately

---

## Troubleshooting

### Website Not Loading

**Error: "Cannot find module..."**
- Solution: `npm install`
- Then: `npm start` with `--clear` flag

**Error: "Metro bundler fails"**
- Clear cache: `expo start --clear`
- Delete: `node_modules/` and run `npm install`

### Google Sign-In Not Working

**Error: "Google Client ID is not configured"**
- Steps:
  1. Get OAuth Client ID (see Google OAuth Setup above)
  2. Add to `.env.local`
  3. Restart: `npm start` with `--clear`

**Error: "Invalid Redirect URI"**
- Check `.env.local` has correct Client ID
- Verify redirect URIs in Google Cloud Console
- Include all URLs (localhost, expo tunnel, production)

### App Crashes on Android/iOS

**Error: "TurboModuleRegistry error"**
- Cause: Package version incompatibility
- Solution:
  ```bash
  npm install
  expo start --clear
  ```

**Error: "Module not found"**
- Solution: Clear all caches
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  expo start --clear
  ```

### Data Not Syncing

**Issue: Habits not appearing**
- Check Firebase: Settings > Rules
- Verify rules allow read/write for authenticated users
- Check internet connection

**Issue: Progress not saving**
- Check user is logged in
- Check Firebase Database has correct structure
- Check browser console for errors (press `j`)

---

## Architecture

### Authentication Flow

```
1. App Starts
   ↓
2. Check Firebase Auth State
   ↓
3. If Logged In → Show Home Screen
   If Not Logged In → Show Login Screen
   ↓
4. User Clicks "Sign in with Google"
   ↓
5. Google OAuth Popup
   ↓
6. Firebase Auth Credential Created
   ↓
7. User Object Set → Home Screen Shows
```

### Data Flow

```
User Action
   ↓
React State Update
   ↓
Firebase Realtime Database Write
   ↓
onValue Listener Triggered
   ↓
Component Re-render
   ↓
UI Updated
```

### Component Hierarchy

```
App (Main)
├── LoginScreen (if not authenticated)
└── MainApp (if authenticated)
    ├── HomeScreen (default tab)
    │   ├── HabitCard (repeated for each habit)
    │   ├── ProgressSummary
    │   └── AddHabitModal
    ├── HabitDetailScreen (when habit selected)
    │   ├── Last7Days tracker
    │   ├── Stats
    │   └── EditModal
    ├── StatsScreen (tab 2)
    │   ├── QuickStats
    │   ├── Weekly Chart
    │   ├── Monthly Heatmap
    │   └── TopHabits
    └── BottomNavigation
```

---

## Common Commands

```bash
# Start development
npm start

# Clear cache and start
expo start --clear

# Install dependencies
npm install

# Update specific package
npm install expo-auth-session@latest

# Run tests (if configured)
npm test

# Build for EAS
eas build --platform android

# Deploy to web
npm run web-build
```

---

## Environment Variables

All variables are defined in `.env.local`:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_DATABASE_URL=...

# Google OAuth (NEEDS SETUP)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

**Note:** Variables prefixed with `EXPO_PUBLIC_` are accessible in React code via `process.env.EXPO_PUBLIC_*`

---

## Project Status

✅ **Completed:**
- React Native app with Expo
- Firebase Authentication (Google Sign-In)
- Habit CRUD operations
- Daily progress tracking
- Stats & analytics
- Multi-platform support (Web, Android, iOS)

⚠️ **Requires Configuration:**
- Google OAuth Client ID (see setup above)

🔄 **Future Enhancements:**
- Push notifications
- Offline data sync
- Advanced analytics
- Social features
- Custom habit reminders

---

## Support & Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/
- **Firebase Docs:** https://firebase.google.com/docs
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Maintainer:** Your Name

