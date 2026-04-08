# Immigration Guide App - React Native

## 📱 Overview
A comprehensive immigration onboarding app for legal U.S. immigration, covering all pathways, document tracking, timelines, and life setup guidance.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (Windows/Mac/Linux)

### Installation

1. **Clone or extract the project**
```bash
cd ImmigrationApp
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
expo start
# or
npm start
```

4. **Run on your device**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 📁 Project Structure

```
ImmigrationApp/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── src/
│   ├── screens/               # All screen components
│   │   ├── SplashScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── HomeScreen.js
│   │   ├── PathwayDetailScreen.js
│   │   ├── ChecklistScreen.js
│   │   ├── TimelineScreen.js
│   │   ├── LifeSetupScreen.js
│   │   ├── ResourcesScreen.js
│   │   └── GuideDetailScreen.js
│   ├── navigation/
│   │   └── TabNavigator.js    # Bottom tab navigation
│   ├── data/
│   │   └── immigrationData.js # Static data and content
│   └── components/            # Reusable components (expand as needed)
└── assets/                    # Images and icons
```

## 🎯 Features Implemented

### Core Features (MVP)
✅ **Smart Onboarding** - Personalized pathway selection
✅ **3 Immigration Tracks** - Work, Family, Student
✅ **Document Checklist** - Dynamic tracking with progress
✅ **Timeline Visualizer** - Process steps and durations
✅ **Life Setup Guides** - SSN, Banking, Credit, Jobs
✅ **Resource Finder** - Legal help and organizations
✅ **Offline Storage** - AsyncStorage for user progress

### Screen Details

1. **Onboarding Flow**
   - Location selection (in/outside US)
   - Purpose (work/family/study/protection)
   - Timeline urgency
   - Stores preferences locally

2. **Home Dashboard**
   - Progress tracking
   - Quick access to pathways
   - Tool shortcuts
   - Daily tips

3. **Pathway Details**
   - Comprehensive visa information
   - Requirements and timelines
   - Step-by-step process
   - Links to checklists

4. **Document Checklist**
   - Category-based organization
   - Check/uncheck functionality
   - Progress tracking
   - Export capability (UI ready)

5. **Timeline Visualizer**
   - Visual process steps
   - Time estimates
   - Speed-up options
   - Common delays warnings

6. **Life Setup Guide**
   - SSN application process
   - Banking without history
   - Credit building plan
   - Job search resources

7. **Resources Screen**
   - Search functionality
   - Category filtering
   - Emergency hotlines
   - Nearby resources (location-based)

## 🛠️ Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage
- **UI Components**: React Native Elements
- **Icons**: Emoji icons (production: use react-native-vector-icons)
- **State Management**: React Hooks (useState, useEffect)

## 📲 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Web (if needed)
```bash
expo build:web
```

## 🔧 Customization Guide

### Adding New Pathways
1. Add data to `src/data/immigrationData.js`
2. Update pathway cards in `HomeScreen.js`
3. Add specific details in `PathwayDetailScreen.js`

### Modifying Checklists
1. Edit checklist data in `ChecklistScreen.js`
2. Add new categories in the `getChecklistData()` function

### Adding Languages
1. Create language files in `src/locales/`
2. Implement i18n library (react-native-localize)
3. Add language selector in settings

### Styling Changes
- Colors: Update primary color `#2E86AB` throughout
- Fonts: Add custom fonts in `app.json`
- Spacing: Modify padding/margin in StyleSheet objects

## 🚦 Next Steps for Development

### Phase 2 Features
- [ ] User authentication
- [ ] Cloud sync with backend
- [ ] Push notifications
- [ ] Spanish language support
- [ ] Document scanner
- [ ] PDF export functionality
- [ ] In-app chat support

### Backend Integration
```javascript
// Example API integration
const API_URL = 'https://your-api.com';

// In your screens:
const fetchUserData = async () => {
  try {
    const response = await fetch(`${API_URL}/user`);
    const data = await response.json();
    // Handle data
  } catch (error) {
    console.error(error);
  }
};
```

### Database Schema (Future)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  pathway VARCHAR(50),
  created_at TIMESTAMP
);

-- Progress table
CREATE TABLE progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  checklist_item VARCHAR(255),
  completed BOOLEAN,
  completed_at TIMESTAMP
);
```

## 🐛 Common Issues & Solutions

### Issue: Metro bundler error
```bash
# Clear cache
expo start -c
```

### Issue: Dependencies not found
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: iOS Simulator not opening
```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

## 📄 License
MIT License - Free to use and modify

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## 📞 Support
For issues or questions, please create an issue in the repository.

## 🎉 Ready to Launch!

The app is now ready for development. Open it in Visual Studio Code and run:

```bash
code .
npm start
```

Then press `i` for iOS or `a` for Android to see your app running!
