'use client';

import { useFormState } from 'react-dom';
import { useTransition } from 'react';
import { addStopToRoute, removeStopFromRoute } from '@/app/admin/operations/routes/actions';
import { Database } from '@/types/database';

type Stop = Database['public']['Tables']['gsb_stops']['Row'];

export default function StopManager({ routeId, stops }: { routeId: string; stops: Stop[] }) {
  const [addFormState, addFormAction] = useFormState(addStopToRoute, { errors: {} });
  const [isPending, startTransition] = useTransition();

  const handleDelete = (stopId: string) => {
    if (confirm('정말로 이 정류장을 삭제하시겠습니까?')) {
      startTransition(async () => {
        await removeStopFromRoute(stopId, routeId);
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">정류장 관리</h3>
      <form action={addFormAction} className="flex items-end gap-2 p-4 border rounded-lg bg-gray-50">
        <input type="hidden" name="route_id" value={routeId} />
        <div className="flex-1">
          <label htmlFor="stop_name" className="block text-sm font-medium">정류장 이름</label>
          <input type="text" name="name" id="stop_name" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          {addFormState.errors?.name && <p className="text-sm text-red-500">{addFormState.errors.name}</p>}
        </div>
        <div className="w-24">
          <label htmlFor="stop_order" className="block text-sm font-medium">순서</label>
          <input type="number" name="stop_order" id="stop_order" defaultValue={stops.length} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          {addFormState.errors?.stop_order && <p className="text-sm text-red-500">{addFormState.errors.stop_order}</p>}
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">추가</button>
      </form>

      <div className="space-y-2">
        {stops.sort((a,b) => a.stop_order - b.stop_order).map(stop => (
          <div key={stop.id} className="flex justify-between items-center p-2 border rounded-md">
            <span>{stop.stop_order}. {stop.name}</span>
            <button onClick={() => handleDelete(stop.id)} disabled={isPending} className="text-xs text-red-500 hover:text-red-700">삭제</button>
          </div>
        ))}
        {stops.length === 0 && <p className="text-sm text-gray-500">등록된 정류장이 없습니다.</p>}
      </div>
    </div>
  );
}
