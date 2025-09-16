This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# GSB: 기업 공동 셔틀 예약 플랫폼

본 프로젝트는 여러 기업의 직원들이 공동으로 셔틀 버스를 예약하고 관리할 수 있는 모바일 웹 애플리케이션입니다. Next.js 14와 Supabase를 기반으로 구축되었습니다.

## 주요 기능

- **사용자 역할 기반 시스템**: 직원(승객), 기업 관리자, 운영 관리자의 세 가지 역할을 지원합니다.
- **셔틀 예약 및 관리**: 사용자는 노선을 조회하고 원하는 시간대에 셔틀을 예약하거나 취소할 수 있습니다.
- **모바일 탑승권**: 예약 완료 시 QR 코드 형태의 모바일 탑승권이 발급됩니다.
- **관리자 대시보드**: 운영 관리자는 노선/정류장/스케줄을 관리하고, 기업 관리자는 소속 직원의 이용 현황을 확인하고 승인할 수 있습니다.
- **리워드 시스템**: 5일 연속 탑승 시 자동으로 쿠폰이 발급되는 리워드 기능이 포함되어 있습니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## GSB (Gyeonggi Shuttle Bus) Database Schema

Execute the following SQL queries in your Supabase SQL Editor to set up the necessary tables, types, and functions.

```sql
-- ### Enums
-- User roles
CREATE TYPE gsb_user_role AS ENUM ('employee', 'company_admin', 'operations_admin');
-- Reservation statuses
CREATE TYPE gsb_reservation_status AS ENUM ('confirmed', 'cancelled', 'completed');

-- ### Tables

-- 1. Companies Table: Stores information about participating companies.
CREATE TABLE gsb_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL UNIQUE
);
COMMENT ON TABLE gsb_companies IS 'Stores information about participating companies.';

-- 2. Users Table: Extends Supabase auth.users with app-specific data.
CREATE TABLE gsb_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    full_name TEXT,
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE,
    company_id UUID REFERENCES gsb_companies(id) ON DELETE SET NULL,
    role gsb_user_role NOT NULL DEFAULT 'employee',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE gsb_users IS 'Extends Supabase auth.users with app-specific data like roles and company info.';

-- 3. Routes Table: Defines the shuttle routes.
CREATE TABLE gsb_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    description TEXT
);
COMMENT ON TABLE gsb_routes IS 'Defines the shuttle routes.';

-- 4. Stops Table: Defines the stops for each route.
CREATE TABLE gsb_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    route_id UUID NOT NULL REFERENCES gsb_routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    stop_order INT NOT NULL -- Defines the sequence of stops in a route
);
COMMENT ON TABLE gsb_stops IS 'Defines the stops for each route.';

-- 5. Schedules Table: Defines the schedule for each route.
CREATE TABLE gsb_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    route_id UUID NOT NULL REFERENCES gsb_routes(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    total_seats INT NOT NULL DEFAULT 45,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE gsb_schedules IS 'Defines the schedule for each route.';

-- 6. Reservations Table: Stores user reservations.
CREATE TABLE gsb_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES gsb_users(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES gsb_schedules(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    status gsb_reservation_status NOT NULL DEFAULT 'confirmed',
    qr_code TEXT UNIQUE,
    CONSTRAINT unique_reservation_per_day UNIQUE (user_id, reservation_date, schedule_id)
);
COMMENT ON TABLE gsb_reservations IS 'Stores user reservations.';

-- 7. Boarding Records Table: Logs when a user boards a shuttle.
CREATE TABLE gsb_boarding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reservation_id UUID NOT NULL REFERENCES gsb_reservations(id) ON DELETE CASCADE,
    boarded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE gsb_boarding_records IS 'Logs when a user boards a shuttle by scanning the QR code.';

-- 8. Rewards Table: Stores rewards/coupons issued to users.
CREATE TABLE gsb_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES gsb_users(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE gsb_rewards IS 'Stores rewards/coupons issued to users.';

-- ### Functions and Triggers
-- A function to create a gsb_user profile when a new user signs up in auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.gsb_users (id, email, phone_number, full_name)
  VALUES (new.id, new.email, new.phone, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ### Row Level Security (RLS) Policies
-- Enable RLS for all tables. Policies should be added next.
ALTER TABLE gsb_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsb_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsb_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsb_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsb_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsb_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsb_boarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsb_rewards ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed):
-- Allow public read access to routes, stops, and schedules
CREATE POLICY "Allow public read access" ON gsb_routes FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON gsb_stops FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON gsb_schedules FOR SELECT USING (true);

-- Users can view their own user data
CREATE POLICY "Users can view their own data" ON gsb_users FOR SELECT USING (auth.uid() = id);
-- Users can update their own data
CREATE POLICY "Users can update their own data" ON gsb_users FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own reservations
CREATE POLICY "Users can manage their own reservations" ON gsb_reservations
  FOR ALL USING (auth.uid() = user_id);

-- Users can view their own rewards
CREATE POLICY "Users can view their own rewards" ON gsb_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Admins (operations_admin) can manage everything
CREATE POLICY "Allow full access to operations_admin" ON gsb_companies FOR ALL USING ( (SELECT role FROM gsb_users WHERE id = auth.uid()) = 'operations_admin' );
CREATE POLICY "Allow full access to operations_admin" ON gsb_routes FOR ALL USING ( (SELECT role FROM gsb_users WHERE id = auth.uid()) = 'operations_admin' );
CREATE POLICY "Allow full access to operations_admin" ON gsb_stops FOR ALL USING ( (SELECT role FROM gsb_users WHERE id = auth.uid()) = 'operations_admin' );
CREATE POLICY "Allow full access to operations_admin" ON gsb_schedules FOR ALL USING ( (SELECT role FROM gsb_users WHERE id = auth.uid()) = 'operations_admin' );
-- Add more admin policies for other tables...
```
