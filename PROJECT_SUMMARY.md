# AutoAssist – Full Project Summary

A complete summary of everything built and done in this app.

---

## 1. Project Overview

**AutoAssist** is an Expo React Native (TypeScript) mobile app for roadside assistance and auto services. It supports three roles:

- **User** – Request emergency mechanics, book appointments, shop parts, manage profile
- **Mechanic** – Accept service requests, manage jobs and bookings
- **Seller** – Store and orders (placeholder screens)

The app uses **Supabase** for auth, Postgres, RLS, Realtime, and Storage. The UI uses a **cartoon-style** design system with offset shadows, hatching effects, and a playful color palette.

---

## 2. Tech Stack

| Area | Technology |
|------|------------|
| Framework | Expo ~54, React 19, React Native 0.81 |
| Language | TypeScript |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Auth / DB | Supabase (Auth + Postgres + Realtime + Storage) |
| State | Zustand (auth store, cart store) |
| Forms | React Hook Form + Zod (@hookform/resolvers) |
| Other | Expo Location, Expo Notifications, Expo Image Picker, AsyncStorage, react-native-safe-area-context |

---

## 3. App Structure (`src/`)

```
src/
├── api/                    # Axios client (optional REST API)
├── components/
│   ├── ui/                 # Design system
│   │   ├── CartoonStoreHeader, CartoonFeaturedCard, CartoonProductCard
│   │   ├── CartoonCategoryCard, CartoonProfileAvatar, CartoonVehicleCard
│   │   ├── CartoonMenuRow, SketchFill
│   │   ├── Screen, Button, Input, Card, Header
│   │   ├── HeroCard, ActionCard, ActivityItem, PromoBanner
│   │   ├── SearchingRadar, ServiceDetailsCard
│   │   ├── StoreHeader, StoreSearchBar, CategoryPills, ProductCard
│   │   └── HomeHeader, ProfileAvatar, VehicleCard, MenuRow
│   ├── LoadingScreen.tsx   # Branded loading screen (logo, tagline)
│   ├── ScreenContainer.tsx
│   └── index.ts
├── features/
│   ├── auth/               # Login, Register (schemas + screens)
│   ├── user/               # User role screens
│   │   ├── HomeScreen
│   │   ├── BookingsScreen
│   │   ├── UserStoreScreen
│   │   ├── CartScreen
│   │   ├── SearchingScreen
│   │   ├── ActiveJobScreen
│   │   ├── ProfileScreen
│   │   ├── EditProfileScreen
│   │   ├── SettingsScreen
│   │   ├── AddVehicleScreen
│   │   ├── MyVehiclesScreen
│   │   └── PaymentMethodsScreen
│   ├── booking/            # MechanicList, MechanicProfile, Booking, BookingSuccess
│   ├── mechanic/           # Requests, Jobs, ActiveJob, MechanicBookings, Profile
│   └── seller/             # Store, Orders, Profile (placeholders)
├── hooks/                  # useAuth
├── lib/                    # supabase, authHelpers, mechanicHelpers
├── navigation/             # AuthStack, UserStack, MechanicStack, SellerTabs, RootNavigator
├── store/                  # authStore, cartStore
├── theme/                  # theme.ts (colors, spacing, typography, cartoon palette)
├── types/                  # user, navigation, booking
└── utils/                  # location (getCurrentPosition, distanceKm)
```

---

## 4. Design System

### Theme (`src/theme/theme.ts`)

