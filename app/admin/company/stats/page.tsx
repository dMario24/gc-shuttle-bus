import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CompanyStatsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: adminProfile } = await supabase
    .from('gsb_users')
    .select('company_id, gsb_companies(name)')
    .eq('id', user.id)
    .single();

  if (!adminProfile || !adminProfile.company_id) {
    return (
      <div>
        <h1 className="text-2xl font-bold">이용 통계</h1>
        <p className="text-red-500 mt-4">
          소속된 회사가 없거나, 회사 관리자 권한이 없습니다.
        </p>
      </div>
    );
  }

  const { data: stats, error } = await supabase
    .rpc('get_company_stats', { p_company_id: adminProfile.company_id })
    .single();

  if (error) {
    return <p className="text-red-500">통계 정보를 불러오는 중 오류 발생: {error.message}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{adminProfile.gsb_companies?.name} 이용 통계</h1>
        <p className="text-gray-600">자사 직원의 셔틀 이용 현황입니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Employees */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-500">총 직원 수</h2>
          <p className="text-3xl font-bold mt-2">{stats.total_employees}명</p>
        </div>

        {/* Total Reservations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-500">총 예약 건수</h2>
          <p className="text-3xl font-bold mt-2">{stats.total_reservations}건</p>
        </div>

        {/* Most Popular Route */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-500">가장 인기 있는 노선</h2>
          {stats.most_popular_route_name ? (
            <>
              <p className="text-3xl font-bold mt-2">{stats.most_popular_route_name}</p>
              <p className="text-sm text-gray-500">{stats.most_popular_route_count}건</p>
            </>
          ) : (
            <p className="text-xl font-bold mt-2">데이터 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}
