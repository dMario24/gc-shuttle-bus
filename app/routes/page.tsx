import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import Link from 'next/link';

// Define a more specific type for the data we are fetching.
export type RouteWithStopsAndSchedules = Database['public']['Tables']['gsb_routes']['Row'] & {
  gsb_stops: Database['public']['Tables']['gsb_stops']['Row'][];
  gsb_schedules: Database['public']['Tables']['gsb_schedules']['Row'][];
};

async function getRoutes(): Promise<RouteWithStopsAndSchedules[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gsb_routes')
    .select(`
      *,
      gsb_stops (
        *
      ),
      gsb_schedules (
        *
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching routes:', error.message);
    throw new Error('노선 정보를 불러오는 데 실패했습니다.');
  }

  // Sort stops and schedules
  data.forEach(route => {
    route.gsb_stops.sort((a, b) => a.stop_order - b.stop_order);
    route.gsb_schedules.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  });

  return data;
}

export default async function RoutesPage() {
  let routes: RouteWithStopsAndSchedules[] = [];
  let error: string | null = null;

  try {
    routes = await getRoutes();
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">전체 셔틀 노선</h1>

      {error && <p className="text-center text-red-500">{error}</p>}

      {!error && routes.length === 0 && (
        <p className="text-center text-gray-500 py-8">현재 운행 중인 노선이 없습니다.</p>
      )}

      {!error && routes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">{route.name}</h2>
                <p className="text-gray-600 mb-4 text-sm">{route.description || '노선 설명이 없습니다.'}</p>

                <div className="mb-4">
                  <h3 className="font-bold text-sm mb-2">주요 정류장</h3>
                  <ol className="list-decimal list-inside text-sm text-gray-500 space-y-1">
                    {route.gsb_stops.slice(0, 5).map(stop => <li key={stop.id}>{stop.name}</li>)}
                    {route.gsb_stops.length > 5 && <li className="text-xs">...외 {route.gsb_stops.length - 5}개</li>}
                  </ol>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-sm mb-2">운행 시간</h3>
                  <div className="flex flex-wrap gap-2">
                    {route.gsb_schedules.map(schedule => (
                      <span key={schedule.id} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {schedule.departure_time.substring(0, 5)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link href={`/reservations/new?route_id=${route.id}`} className="mt-4 block w-full text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700">
                이 노선 예약하기
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
