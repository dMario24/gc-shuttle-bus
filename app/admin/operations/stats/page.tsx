import { createClient } from '@/lib/supabase/server';

type RouteStat = {
  route_id: string;
  route_name: string;
  reservation_count: number;
};

type DailyStat = {
  reservation_day: string;
  reservation_count: number;
};

type OccupancyStat = {
  total_seats: number;
  total_reservations: number;
  occupancy_rate: number;
};

export default async function StatsPage() {
  const supabase = createClient();

  // 1. Daily usage statistics
  const { data: dailyStatsData, error: dailyStatsError } = await supabase.rpc('get_daily_reservation_counts');
  const dailyStats = dailyStatsData as DailyStat[];

  // 2. Route popularity
  const { data: routeStatsData, error: routeStatsError } = await supabase.rpc('get_route_reservation_counts');
  const routeStats = routeStatsData as RouteStat[];

  // 3. Overall seat occupancy
  const { data: occupancyData, error: occupancyError } = await supabase.rpc('get_overall_seat_occupancy');
  const occupancy = occupancyData as OccupancyStat[];

  if (dailyStatsError || routeStatsError || occupancyError) {
    return (
      <p className="text-red-500">
        Error loading stats: {dailyStatsError?.message || routeStatsError?.message || occupancyError?.message}
      </p>
    );
  }

  const overallOccupancy = occupancy && occupancy.length > 0 ? occupancy[0] : { total_seats: 0, total_reservations: 0, occupancy_rate: 0 };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">운영 통계</h1>
        <p className="text-gray-600">플랫폼의 주요 이용 현황을 확인합니다.</p>
      </div>

      {/* Overall Occupancy */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">전체 좌석 점유율</h2>
        <div className="flex items-baseline space-x-2">
            <p className="text-4xl font-bold">
                {((overallOccupancy.occupancy_rate || 0) * 100).toFixed(2)}%
            </p>
            <p className="text-gray-500">
                ({overallOccupancy.total_reservations} / {overallOccupancy.total_seats} 좌석)
            </p>
        </div>
      </div>


      {/* Route Popularity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">노선별 예약 순위</h2>
        <ul className="space-y-3">
          {routeStats && routeStats.length > 0 ? routeStats.map((route, index) => (
            <li key={route.route_id} className="flex items-center justify-between">
              <span className="font-medium">{index + 1}. {route.route_name}</span>
              <span className="font-bold">{route.reservation_count}건</span>
            </li>
          )) : <p>데이터가 없습니다.</p>}
        </ul>
      </div>

      {/* Daily Usage */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">일별 예약 현황 (최근 30일)</h2>
        <div className="space-y-3">
            {dailyStats && dailyStats.length > 0 ? dailyStats.map(stat => (
                <div key={stat.reservation_day} className="flex justify-between items-center">
                    <span>{new Date(stat.reservation_day).toLocaleDateString()}</span>
                    <span>{stat.reservation_count}건</span>
                </div>
            )) : <p>데이터가 없습니다.</p>}
        </div>
      </div>
    </div>
  );
}
