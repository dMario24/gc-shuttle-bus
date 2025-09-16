'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateRoute, type RouteState } from '@/app/admin/operations/routes/actions';
import { Database } from '@/types/database';
import Link from 'next/link';

type Route = Database['public']['Tables']['gsb_routes']['Row'];

const initialState: RouteState = {
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
    >
      {pending ? '저장 중...' : '변경사항 저장'}
    </button>
  );
}

export default function EditRouteForm({ route }: { route: Route }) {
  const [state, formAction] = useFormState(updateRoute, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={route.id} />
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">노선명</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={route.name}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {state.errors?.name && <p className="text-sm text-red-500 mt-1">{state.errors.name.join(', ')}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={route.description || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {state.errors?.description && <p className="text-sm text-red-500 mt-1">{state.errors.description.join(', ')}</p>}
      </div>
      <div className="flex items-center gap-4">
        <SubmitButton />
        <Link href="/admin/operations/routes" className="text-sm text-gray-600 hover:underline">
          취소
        </Link>
      </div>
      {state.errors?._form && <p className="text-sm text-red-500 mt-2">{state.errors._form}</p>}
      {state.message && <p className="text-sm text-green-500 mt-2">{state.message}</p>}
    </form>
  );
}
