import { createClient } from '@/lib/supabase/server';
import CreateRouteForm from '@/components/admin/CreateRouteForm';
import DeleteRouteButton from '@/components/admin/DeleteRouteButton';
import Link from 'next/link';

async function getRoutes() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('gsb_routes')
        .select('*')
        .order('name');
    if (error) {
        console.error("Failed to fetch routes:", error);
        return [];
    }
    return data;
}

export default async function RouteManagementPage() {
    const routes = await getRoutes();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">노선 관리</h1>

            <CreateRouteForm />

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">기존 노선 목록</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">노선명</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {routes.map(route => (
                                <tr key={route.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{route.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <Link href={`/admin/operations/routes/${route.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                            수정
                                        </Link>
                                        <DeleteRouteButton routeId={route.id} routeName={route.name} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {routes.length === 0 && <p className="text-center text-gray-500 py-4">생성된 노선이 없습니다.</p>}
            </div>
        </div>
    )
}
