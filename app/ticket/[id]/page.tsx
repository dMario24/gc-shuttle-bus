import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import QRCodeDisplay from '@/components/ticket/QRCodeDisplay';
import { User } from '@supabase/supabase-js';

type TicketDetails = {
  qr_code: string | null;
  reservation_date: string;
  status: string;
  gsb_users: {
    full_name: string | null;
  }[] | null;
  gsb_schedules: {
    departure_time: string;
    gsb_routes: {
      name: string;
    }[] | null;
  }[] | null;
};

async function getTicketDetails(reservationId: string, user: User): Promise<TicketDetails> {
  const supabase = createClient();

  const { data: reservation, error } = await supabase
    .from('gsb_reservations')
    .select(`
        qr_code,
        reservation_date,
        status,
        gsb_users ( full_name ),
        gsb_schedules (
            departure_time,
            gsb_routes ( name )
        )
    `)
    .eq('id', reservationId)
    .eq('user_id', user.id)
    .single();

  if (error || !reservation) {
    console.error("Ticket fetch error or not found:", error);
    notFound();
  }

  return reservation as TicketDetails;
}

export default async function TicketPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const ticket = await getTicketDetails(params.id, user);

  const isTicketActive = ticket.status === 'confirmed' && new Date(ticket.reservation_date) >= new Date(new Date().toDateString());

  return (
    <div className="max-w-sm mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      <div className="bg-indigo-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">모바일 탑승권</h1>
      </div>

      {isTicketActive && ticket.qr_code ? (
        <div className="p-6 flex flex-col items-center justify-center">
          <QRCodeDisplay value={ticket.qr_code} />
          <p className="mt-4 text-sm text-gray-600">탑승 시 이 QR 코드를 스캔하세요.</p>
        </div>
      ) : (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">만료되었거나 유효하지 않은 탑승권</h2>
          <p className="text-gray-600">이 탑승권은 사용할 수 없습니다.</p>
        </div>
      )}

      <div className="border-t border-dashed p-6 space-y-3 bg-gray-50">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">승객명</span>
          <span className="font-medium">{ticket.gsb_users?.[0]?.full_name || user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">노선</span>
          <span className="font-medium">{ticket.gsb_schedules?.[0]?.gsb_routes?.[0]?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">탑승일</span>
          <span className="font-medium">{ticket.reservation_date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">출발시간</span>
          <span className="font-medium">{ticket.gsb_schedules?.[0]?.departure_time.substring(0, 5)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">상태</span>
          <span className={`font-medium text-sm px-2 py-0.5 rounded-full ${
            isTicketActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isTicketActive ? '사용 가능' : '사용 불가'}
          </span>
        </div>
      </div>
    </div>
  );
}
