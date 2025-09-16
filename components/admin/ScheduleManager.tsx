'use client';

import { useFormState } from 'react-dom';
import { useTransition } from 'react';
import { addScheduleToRoute, deleteSchedule } from '@/app/admin/operations/routes/actions';
import { Database } from '@/types/database';

type Schedule = Database['public']['Tables']['gsb_schedules']['Row'];

export default function ScheduleManager({ routeId, schedules }: { routeId: string; schedules: Schedule[] }) {
  const [addFormState, addFormAction] = useFormState(addScheduleToRoute, { errors: {} });
  const [isPending, startTransition] = useTransition();

  const handleDelete = (scheduleId: string) => {
    if (confirm('정말로 이 스케줄을 삭제하시겠습니까? 이 스케줄에 대한 예약이 있을 경우 실패할 수 있습니다.')) {
      startTransition(async () => {
        await deleteSchedule(scheduleId, routeId);
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">스케줄 관리</h3>
      <form action={addFormAction} className="flex items-end gap-2 p-4 border rounded-lg bg-gray-50">
        <input type="hidden" name="route_id" value={routeId} />
        <div className="flex-1">
          <label htmlFor="departure_time" className="block text-sm font-medium">출발 시간 (HH:MM)</label>
          <input type="time" name="departure_time" id="departure_time" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          {addFormState.errors?.departure_time && <p className="text-sm text-red-500">{addFormState.errors.departure_time}</p>}
        </div>
        <div className="w-24">
          <label htmlFor="total_seats" className="block text-sm font-medium">총 좌석</label>
          <input type="number" name="total_seats" id="total_seats" defaultValue={45} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          {addFormState.errors?.total_seats && <p className="text-sm text-red-500">{addFormState.errors.total_seats}</p>}
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">추가</button>
      </form>

      <div className="space-y-2">
        {schedules.sort((a,b) => a.departure_time.localeCompare(b.departure_time)).map(schedule => (
          <div key={schedule.id} className="flex justify-between items-center p-2 border rounded-md">
            <span>{schedule.departure_time.substring(0,5)} (총 {schedule.total_seats}석)</span>
            <button onClick={() => handleDelete(schedule.id)} disabled={isPending} className="text-xs text-red-500 hover:text-red-700">삭제</button>
          </div>
        ))}
        {schedules.length === 0 && <p className="text-sm text-gray-500">등록된 스케줄이 없습니다.</p>}
      </div>
    </div>
  );
}
