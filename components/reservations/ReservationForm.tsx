'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createReservation } from '@/app/actions/reservations';
import type { RouteWithStopsAndSchedules } from '@/app/routes/page';
import type { User } from '@supabase/supabase-js';
import { useState } from 'react';

type ReservationFormProps = {
  route: RouteWithStopsAndSchedules;
  user: User;
};

const initialState: { error?: string | null } = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      {pending ? '예약 처리 중...' : '예약 확정하기'}
    </button>
  );
}

export default function ReservationForm({ route, user }: ReservationFormProps) {
  const [formState, formAction] = useFormState(createReservation, initialState);
  const [reservationDate, setReservationDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="route_id" value={route.id} />

      <div>
        <label htmlFor="reservation_date" className="block text-sm font-medium text-gray-700 mb-1">
          예약 날짜
        </label>
        <input
          type="date"
          id="reservation_date"
          name="reservation_date"
          value={reservationDate}
          onChange={(e) => setReservationDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="schedule_id" className="block text-sm font-medium text-gray-700 mb-1">
          출발 시간
        </label>
        <select
          id="schedule_id"
          name="schedule_id"
          defaultValue=""
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="" disabled>시간을 선택하세요</option>
          {route.gsb_schedules.map(schedule => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.departure_time.substring(0, 5)}
            </option>
          ))}
        </select>
      </div>

      {formState?.error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {formState.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
