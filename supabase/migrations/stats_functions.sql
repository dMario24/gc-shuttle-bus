-- 1. Function to get daily reservation counts for the last 30 days
CREATE OR REPLACE FUNCTION get_daily_reservation_counts()
RETURNS TABLE (
  reservation_day DATE,
  reservation_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.reservation_date AS reservation_day,
    COUNT(r.id) AS reservation_count
  FROM
    gsb_reservations r
  WHERE
    r.status = 'confirmed' AND
    r.reservation_date >= (now() - INTERVAL '30 days')::date
  GROUP BY
    r.reservation_date
  ORDER BY
    r.reservation_date DESC;
END;
$$ LANGUAGE plpgsql;


-- 2. Function to get reservation counts per route
CREATE OR REPLACE FUNCTION get_route_reservation_counts()
RETURNS TABLE (
  route_id UUID,
  route_name TEXT,
  reservation_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS route_id,
    r.name AS route_name,
    COUNT(res.id) AS reservation_count
  FROM
    gsb_routes r
  JOIN
    gsb_schedules s ON r.id = s.route_id
  JOIN
    gsb_reservations res ON s.id = res.schedule_id
  WHERE
    res.status = 'confirmed'
  GROUP BY
    r.id, r.name
  ORDER BY
    reservation_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to get overall seat occupancy
CREATE OR REPLACE FUNCTION get_overall_seat_occupancy()
RETURNS TABLE (
  total_seats BIGINT,
  total_reservations BIGINT,
  occupancy_rate NUMERIC
) AS $$
DECLARE
    total_potential_seats BIGINT;
    confirmed_reservations BIGINT;
BEGIN
    -- Calculate total potential seats from all active schedules
    SELECT COALESCE(SUM(total_seats), 0)
    INTO total_potential_seats
    FROM gsb_schedules
    WHERE is_active = true;

    -- Calculate total confirmed reservations
    SELECT COUNT(*)
    INTO confirmed_reservations
    FROM gsb_reservations
    WHERE status = 'confirmed';

    RETURN QUERY
    SELECT
        total_potential_seats,
        confirmed_reservations,
        CASE
            WHEN total_potential_seats > 0 THEN
                CAST(confirmed_reservations AS NUMERIC) / total_potential_seats
            ELSE
                0
        END AS occupancy_rate;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get reservation stats for a specific company
CREATE OR REPLACE FUNCTION get_company_stats(p_company_id UUID)
RETURNS TABLE (
  total_employees BIGINT,
  total_reservations BIGINT,
  most_popular_route_name TEXT,
  most_popular_route_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM gsb_users WHERE company_id = p_company_id) AS total_employees,
    (
      SELECT COUNT(*)
      FROM gsb_reservations res
      JOIN gsb_users u ON res.user_id = u.id
      WHERE u.company_id = p_company_id AND res.status = 'confirmed'
    ) AS total_reservations,
    (
      SELECT r.name
      FROM gsb_reservations res
      JOIN gsb_users u ON res.user_id = u.id
      JOIN gsb_schedules s ON res.schedule_id = s.id
      JOIN gsb_routes r ON s.route_id = r.id
      WHERE u.company_id = p_company_id AND res.status = 'confirmed'
      GROUP BY r.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS most_popular_route_name,
    (
      SELECT COUNT(*)
      FROM gsb_reservations res
      JOIN gsb_users u ON res.user_id = u.id
      JOIN gsb_schedules s ON res.schedule_id = s.id
      JOIN gsb_routes r ON s.route_id = r.id
      WHERE u.company_id = p_company_id AND res.status = 'confirmed'
      GROUP BY r.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS most_popular_route_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to find users with 5 consecutive days of boarding records
CREATE OR REPLACE FUNCTION find_consecutive_boarders(p_consecutive_days INT)
RETURNS TABLE (
  user_id UUID
) AS $$
WITH dates AS (
  SELECT
    br.user_id,
    br.boarded_at::date AS boarding_date,
    DENSE_RANK() OVER (PARTITION BY br.user_id ORDER BY br.boarded_at::date) AS rn
  FROM
    gsb_boarding_records br
  GROUP BY
    br.user_id, br.boarded_at::date
),
streaks AS (
  SELECT
    user_id,
    boarding_date,
    (boarding_date - INTERVAL '1 day' * rn)::date AS streak_group
  FROM
    dates
)
SELECT
  s.user_id
FROM
  streaks s
GROUP BY
  s.user_id, s.streak_group
HAVING
  COUNT(*) >= p_consecutive_days
EXCEPT
-- Exclude users who have already been issued a reward for this streak
SELECT
  r.user_id
FROM
  gsb_rewards r
WHERE
  r.created_at >= (now() - INTERVAL '7 days'); -- Avoid re-issuing rewards too frequently
$$ LANGUAGE plpgsql;
