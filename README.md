# StreakFlow

A free habit tracking mobile app built with Expo and React Native. Track your daily habits, build streaks, and visualize your progress with heatmaps.

## Features

- **Habit Tracking** - Create and manage daily habits with customizable frequency
- **Streak Tracking** - Build and maintain streaks to stay motivated
- **Progress Visualization** - View your consistency with heatmap widgets
- **Statistics** - Track your performance with detailed stats
- **Home Screen Widgets** - Android widgets for heatmap, stats, and today's tasks
- **Onboarding Flow** - Guided setup for new users
- **Dark/Light Theme** - Automatic theme switching based on system preferences
- **100% Free** - All features available at no cost

## Tech Stack

- **Framework**: Expo SDK 54 with Expo Router
- **UI**: React Native with Reanimated for animations
- **State Management**: Zustand
- **Data Validation**: Zod
- **Fonts**: Inter (via @expo-google-fonts)
- **Platform**: iOS and Android (phone only)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Bun (package manager)
- Expo CLI
- Xcode (for iOS) or Android Studio (for Android)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd streakflow
```

2. Install dependencies:
```bash
bun install
```

### Running the App

Start the development server:
```bash
bun run dev
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

Or run directly:
```bash
bun run ios
bun run android
```

### Building for Production

```bash
bun run build
```

For EAS Build:
```bash
eas build --platform all
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Expo development server |
| `bun run build` | Build the app |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run ios` | Run on iOS simulator |
| `bun run android` | Run on Android emulator |

## Project Structure

```
streakflow/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── today.tsx      # Today's habits
│   │   ├── stats.tsx      # Statistics screen
│   │   └── settings.tsx   # Settings screen
│   ├── add-habit.tsx      # Add new habit screen
│   ├── onboarding.tsx     # Onboarding flow
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── modules/               # Native modules
├── server/                # Server-side code (if any)
├── store/                 # Zustand stores
│   ├── habitsStore.tsx    # Habits state management
│   ├── userStore.tsx      # User state management
│   └── themeStore.tsx     # Theme state management
├── widgets/               # Android home screen widgets
├── assets/                # Images, fonts, etc.
└── constants/             # App constants and config
```

## Android Widgets

The app includes three home screen widgets:
- **Heatmap** (4x2) - Visualize habit consistency
- **Stats** (2x2) - Display current streak and today's progress
- **Tasks** (2x3) - Show today's habits checklist

## License

Private - All rights reserved
