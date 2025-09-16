import { createClient } from '@/lib/supabase/server';
import { CreateCompanyForm } from './_components/CreateCompanyForm';
import { DeleteCompanyButton } from './_components/DeleteCompanyButton';

export default async function CompaniesPage() {
  const supabase = createClient();
  const { data: companies, error } = await supabase
    .from('gsb_companies')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return <p className="text-red-500">Error loading companies: {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">기업 관리</h1>
        <p className="text-gray-600">새로운 기업을 추가하거나 기존 기업을 관리합니다.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">새 기업 추가</h2>
        <CreateCompanyForm />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">기업 목록</h2>
        <div className="space-y-4">
          {companies.length > 0 ? (
            companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-md">
                <p className="font-medium">{company.name}</p>
                <div className="flex items-center space-x-2">
                  <a href={`/admin/operations/companies/${company.id}/edit`} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                    수정
                  </a>
                  <DeleteCompanyButton companyId={company.id} />
                </div>
              </div>
            ))
          ) : (
            <p>등록된 기업이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
