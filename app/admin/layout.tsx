import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?message=로그인이 필요합니다.');
  }

  const { data: profile } = await supabase
    .from('gsb_users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role;
  const isAdmin = userRole === 'operations_admin' || userRole === 'company_admin';

  if (!isAdmin) {
    redirect('/?error=관리자 권한이 없습니다.');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-800 text-white flex-shrink-0">
        <div className="p-4">
          <h2 className="text-xl font-bold">관리자 메뉴</h2>
        </div>
        <nav className="flex flex-col p-2 space-y-1">
          {userRole === 'operations_admin' && (
            <>
              <Link href="/admin/operations" className="block p-2 rounded-md hover:bg-gray-700">운영 대시보드</Link>
              <Link href="/admin/operations/routes" className="block p-2 rounded-md hover:bg-gray-700">노선/스케줄 관리</Link>
              {/* <Link href="/admin/operations/users" className="block p-2 rounded-md hover:bg-gray-700">사용자 관리</Link> */}
              {/* <Link href="/admin/operations/stats" className="block p-2 rounded-md hover:bg-gray-700">통계</Link> */}
            </>
          )}
          {userRole === 'company_admin' && (
            <>
              <Link href="/admin/company" className="block p-2 rounded-md hover:bg-gray-700">기업 대시보드</Link>
              {/* <Link href="/admin/company/employees" className="block p-2 rounded-md hover:bg-gray-700">직원 관리</Link> */}
              {/* <Link href="/admin/company/stats" className="block p-2 rounded-md hover:bg-gray-700">이용 통계</Link> */}
            </>
          )}
        </nav>
      </aside>
      <div className="flex-1 bg-gray-100 p-6">
        {children}
      </div>
    </div>
  );
}
