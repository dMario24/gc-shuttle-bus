import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ReservationForm from '@/components/reservations/ReservationForm';
import { RouteWithStopsAndSchedules } from '../routes/page';

async function getRouteDetails(routeId: string): Promise<RouteWithStopsAndSchedules> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gsb_routes')
    .select(`
      *,
      gsb_schedules (*)
    `)
    .eq('id', routeId)
    .single();

  if (error || !data) {
    console.error('Failed to fetch route details:', error);
    notFound();
  }

  data.gsb_schedules.sort((a, b) => a.departure_time.localeCompare(b.departure_time));

  return data as unknown as RouteWithStopsAndSchedules;
}

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: { route_id?: string };
}) {
  const routeId = searchParams.route_id;

  if (!routeId) {
    return (
      <p className="text-red-500 text-center">
        잘못된 접근입니다. 예약할 노선을 선택해주세요.
      </p>
    );
  }

  const route = await getRouteDetails(routeId);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This should be handled by middleware, but as a fallback
    return (
      <p className="text-red-500 text-center">
        예약을 하려면 먼저 로그인해야 합니다.
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">"{route.name}" 노선 예약</h1>
      <p className="text-gray-600 mb-6">예약할 날짜와 시간을 선택해주세요.</p>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <ReservationForm route={route} user={user} />
      </div>
    </div>
  );
}
