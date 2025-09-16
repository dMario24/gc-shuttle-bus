import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ApproveButton } from './_components/ApproveButton';

export default async function EmployeeApprovalPage() {
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
        <h1 className="text-2xl font-bold">직원 승인</h1>
        <p className="text-red-500 mt-4">
          소속된 회사가 없거나, 회사 관리자 권한이 없습니다.
        </p>
      </div>
    );
  }

  const { data: employees, error } = await supabase
    .from('gsb_users')
    .select('id, full_name, email, created_at')
    .eq('company_id', adminProfile.company_id)
    .eq('is_approved', false)
    .order('created_at', { ascending: true });

  if (error) {
    return <p className="text-red-500">직원 목록을 불러오는 중 오류 발생: {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">직원 승인</h1>
        <p className="text-gray-600">
          <span className="font-semibold">{adminProfile.gsb_companies?.[0]?.name}</span> 소속으로 가입을 신청한 직원 목록입니다.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-semibold">이름</th>
                <th className="p-3 text-left font-semibold">이메일</th>
                <th className="p-3 text-left font-semibold">신청일</th>
                <th className="p-3 text-center font-semibold">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="p-3">{employee.full_name}</td>
                    <td className="p-3">{employee.email}</td>
                    <td className="p-3">{new Date(employee.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <ApproveButton employeeId={employee.id} companyId={adminProfile.company_id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    승인 대기 중인 직원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
