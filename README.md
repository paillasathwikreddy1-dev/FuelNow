# FuelNow — Emergency Fuel Delivery & Assistance Platform

> **Hackathon-Grade Emergency Roadside Assistance & Predictive Mobility Infrastructure**

FuelNow connects stranded drivers with nearby certified fuel stations and delivery riders. With one-tap GPS locking, real-time multi-factor ETA prediction, nearest-partner algorithmic dispatch, and interactive tracking maps, FuelNow delivers emergency petrol and diesel directly to stranded vehicles on highways and urban corridors.

---

## Key Features

1. **Prioritized Above-the-Fold Dispatch**:
   - Immediate **"Need fuel right now?"** emergency card.
   - Live browser GPS location acquisition with manual pin fallback.
   - Petrol & Diesel selection with bounded safety canister sizes (1L, 2L, 5L, 10L, custom).
   - Instant primary action: **"Request Emergency Fuel"**.

2. **5-Step Handover Progression System**:
   - `Request Created` → `Searching Nearby` → `Partner Assigned` → `Fuel On The Way` → `Delivered`.
   - Real-time animated status progression bar.

3. **Data Science & ML Engine**:
   - **Multi-Factor Predictive ETA**: Models transit speed curves, time-of-day traffic congestion (morning/evening rush hour multipliers, late-night dispatch latency), and station canister prep time.
   - **Nearest Partner Matching Algorithm**: Multi-criteria weighted scoring evaluating distance, station fuel reserves (Petrol/Diesel), and rider availability.
   - **Spatial Distress Heatmap (KDE)**: Kernel Density Estimation clusters historical roadside distress signals to identify high-risk transit zones.
   - **Operational Demand Analytics**: Real-time aggregation of today's requests, fuel type split (Petrol vs. Diesel), and fleet utilization.

4. **Multi-Role Workspaces**:
   - **Customer Dashboard** (`/dashboard`): One-tap dispatch, live telemetry, and saved emergency pins.
   - **Rider Dashboard** (`/rider`): Online/offline dispatch toggle, periodic GPS tracking, and step action buttons (`Accept Request` → `Start Delivery` → `Arrived` → `Delivered`).
   - **Fuel Station Hub** (`/station`): Inventory reserve sliders (Petrol / Diesel liters), station status toggle, and sector catchment orders.
   - **Admin Command Console** (`/admin`): Live emergency requests map, request queue, demand analytics, and fleet telemetry.

5. **Resilient Map Architecture**:
   - **OpenStreetMap Tiles**: Default zero-configuration tile provider (Leaflet-inspired interactive rendering without requiring a paid API key).
   - **Google Maps Ready**: Toggle seamlessly to Google Maps by setting `VITE_GOOGLE_MAPS_API_KEY`.
   - Accurate browser GPS lock, station pins, rider marker, and animated route lines.

6. **Supabase Backend & Security**:
   - PostgreSQL schema with Row Level Security (RLS) policies.
   - Real email/password authentication with session persistence.
   - Tables: `profiles`, `fuel_stations`, `riders`, `fuel_requests`, `delivery_tracking`, `notifications`.
   - Built-in zero-config fallback: Includes pre-seeded registered stations, riders, and demo records so judges can test immediately without configuring a database.

---

## Project Structure

