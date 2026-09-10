-- =============================================================
-- FuelNow — Emergency Fuel Delivery & Assistance Platform
-- Supabase PostgreSQL Schema & Security Policies
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. Profiles Table (Extends Supabase auth.users)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'rider', 'fuel_station', 'admin')) DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- -------------------------------------------------------------
-- 2. Fuel Stations Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fuel_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'closed')) DEFAULT 'active',
  available_petrol DOUBLE PRECISION NOT NULL DEFAULT 2500.0,
  available_diesel DOUBLE PRECISION NOT NULL DEFAULT 3500.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- -------------------------------------------------------------
-- 3. Delivery Riders Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  station_id UUID REFERENCES public.fuel_stations(id) ON DELETE SET NULL,
  vehicle_number TEXT NOT NULL,
  availability_status TEXT NOT NULL CHECK (availability_status IN ('available', 'busy', 'offline')) DEFAULT 'available',
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  last_location_update TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- -------------------------------------------------------------
-- 4. Fuel Requests Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fuel_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel')),
  quantity_liters DOUBLE PRECISION NOT NULL CHECK (quantity_liters > 0),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'searching', 'assigned', 'accepted', 'on_the_way', 'arrived', 'delivered', 'cancelled')) DEFAULT 'pending',
  assigned_station_id UUID REFERENCES public.fuel_stations(id) ON DELETE SET NULL,
  assigned_rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
  estimated_distance DOUBLE PRECISION,
  estimated_time INTEGER, -- minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- -------------------------------------------------------------
-- 5. Delivery Tracking Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.fuel_requests(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- -------------------------------------------------------------
-- 6. Notifications Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.fuel_requests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- -------------------------------------------------------------
-- Indexes for Performance
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_requests_user ON public.fuel_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.fuel_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_rider ON public.fuel_requests(assigned_rider_id);
CREATE INDEX IF NOT EXISTS idx_riders_status ON public.riders(availability_status);
CREATE INDEX IF NOT EXISTS idx_tracking_request ON public.delivery_tracking(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- -------------------------------------------------------------
-- Row Level Security (RLS)
-- -------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read profiles, users can update their own
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Fuel Stations: Viewable by all authenticated, manageable by station/admin
CREATE POLICY "Fuel stations viewable by everyone" ON public.fuel_stations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Station managers and admin can update fuel stations" ON public.fuel_stations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('fuel_station', 'admin')
    )
  );

-- Riders: Viewable by all authenticated, riders update their own location
CREATE POLICY "Riders viewable by everyone" ON public.riders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Riders can update their own status" ON public.riders
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Fuel Requests:
-- 1. Customers can select their own requests
-- 2. Riders can select requests assigned to them
-- 3. Stations can select requests assigned to their station
-- 4. Admins can select all requests
CREATE POLICY "Requests access policy" ON public.fuel_requests
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR assigned_rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid())
    OR assigned_station_id IN (SELECT id FROM public.fuel_stations WHERE phone = (SELECT phone FROM public.profiles WHERE id = auth.uid()))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Customers can create fuel requests" ON public.fuel_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Riders, stations and owners can update requests" ON public.fuel_requests
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR assigned_rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Delivery Tracking:
CREATE POLICY "Tracking viewable by request participants" ON public.delivery_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fuel_requests r
      WHERE r.id = delivery_tracking.request_id
      AND (
        r.user_id = auth.uid()
        OR r.assigned_rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      )
    )
  );

CREATE POLICY "Riders can insert tracking coordinates" ON public.delivery_tracking
  FOR INSERT TO authenticated
  WITH CHECK (
    rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Notifications:
CREATE POLICY "Users view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- -------------------------------------------------------------
-- User Auto-Profile Trigger on Auth Signup
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'FuelNow Driver'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -------------------------------------------------------------
-- Seed Initial Registered Fuel Stations & Riders
-- -------------------------------------------------------------
INSERT INTO public.fuel_stations (id, name, address, latitude, longitude, phone, status, available_petrol, available_diesel)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Central Express Fuel Hub', 'Ring Road Sector 4, Connaught Hub', 28.6315, 77.2167, '+91 98765 43210', 'active', 4500.0, 5200.0),
  ('22222222-2222-2222-2222-222222222222', 'Apex Highway Petroleum Hub', 'NH-48 Corridor Mile 12, South Gate', 28.5823, 77.1645, '+91 98765 43211', 'active', 3800.0, 4100.0),
  ('33333333-3333-3333-3333-333333333333', 'Metro Rapid Response Depot', 'Outer Bypass Junction, Sector 21', 28.6582, 77.2412, '+91 98765 43212', 'active', 5100.0, 6000.0),
  ('44444444-4444-4444-4444-444444444444', 'West Highway Fuel Point', 'Ring Road West Expressway KM 4', 28.6189, 77.1234, '+91 98765 43213', 'active', 2900.0, 3200.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.riders (id, station_id, vehicle_number, availability_status, current_latitude, current_longitude)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'DL-01-FN-1082', 'available', 28.6380, 77.2100),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'DL-04-FN-2048', 'available', 28.5890, 77.1710),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'DL-07-FN-3091', 'available', 28.6620, 77.2350)
ON CONFLICT (id) DO NOTHING;
