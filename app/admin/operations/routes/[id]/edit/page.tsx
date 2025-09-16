import { createClient } from '@/lib/supabase/server';
import EditRouteForm from '@/components/admin/EditRouteForm';
import { notFound } from 'next/navigation';
import StopManager from '@/components/admin/StopManager';
import ScheduleManager from '@/components/admin/ScheduleManager';

async function getRoute(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gsb_routes')
    .select(`
      *,
      gsb_stops (*),
      gsb_schedules (*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }
  return data;
}

export default async function EditRoutePage({ params }: { params: { id: string } }) {
  const route = await getRoute(params.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">노선 수정: {route.name}</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
        <EditRouteForm route={route} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <StopManager routeId={route.id} stops={route.gsb_stops} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <ScheduleManager routeId={route.id} schedules={route.gsb_schedules} />
      </div>
    </div>
  );
}