- **Primary colors:** red (#C41E3A), dark background (#0D1117)
- **Cartoon palette:** red (#FF4D5A), cream (#FFF4F4), mint (#7EEAB3), blue (#6EC6FF), yellow (#FFD66B), purple (#C4A1FF), orange (#FFB067)
- **Spacing:** xs(4), sm(8), md(16), lg(24), xl(32)
- **Radius:** sm(6), md(12), lg(18), xl(24)

### Cartoon UI Pattern

- **Offset shadow:** Cards use a light accent background layer with black border lines, offset (top: 4, left: 4)
- **SketchFill:** Diagonal hatching lines in shadow areas for a retro/sketch look
- **Cartoon components:** CartoonStoreHeader, CartoonFeaturedCard, CartoonProductCard, CartoonCategoryCard, CartoonProfileAvatar, CartoonVehicleCard, CartoonMenuRow

### Loading Screen

- AutoAssist logo (car-wrench icon), tagline “Your roadside companion”, ActivityIndicator in cartoon red

---

## 5. Authentication and Roles

- **Auth:** Supabase Auth (email/password)
- **Register:** Name, email, password, optional phone, role (user | mechanic | seller)
- **Profile:** Trigger `handle_new_user()` creates `profiles` row with id, name, email, role
- **State:** Zustand `authStore` holds user, session, profile, isAuthenticated, isLoading
- **Routing:** RootNavigator → AuthStack (not logged in) or role-based stack (User / Mechanic / Seller)
- **Mechanic role:** `ensureMechanicRoleAndRow` creates `mechanics` row when user signs up as mechanic

---

## 6. User Features (Full Implementation)

### Home

- **Request mechanic:** Creates request with GPS location, navigates to Searching screen
- **Book mechanic:** Opens MechanicList
- **Shop Parts:** Compact product cards, add to cart, “See All” → Store tab
- **Recent Activity:** Real requests and bookings from Supabase

### Store

- Cartoon-style store with featured product, categories, popular products
- Add to cart from any product
- Cart icon in header with badge count
- “See All” scrolls to products section

### Cart

- Modal presentation
- List items, remove, clear cart
- **Checkout:** Creates `orders` row + `order_line_items`, clears cart, shows confirmation

### Bookings

- List of user bookings with mechanic names (joined from mechanics + profiles)
- “Book a mechanic” → MechanicList

### Mechanic Flow

- MechanicList → MechanicProfile → Booking (date/time) → BookingSuccess

### Searching

- Waiting screen while request is pending
- Cancel sets status to `cancelled` in Supabase
- Realtime: when status = accepted → navigate to ActiveJob

### Active Job

- View request status, details, location

### Profile (Cartoon Style)

- **Identity:** Avatar, name, email, Premium badge
- **Edit Profile:** Opens EditProfileScreen → update name/email in Supabase
- **Change Photo:** expo-image-picker → upload to Supabase Storage (avatars bucket) → update `profiles.avatar_url`
- **My Garage:** Real vehicles from `user_vehicles`, or “Add your first vehicle”
- **Stats:** Vehicle count, Services, Rating
- **Account menu:**
  - **Payment Methods** → Add/list/remove cards (last 4 digits, demo)
  - **Service History** → Bookings
  - **Settings** → Push notifications toggle (AsyncStorage)
  - **Help & Support** → Contact info
- **Sign Out:** Red button with confirmation

### Edit Profile

- Name, email fields
- Save updates `profiles` in Supabase, refreshes auth state

### Settings

- Push notifications toggle persisted in AsyncStorage

### Add Vehicle

- Make, model, year, license plate
- Inserts into `user_vehicles`

### My Vehicles

- List vehicles from `user_vehicles`
- Add, remove
- Link to Bookings

### Payment Methods

- Add cards (last 4 digits, brand for demo)
- List, set default, remove
- Uses `user_payment_methods` table

---

## 7. Mechanic Features

- **Requests (RequestsNearbyScreen):** Pending requests, optional distance, Accept assigns mechanic
- **Jobs:** Active job, “View job” → ActiveJob
- **ActiveJob:** Request details, status, customer location
- **Bookings:** Mechanic appointments
- **Profile:** Sign Out

---

## 8. Seller Features

- **Store, Orders, Profile:** Placeholder screens

---

## 9. Supabase Backend

### Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (id, name, email, avatar_url, role) |
| mechanics | Mechanic profiles (workshop_name, rating, availability) |
| sellers | Seller profiles |
| mechanic_locations | Mechanic lat/lng for distance |
| requests | Service requests (user, mechanic, status, location) |
| bookings | Appointments (user, mechanic, date, time) |
| products | Store products (seller, name, price) |
| orders | User orders (user, total, status) |
| order_items | Order line items (product_id) |
| order_line_items | Order line items by name/price (for cart checkout) |
| ratings | User ratings of mechanics |
| user_vehicles | User vehicles (make, model, year, license_plate) |
| user_payment_methods | Payment methods (brand, last4, is_default) |

### Enums

- user_role, request_status, booking_status, order_status, availability_status

### Migrations

- `00000000000000_full_autoassist_schema.sql` – Full schema
- `20250210120000_01_enums_and_profiles.sql` – Enums, profiles
- `20250210120001_02_mechanics_sellers_locations.sql` – Mechanics, sellers, locations
- `20250210120002_03_requests_bookings.sql` – Requests, bookings
- `20250210120003_04_products_orders.sql` – Products, orders, order_items
- `20250210120004_05_ratings.sql` – Ratings
- `20250210120005_06_indexes_rls.sql` – Indexes, RLS
- `20250210120006` – `20250210120009` – Profile fixes, phone→email, RLS
- `20250210130000_realtime_requests.sql` – Realtime for requests
- `20250210140000_mechanic_pending_requests_rls.sql` – Mechanic RLS
- `20250210150000_users_select_mechanics.sql` – Users can select mechanics
- `20250210160000_seed_mechanics.sql` – Demo mechanics
- `20250212120000_user_vehicles.sql` – user_vehicles
- `20250212120001_profiles_avatar_url.sql` – avatar_url on profiles
- `20250212120002_user_payment_methods.sql` – user_payment_methods
- `20250212120003_storage_avatars.sql` – avatars storage bucket
- `20250212120004_orders_line_items.sql` – order_line_items for checkout

### Storage

- **avatars bucket:** Profile photos (path: `{user_id}/avatar.jpg`)

### Realtime

- User: subscribe to request by id → navigate to ActiveJob when accepted
- Mechanic: subscribe to new pending requests

---

## 10. State Management

- **authStore:** session, user, profile, isAuthenticated, isLoading; signIn, signUp, signOut, setSession
- **cartStore:** items (productId, name, price, quantity), addItem, removeItem, clearCart, getCount

---

## 11. Navigation

- **AuthStack:** Login, Register
- **UserStack:** UserTabs (Home, Bookings, Store, Profile) + Store, Cart (modal), Searching, ActiveJob, MechanicList, MechanicProfile, Booking, BookingSuccess, EditProfile, Settings, AddVehicle, MyVehicles, PaymentMethods
- **MechanicStack:** MechanicTabs (Requests, Jobs, Bookings, Profile) + ActiveJob
- **SellerTabs:** Store, Orders, Profile

---

## 12. Key Files

| Area | Files |
|------|-------|
| Entry | App.tsx, index.ts |
| Auth | authStore.ts, useAuth.ts, authHelpers.ts, LoginScreen, RegisterScreen |
| Cart | cartStore.ts, CartScreen |
| Theme | theme/theme.ts |
| Cartoon UI | CartoonStoreHeader, CartoonFeaturedCard, CartoonProductCard, CartoonProfileAvatar, CartoonVehicleCard, CartoonMenuRow, SketchFill |
| User | HomeScreen, UserStoreScreen, ProfileScreen, EditProfileScreen, SettingsScreen, AddVehicleScreen, MyVehiclesScreen, PaymentMethodsScreen, CartScreen |
| Booking | MechanicListScreen, MechanicProfileScreen, BookingScreen, BookingSuccessScreen |
| Mechanic | RequestsNearbyScreen, JobsScreen, ActiveJobScreen, MechanicBookingsScreen |
| Backend | supabase/migrations/*.sql, lib/supabase.ts |

---

## 13. How to Run

1. `npm install`
2. Configure `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
   ```
3. Run Supabase migrations: `supabase db push` (or apply via Dashboard)
4. Create `avatars` bucket in Supabase Dashboard (Storage) if not created by migration
5. `npx expo start` → choose device/simulator or Expo Go

---

## 14. Demo Mechanics (from seed)

| Email | Password |
|-------|----------|
| mechanic1@demo.autoassist.app | MechanicPass123! |
| mechanic2@demo.autoassist.app | MechanicPass123! |
| mechanic3@demo.autoassist.app | MechanicPass123! |

See `supabase/README_SEED_MECHANICS.md` for setup details.

---

## 15. Summary of What’s Done

- **Expo app** with TypeScript and feature-based structure
- **Cartoon design system** with offset shadows, SketchFill, cartoon palette
- **Auth:** Supabase Auth + profiles with role; Zustand; role-based routing
- **User flows:** Request mechanic, searching, active job, book mechanic, bookings
- **Store:** Cartoon store UI, cart (Zustand), checkout (orders + order_line_items)
- **Profile:** Full cartoon profile, edit profile, change photo (expo-image-picker + Storage), vehicles, payment methods, settings
- **Mechanic flows:** Pending requests, accept, active job, bookings
- **Supabase:** Full schema, RLS, triggers, Realtime, Storage
- **No placeholders:** All user-facing flows are functional

---

*This document is the full summary of the AutoAssist project as of the last update.*
