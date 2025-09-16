import { createClient } from '@/lib/supabase/server';
import { UserRow } from './_components/UserRow';

export default async function UsersPage() {
  const supabase = createClient();

  const { data: users, error: usersError } = await supabase
    .from('gsb_users')
    .select(`
      id,
      full_name,
      email,
      role,
      is_approved,
      company_id,
      gsb_companies ( name )
    `)
    .order('created_at', { ascending: false });

  const { data: companies, error: companiesError } = await supabase
    .from('gsb_companies')
    .select('id, name')
    .order('name');

  if (usersError || companiesError) {
    return (
      <p className="text-red-500">
        Error loading data: {usersError?.message || companiesError?.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <p className="text-gray-600">전체 사용자의 역할을 변경하거나 가입을 승인합니다.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-semibold">이름</th>
                <th className="p-3 text-left font-semibold">이메일</th>
                <th className="p-3 text-left font-semibold">소속 회사</th>
                <th className="p-3 text-left font-semibold">역할</th>
                <th className="p-3 text-left font-semibold">승인 상태</th>
                <th className="p-3 text-left font-semibold">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <UserRow key={user.id} user={user} companies={companies} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
