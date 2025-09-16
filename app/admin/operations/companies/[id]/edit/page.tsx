import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditCompanyClientPage from './EditCompanyClientPage';

interface EditCompanyPageProps {
  params: { id: string };
}

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const supabase = createClient();
  const { data: company, error } = await supabase
    .from('gsb_companies')
    .select('id, name')
    .eq('id', params.id)
    .single();

  if (error || !company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/operations/companies" className="text-sm text-blue-600 hover:underline">
          &larr; 기업 관리로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold mt-2">기업 정보 수정</h1>
        <p className="text-gray-600">기업의 이름을 변경합니다.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <EditCompanyClientPage company={company} />
      </div>
    </div>
  );
}
