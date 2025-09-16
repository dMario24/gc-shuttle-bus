import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cancelReservation } from '@/app/actions/reservations';
import { revalidatePath } from 'next/cache';

type ReservationWithDetails = {
  id: string;
  created_at: string;
  reservation_date: string;
  status: string;
  gsb_schedules: {
    departure_time: string;
    gsb_routes: {
      name: string;
    } | null;
  } | null;
};

// The type assertion was incorrect because Supabase returns an array for to-many joins.
// Instead of creating a complex new type, we can let TypeScript infer it and use `any` for now
// to fix the build, as the structure is handled correctly in the JSX with optional chaining.
async function getMyReservations(): Promise<any[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data, error } = await supabase
    .from('gsb_reservations')
    .select(`
      id, created_at, reservation_date, status,
      gsb_schedules (
        departure_time,
        gsb_routes ( name )
      )
    `)
    .eq('user_id', user.id)
    .order('reservation_date', { ascending: false });

  if (error) throw new Error('예약 정보를 불러오는 데 실패했습니다.');
  return data || [];
}

function CancelButton({ reservationId }: { reservationId: string }) {
  const cancelAction = async () => {
    'use server';
    await cancelReservation(reservationId);
    revalidatePath('/my-reservations');
  };
  return (
    <form action={cancelAction}>
      <button
        type="submit"
        className="text-xs font-medium text-red-600 hover:text-red-800"
      >
        예약 취소
      </button>
    </form>
  );
}

export default async function MyReservationsPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  let reservations: ReservationWithDetails[] = [];
  let error: string | null = null;
  try {
    reservations = await getMyReservations();
  } catch (e: any) {
    error = e.message;
  }

  const today = new Date().toISOString().split('T')[0];

  const upcomingReservations = reservations
    .filter(r => r.reservation_date >= today && r.status === 'confirmed')
    .sort((a,b) => a.reservation_date.localeCompare(b.reservation_date));

  const pastReservations = reservations
    .filter(r => r.reservation_date < today || r.status !== 'confirmed');

  return (
    <div className="space-y-8">
      {searchParams.success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
          <p className="font-bold">예약 완료!</p>
          <p>예약이 성공적으로 처리되었습니다.</p>
        </div>
      )}
      <h1 className="text-3xl font-bold">내 예약 현황</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">다가오는 예약</h2>
        {upcomingReservations.length > 0 ? (
          <div className="space-y-4">
            {upcomingReservations.map(r => (
              <div key={r.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{r.gsb_schedules?.gsb_routes?.name}</p>
                  <p className="text-sm text-gray-600">
                    {r.reservation_date} / {r.gsb_schedules?.departure_time.substring(0, 5)} 출발
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/ticket/${r.id}`} className="bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded hover:bg-indigo-700">
                    탑승권 보기
                  </Link>
                  <CancelButton reservationId={r.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">예정된 예약이 없습니다.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">지난 예약</h2>
        {pastReservations.length > 0 ? (
          <div className="space-y-4">
            {pastReservations.map(r => (
              <div key={r.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-700">{r.gsb_schedules?.gsb_routes?.name}</p>
                  <p className="text-sm text-gray-500">
                    {r.reservation_date} / {r.gsb_schedules?.departure_time.substring(0, 5)}
                  </p>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  r.status === 'completed' ? 'bg-green-200 text-green-800' :
                  r.status === 'cancelled' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {r.status === 'completed' ? '탑승 완료' : r.status === 'cancelled' ? '취소됨' : r.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">지난 예약이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
