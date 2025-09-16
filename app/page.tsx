import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('gsb_users')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role || null;
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">GSB 셔틀 예약 시스템에 오신 것을 환영합니다.</h1>
      <p className="text-lg text-gray-600 mb-8">
        기업 공동 셔틀을 이용하여 편리하고 스마트한 출퇴근을 경험하세요.
      </p>

      {user ? (
        <div className="space-y-4">
          <p>어떤 작업을 하시겠어요?</p>
          <div className="flex justify-center gap-4">
            {role === 'employee' && (
              <Link href="/my-reservations" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 text-lg">
                내 예약 확인하기
              </Link>
            )}
            {role === 'company_admin' && (
              <Link href="/admin/company" className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 text-lg">
                기업 관리자 대시보드
              </Link>
            )}
            {role === 'operations_admin' && (
              <Link href="/admin/operations" className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 text-lg">
                운영 관리자 대시보드
              </Link>
            )}
            <Link href="/routes" className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 text-lg">
              전체 노선 보기
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Link href="/routes" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 text-lg">
            운행 노선 보러가기
          </Link>
          <Link href="/auth" className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 text-lg">
            로그인 / 회원가입
          </Link>
        </div>
      )}
    </div>
  );
}