```
FuelNow/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/
│   │   │   │   ├── FuelNowMap.tsx       # Interactive Leaflet / OSM map
│   │   │   │   ├── mapSafety.ts         # Coordinate bounds validation
│   │   │   │   └── mapFallback.ts       # Fallback & error states
│   │   │   ├── DashboardLayout.tsx      # Sidebar & mobile navigation
│   │   │   └── ui/                      # Radix / shadcn UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx          # Supabase Auth provider
│   │   ├── lib/
│   │   │   └── supabase.ts              # Supabase client & config check
│   │   ├── pages/
│   │   │   ├── Home.tsx                 # High-conversion Landing Page
│   │   │   ├── Login.tsx                # Email/Password Login
│   │   │   ├── Signup.tsx               # Driver / Rider / Station Registration
│   │   │   ├── ForgotPassword.tsx       # Password recovery flow
│   │   │   ├── Dashboard.tsx            # Above-the-fold Customer Dashboard
│   │   │   ├── Request.tsx              # Emergency dispatch flow
│   │   │   ├── Tracking.tsx             # Live Telemetry Tracking
│   │   │   ├── MyRequests.tsx           # Customer Order History
│   │   │   ├── SavedLocations.tsx       # Quick Dispatch Pins
│   │   │   ├── Notifications.tsx        # Activity Stream
│   │   │   ├── Profile.tsx              # Driver & Vehicle Profile
│   │   │   ├── HelpSafety.tsx           # Roadside Safety & 24/7 Hotline
│   │   │   ├── RiderDashboard.tsx       # Fleet Rider Hub
│   │   │   ├── StationDashboard.tsx     # Station Depot & Stock
│   │   │   └── Admin.tsx                # Ops Command Console
│   │   ├── services/
│   │   │   ├── dataScienceService.ts    # ETA Model, Matching Algorithm, KDE
│   │   │   ├── fuelDataService.ts       # Unified Supabase Data Layer
│   │   │   └── fuelServices.ts          # Service contracts & mocks
│   │   ├── App.tsx                      # Route declarations
│   │   └── index.css                    # Dark charcoal & emergency amber design
├── server/
│   ├── _core/                           # Express server core
│   ├── db.ts                            # Server database adapter
│   ├── routers.ts                       # tRPC API endpoints
│   ├── fuelnow.datascience.test.ts      # Unit tests for ML models
│   ├── fuelnow.requests.test.ts         # Unit tests for request lifecycle
│   └── fuelnow.coordinates.test.ts     # Coordinate safety tests
├── shared/
│   └── types.ts                         # Unified TypeScript definitions
├── supabase/
│   └── schema.sql                       # Complete PostgreSQL DDL & RLS
├── .env.example                         # Documented environment variables
└── package.json
```

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment parameters:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Map Provider ('osm' or 'google')
VITE_MAP_PROVIDER=osm
VITE_GOOGLE_MAPS_API_KEY=
VITE_ROUTING_API_KEY=

PORT=3000
```

> **Note**: If Supabase variables are left empty, FuelNow automatically activates its resilient in-memory client with pre-seeded stations and riders so evaluators can test the entire dispatch lifecycle immediately!

### 3. Setting Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Copy your **Project URL** and **Anon Key** from `Project Settings > API` into `.env.local`.

### 4. Running the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the FuelNow platform.

### 5. Running Automated Tests

```bash
npm test
```

---

## Emergency Request Flow Walkthrough

```
[Stranded Driver]
       │
       ▼
Select Fuel (Petrol / Diesel) & Canister Size (1L - 10L)
       │
       ▼
Click [ Detect My Location ] (Acquires real browser GPS)
       │
       ▼
Click "Request Emergency Fuel"
       │
       ▼
Data Science Partner Matching
  ├─ Filters stations by fuel stock & distance
  ├─ Filters available riders
  └─ Computes composite score
       │
       ▼
Predictive ETA Engine
  ├─ Calculates base transit time (Haversine km)
  ├─ Multiplies by peak hour congestion curve
  └─ Adds canister prep latency (3-5 mins)
       │
       ▼
Persists Fuel Request to Database (`fuel_requests`)
       │
       ▼
Real-time Dispatch Telemetry (`delivery_tracking`)
  ├─ Rider accepts request (`status: accepted`)
  ├─ Rider navigates en route (`status: on_the_way`)
  ├─ Rider arrives at vehicle (`status: arrived`)
  └─ Handover confirmed (`status: delivered`)
```

---

## Deployment Notes

- **Vite Build**: `npm run build` generates optimized production assets in `dist/public`.
- **Node Production Server**: `npm run start` launches the Express server serving API routes and production static bundle.
- **Vercel / Netlify**: Connect the repository, specify Build command `npm run build`, and set Publish directory to `dist/public`.
"# FUEL-NOW" 
