# 🎯 Habit Tracker App

A daily habit tracking app with gamification, analytics, and Google Sign-In authentication.

**📖 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions!**

## Features ⭐

- **Gamification System**
  - Earn XP for daily completions (50 XP per habit)
  - Level up every 3000 XP
  - Track streaks with fire emoji 🔥
  - 5 achievement levels: Apprentice → Master

- **Habit Management**
  - Quick add via 5 bundles (Fitness, Learning, Wellness, Productivity, Social)
  - Custom habit creation
  - Edit habit names inline
  - Delete habits
  - Checkbox for daily completion

- **Analytics & Stats**
  - Weekly completion bar charts (color-coded)
  - Monthly calendar heatmap (GitHub-style, January 2026)
  - Quick stats widget (streak, best streak, completed, success rate)
  - Top performing habits (dynamic ranking)
  - 7-day completion grid per habit

- **Authentication & Security**
  - Google Sign-In integration
  - Firebase Authentication
  - Secure user sessions
  - Sign-out functionality

- **Design**
  - Dark neon theme (#0f0f1e background, #ff006e pink, #00D4FF cyan)
  - Responsive layout for all screen sizes
  - Smooth animations with Reanimated
  - Haptic feedback for interactions

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- `expo-cli` installed
- Firebase project (habit-tracker-73d53)
- Google OAuth credentials

### Installation

```bash
# 1. Navigate to app
cd d:\tracker\app

# 2. Install dependencies  
npm install

# 3. Set up Google OAuth (see GOOGLE_OAUTH_SETUP.md)

# 4. Start development server
npx expo start --clear

# 5. Open in browser (press 'w') or scan QR code
```

## 🔐 Google OAuth Setup

**Required for authentication to work!**

See `GOOGLE_OAUTH_SETUP.md` for step-by-step instructions to:
1. Get Google Client ID from Google Cloud Console
2. Add authorized redirect URIs  
3. Enable Google Sign-In in Firebase
4. Add Client ID to `.env.local`

Takes ~5 minutes.

## 📱 Run on Different Platforms

```bash
npx expo start

# Web (Recommended for initial testing)
Press 'w'

# Android (requires EAS or emulator)
Press 'a'  

# iOS (requires Mac)
Press 'i'

# Or use EAS Build for actual devices
eas build --platform ios --platform android
```

## 📁 Project Structure

```
app/
├── App.js                           # Main component (auth, nav, logic)
├── components/
│   ├── LoginScreen.js               # Google Sign-In UI
│   ├── HomeScreen.js                # All habits list
│   ├── HabitDetailScreen.js         # Individual habit view
│   ├── StatsScreen.js               # Charts & analytics
│   ├── LevelProgress.js             # XP bar
│   ├── QuickStats.js                # Stats summary
│   └── HabitCard.js                 # Habit UI component
├── .env.local                       # Firebase & Google config
├── package.json                     # Dependencies
├── app.json                         # Expo config
│
├── GOOGLE_OAUTH_SETUP.md            # OAuth setup guide
├── DEPLOYMENT_GUIDE.md              # Testing & deploy steps
├── ISSUES_RESOLVED.md               # Error fixes summary
└── README.md                        # This file
```

```
app/
├── App.js                    # Main app component
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── babel.config.js           # Babel configuration
├── .env.example              # Environment template
└── assets/                   # Icons and splash
```

## 🎮 Gamification System

### How XP Works
- Each habit completion = 50 XP (default, customizable)
- Earn 3000 XP to level up
- 5 levels with titles: Apprentice → Novice → Adept → Expert → Master

### Streaks
- Increase by 1 for each consecutive day completed
- Resets if you miss a day
- Displayed with fire emoji 🔥
- Visual indicator in habit cards

### Achievements
- Total habits completed
- Success rate (% of days completed)
- Current & best streak tracking
- Top habits ranking

## 🗄️ Database Schema (Firebase)

```
habits/
  ├── habit_id_1/
  │   ├── name: "Read Books"
  │   ├── icon: "📚"
  │   ├── xp: 50
  │   ├── streak: 5
  │   ├── color: "#9d4edd"
  │   └── createdAt: "2026-01-02T00:00:00.000Z"
  └── habit_id_2/
      └── ...

progress/
  ├── 2026-01-02/
  │   ├── habit_id_1: true
  │   ├── habit_id_2: false
  │   └── ...
  └── 2026-01-01/
      └── ...
```

## 🔑 Environment Variables

Create `.env.local`:
```dotenv
# Firebase config (already filled)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCtJYxX_8XvE8WqPnZz_eUZl3K9WfF_8I8
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=habit-tracker-73d53.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=habit-tracker-73d53
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=habit-tracker-73d53.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=950519648263
EXPO_PUBLIC_FIREBASE_APP_ID=1:950519648263:web:5f8c7e9d2a1b4c6f
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://habit-tracker-73d53-default-rtdb.asia-southeast1.firebasedatabase.app

# Google OAuth (get from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

## 🛠️ Development

### Start Dev Server
```bash
npx expo start --clear
```

### Available Commands
- `w` - Web preview
- `a` - Android emulator
- `i` - iOS simulator
- `j` - Open debugger
- `r` - Reload app
- `m` - Toggle menu
- `Shift+M` - More tools
- `?` - Show all commands

### Hot Reload
Code changes auto-reload in dev mode. Manual reload with `r`.

## 🚀 Deployment

### Web
```bash
npx expo export --platform web
# Deploy dist folder to Vercel, Netlify, etc.
```

### Mobile (EAS Build - Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android & iOS
eas build --platform android --platform ios

# Submit to stores
eas submit --platform android --latest
eas submit --platform ios --latest
```

See `DEPLOYMENT_GUIDE.md` for detailed steps.

## 🐛 Troubleshooting

### "Google Client ID not configured"
→ Follow `GOOGLE_OAUTH_SETUP.md` to get your OAuth credentials

### "Firebase connection failed"
→ Check `.env.local` has all keys
→ Verify internet connection
→ Check Firebase Database rules

### "TurboModule error on Expo Go"
→ Use EAS Build instead: `eas build --platform android`
→ Known Expo Go limitation with newer native modules

### "Metro bundler error"
→ Clear cache: `npx expo start --clear`
→ Delete `node_modules` and reinstall: `npm install`

### "Habits not saving"
→ Check Firebase Database is enabled
→ Verify user is authenticated
→ Check browser console for errors

## 📊 Features Status

- ✅ Add/edit/delete habits
- ✅ Daily check-ins with checkbox
- ✅ Real-time Firebase sync
- ✅ XP and level system
- ✅ Streak tracking
- ✅ Weekly & monthly stats
- ✅ Charts and heatmaps
- ✅ Google Sign-In
- ✅ User authentication
- ✅ Dark neon theme
- ✅ Responsive UI
- ✅ Haptic feedback
- ⏳ Push notifications (planned)
- ⏳ Offline support (planned)

## 📚 Documentation

- `GOOGLE_OAUTH_SETUP.md` - Get Google credentials
- `DEPLOYMENT_GUIDE.md` - Testing & deployment guide
- `ISSUES_RESOLVED.md` - Problems that were fixed
- `FIREBASE_SETUP.md` - Firebase configuration

## 🎨 Design

**Theme Colors**
- Dark Background: `#0f0f1e`
- Primary Pink: `#ff006e`  
- Secondary Purple: `#9d4edd`
- Accent Cyan: `#00D4FF`
- Dark Surface: `#1a1a2e`
- Text: `#FFFFFF` / `#a0a0b0`

## 📱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React Native 0.74, Expo 54 |
| UI | React Native, LinearGradient, Reanimated |
| Auth | Firebase Auth + Google OAuth |
| Database | Firebase Realtime Database |
| Hosting | Expo (web), EAS Build (mobile) |
| Build | Metro Bundler, Babel |

## 📞 Support

For issues:
1. Check relevant `.md` guide files
2. Review Metro Bundler console output
3. Check Firebase Console logs
4. Verify `.env.local` configuration

## 📝 Version

- **v1.0.0** - Jan 2, 2026
- Production ready with authentication
- All core features implemented

## 📄 License

Private project - All rights reserved

---

**Status:** ✅ Production Ready  
**Next Step:** Get Google OAuth Client ID from Google Cloud Console  
**Setup Time:** ~10 minutes total

For questions, see the relevant guide:
- Auth issues? → `GOOGLE_OAUTH_SETUP.md`
- Deploy issues? → `DEPLOYMENT_GUIDE.md`
- What was fixed? → `ISSUES_RESOLVED.md`
````
```bash
npm run web
```

## 🛠️ Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

Follow Expo documentation for app store submissions.

## 📊 Database Structure (Firebase Realtime Database)

```
habit-tracker/
├── habits/
│   ├── habit1/
│   │   ├── name: "Morning Run"
│   │   └── createdAt: "2024-01-15T10:30:00Z"
│   └── habit2/
│       ├── name: "Meditation"
│       └── createdAt: "2024-01-14T15:45:00Z"
│
└── progress/
    └── 2024-01-15/
        ├── habit1: true
        └── habit2: false
```

## 🎨 Customization

Edit colors in `App.js` `styles` object:
- `#0f0f1e` - Primary background
- `#16213e` - Secondary background
- `#ff006e` - Accent color
- `#9d4edd` - Glow color

## 🆘 Troubleshooting

### "Firebase initialization failed"
- Check `.env.local` has correct credentials
- Verify Firebase project is active

### "Module not found"
- Run `npm install`
- Clear cache: `npm start -- --clear`

### "Emulator not starting"
- Ensure Xcode (iOS) or Android Studio installed
- Try `expo build:ios` or `expo build:android`

## 📖 More Info

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [React Native](https://reactnative.dev/)

