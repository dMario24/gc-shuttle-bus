import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OperationsAdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // The layout protects this page, but a specific check is good practice.
  if (user) {
    const { data: profile } = await supabase
      .from('gsb_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'operations_admin') {
      redirect('/?error=접근 권한이 없습니다.');
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold">운영 관리자 대시보드</h1>
      <p className="mt-4 text-gray-600">
        이곳에서 노선, 정류장, 스케줄 등 시스템의 주요 데이터를 관리할 수 있습니다.
        <br />
        왼쪽 메뉴를 사용하여 원하는 항목을 관리하세요.
      </p>
      {/* In the future, we can add some quick stats or summary cards here */}
    </div>
  );
}
