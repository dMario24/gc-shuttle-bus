import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ApproveButton } from './employees/_components/ApproveButton';

async function getCompanyData(user: any) {
    const supabase = createClient();

    const { data: adminProfile, error: adminError } = await supabase
        .from('gsb_users')
        .select('company_id')
        .eq('id', user.id)
        .single();

    if (adminError || !adminProfile?.company_id) {
        throw new Error("소속된 회사를 찾을 수 없거나, 회사 관리자가 아닙니다.");
    }

    const companyId = adminProfile.company_id;

    const { data: employees, error: employeesError } = await supabase
        .from('gsb_users')
        .select('id, full_name, email, is_approved')
        .eq('company_id', companyId)
        .order('full_name');

    if (employeesError) throw new Error("직원 정보를 불러오는 데 실패했습니다.");

    const { data: company, error: companyError } = await supabase
        .from('gsb_companies')
        .select('name')
        .eq('id', companyId)
        .single();

    if (companyError) throw new Error("회사 정보를 불러오는 데 실패했습니다.");

    // Fetch stats
    const approvedEmployeeIds = employees.filter(e => e.is_approved).map(e => e.id);
    const { count: reservationCount, error: reservationError } = await supabase
        .from('gsb_reservations')
        .select('*', { count: 'exact', head: true })
        .in('user_id', approvedEmployeeIds);

    return {
        employees,
        companyName: company?.name || '내 회사',
        companyId,
        stats: {
            totalEmployees: employees.length,
            approvedEmployees: approvedEmployeeIds.length,
            totalReservations: reservationError ? 'N/A' : reservationCount,
        }
    };
}



export default async function CompanyAdminDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    try {
        const { employees, companyName, companyId, stats } = await getCompanyData(user);

        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">{companyName} 관리</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm font-medium text-gray-500">총 직원</h3>
                        <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm font-medium text-gray-500">승인된 직원</h3>
                        <p className="text-3xl font-bold">{stats.approvedEmployees}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm font-medium text-gray-500">총 예약 건수</h3>
                        <p className="text-3xl font-bold">{stats.totalReservations}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">직원 목록</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map(e => (
                                    <tr key={e.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{e.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{e.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                e.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {e.is_approved ? '승인됨' : '승인 대기'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {!e.is_approved && <ApproveButton employeeId={e.id} companyId={companyId} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } catch (e: any) {
        return <p className="text-red-500">{e.message}</p>;
    }
}
