# AutoAssist

Expo React Native (TypeScript) multi-role app for **User**, **Mechanic**, and **Seller** with auth, role-based tabs, and a scalable `src/` architecture.

## Tech stack

- **Expo** + **TypeScript**
- **React Navigation** (native stack + bottom tabs)
- **Zustand** (auth state)
- **Axios** (API client)
- **React Hook Form** + **Zod** (forms & validation)
- **Expo Location** & **Expo Notifications**

## Folder structure

```
gradeProject/
├── App.tsx
├── app.json
├── index.ts
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── assets/
└── src/
    ├── api/
    │   ├── client.ts
    │   └── index.ts
    ├── components/
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── ScreenContainer.tsx
    │   └── index.ts
    ├── features/
    │   ├── auth/
    │   │   ├── schemas/
    │   │   │   ├── loginSchema.ts
    │   │   │   └── registerSchema.ts
    │   │   └── screens/
    │   │       ├── LoginScreen.tsx
    │   │       └── RegisterScreen.tsx
    │   ├── user/
    │   │   └── screens/
    │   │       ├── HomeScreen.tsx
    │   │       ├── BookingsScreen.tsx
    │   │       └── ProfileScreen.tsx
    │   ├── mechanic/
    │   │   └── screens/
    │   │       ├── RequestsScreen.tsx
    │   │       ├── JobsScreen.tsx
    │   │       └── ProfileScreen.tsx
    │   ├── seller/
    │   │   └── screens/
    │   │       ├── StoreScreen.tsx
    │   │       ├── OrdersScreen.tsx
    │   │       └── ProfileScreen.tsx
    │   ├── store/
    │   ├── booking/
    │   └── requests/
    ├── navigation/
    │   ├── AuthStack.tsx
    │   ├── RootNavigator.tsx
    │   ├── UserTabs.tsx
    │   ├── MechanicTabs.tsx
    │   ├── SellerTabs.tsx
    │   └── index.ts
    ├── screens/
    │   └── index.ts
    ├── store/
    │   ├── authStore.ts
    │   └── index.ts
    ├── hooks/
    │   └── useAuth.ts
    ├── theme/
    │   ├── colors.ts
    │   ├── spacing.ts
    │   ├── typography.ts
    │   └── index.ts
    ├── types/
    │   ├── user.ts
    │   ├── navigation.ts
    │   └── index.ts
    └── utils/
        └── location.ts
```

## How to run

1. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

2. **Optional: set API base URL**

   Copy `.env.example` to `.env` and set your backend URL:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   EXPO_PUBLIC_API_URL=https://your-api.com
   ```

3. **Start the app**

   ```bash
   npx expo start
   ```

   Then:

   - Press **`a`** for Android emulator (requires Android SDK; see [Troubleshooting](#troubleshooting))
   - Press **`i`** for iOS simulator (macOS only)
   - Or scan the QR code with **Expo Go** on a device (easiest on Windows)

## Troubleshooting

### Android: "java.lang.String cannot be cast to java.lang.Boolean"

This is caused by a regression in `react-native-screens` 4.17+. The project pins `react-native-screens` to **4.16.0** to avoid it. Do not upgrade past 4.16.0 until [the fix](https://github.com/software-mansion/react-native-screens/issues/3470) is released.

### Android: "Failed to resolve the Android SDK path" / "adb is not recognized"

You need either the Android SDK (for emulator) or a physical device with Expo Go.

**Option 1 – Use your phone (no SDK needed)**  
1. Install **Expo Go** from the Play Store on your Android phone.  
2. Run `npx expo start` and scan the QR code with Expo Go (or the camera app).  
3. The app runs on your device. No `ANDROID_HOME` or emulator required.

**Option 2 – Use the Android emulator**  
1. Install [Android Studio](https://developer.android.com/studio).  
2. In Android Studio: **More Actions → Virtual Device Manager** and create an emulator.  
3. Set the Android SDK location for this project:
   - **PowerShell** (run in project folder):
     ```powershell
     .\scripts\set-android-env.ps1
     ```
   - Or set **system** env vars (Windows: "Environment variables"):
     - `ANDROID_HOME` = `C:\Users\ProjeCss\AppData\Local\Android\Sdk` (or your SDK path from Android Studio).
     - Add to **Path**: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`.  
4. Close and reopen the terminal, then run `npx expo start` and press **`a`**.

## Auth flow

- **Login** and **Register** screens use React Hook Form + Zod.
- On successful login/register, the app switches to role-based bottom tabs:
  - **User**: Home, Bookings, Profile
  - **Mechanic**: Requests, Jobs, Profile
  - **Seller**: Store, Orders, Profile
- Auth state is in Zustand (`src/store/authStore.ts`). Sign out from any Profile tab.

## API

- Axios instance: `src/api/client.ts`. Base URL from `EXPO_PUBLIC_API_URL` or default.
- Request interceptor adds `Authorization: Bearer <token>` from the auth store.
- On 401, the client calls `logout()`.

## Production readiness

- Functional components and TypeScript throughout.
- Theme (colors, spacing, typography) in `src/theme/`.
- Shared UI: `ScreenContainer`, `Button`, `Input` in `src/components/`.
- Role-based navigation and typed param lists in `src/types/navigation.ts`.
# war4tco
